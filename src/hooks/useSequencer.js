import { useState, useEffect, useRef, useCallback } from "react";
import { instrumentTypes } from "../data/instruments";
import { NOTE_NUM } from "../utils/constants";

export default function useSequencer({ score, currentSet, playSound }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNote, setCurrentNote] = useState(0);
  const bpm = useRef(120);
  const timerId = useRef(null);

  const scheduleSequencer = useCallback(() => {
    const startTime = performance.now();

    const tick = () => {
      const now = performance.now();
      const tickCount = Math.floor(
        (now - startTime) / (1000 / ((bpm.current / 60) * 4))
      );

      // 각 악기 세트별로 현재 세트의 노트를 재생
      Object.values(instrumentTypes).forEach(type => {
        const currentScore = score.current?.[type]?.[currentSet.current?.[type]];
        if (!currentScore) return;
        
        for (const ins in currentScore) {
          const note = currentScore[ins][tickCount % NOTE_NUM];
          if (type === instrumentTypes.DRUM && note) {
            playSound(ins);
          } else if (type === instrumentTypes.BASS && note?.on && note?.groupId !== 0) {
            // 연속된 groupId의 첫 인덱스에서만 playSound 호출
            const prevIdx = (tickCount - 1 + NOTE_NUM) % NOTE_NUM;
            const prevNote = currentScore[ins][prevIdx];
            if (!prevNote.on || prevNote.groupId !== note.groupId) {
              // sustainStep 계산 (현재 인덱스부터 groupId가 같은 구간의 길이)
              let sustainStep = 1;
              for (let j = 1; j < NOTE_NUM; j++) {
                const nextIdx = (tickCount + j) % NOTE_NUM;
                const nextNote = currentScore[ins][nextIdx];
                if (nextNote.on && nextNote.groupId === note.groupId) {
                  sustainStep++;
                } else {
                  break;
                }
              }
              playSound(ins, { 
                currentBpm: bpm.current,
                sustainStep
              });
            }
          }
        }
      });

      setCurrentNote(tickCount % NOTE_NUM);

      const elapsed = now - startTime;
      const nextTickTime = (tickCount + 1) * (1000 / ((bpm.current / 60) * 4));
      const delay = Math.max(0, nextTickTime - elapsed);
      timerId.current = setTimeout(tick, delay);
    };
    tick();
  }, [score, currentSet, playSound]);

  useEffect(() => {
    if (isPlaying) {
      scheduleSequencer();
    }
    return () => {
      if (timerId.current) clearTimeout(timerId.current);
      setCurrentNote(0);
    };
  }, [isPlaying, scheduleSequencer]);

  const startSequencer = () => setIsPlaying(true);
  const stopSequencer = () => setIsPlaying(false);
  const changeBpm = (newBpm) => {
    bpm.current = newBpm;
  };

  return {
    isPlaying,
    currentNote,
    startSequencer,
    stopSequencer,
    changeBpm,
  };
}
