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
        const currentScore = score.current[type][currentSet.current[type]];
        for (const ins in currentScore) {
          if (currentScore[ins][tickCount % NOTE_NUM]) {
            if (ins.startsWith(instrumentTypes.BASS)) {
              playSound(ins, { currentBpm: bpm.current });
            } else {
              playSound(ins);
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
