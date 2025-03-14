import { useState, useEffect, useRef, useCallback } from "react";
import { NOTE_NUM } from "../utils/constants";

export default function useSequencer({ score, currentSet, playSound }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNote, setCurrentNote] = useState(0);
  const bpm = useRef(120);
  const timerId = useRef(null);
  const isGoingLeft = useRef(false);

  const scheduleSequencer = useCallback(() => {
    const startTime = performance.now();

    const tick = () => {
      const now = performance.now();
      // 절대 시간 기반으로 tickCount를 계산
      const tickCount = Math.floor(
        (now - startTime) / (1000 / ((bpm.current / 60) * 4))
      );

      const currentScore = score.current[currentSet.current];
      // 현재 세트의 모든 악기에 대해, 해당 노트가 활성화되어 있으면 재생
      for (const ins in currentScore) {
        if (currentScore[ins][tickCount % NOTE_NUM]) {
          // bass 케이스면 BPM 정보 전달
          if (ins.startsWith("bass")) {
            playSound(ins, { currentBpm: bpm.current });
          } else {
            playSound(ins);
          }
        }
      }
      setCurrentNote(tickCount % NOTE_NUM);

      // 다음 틱까지의 남은 시간 계산 (절대 시간 기반)
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

  const stopSequencer = () => {
    setIsPlaying(false);
    if (timerId.current) clearTimeout(timerId.current);
  };

  const changeBpm = (newBpm) => {
    bpm.current = newBpm;
    if (isPlaying) {
      if (timerId.current) clearTimeout(timerId.current);
      setIsPlaying(false);
      setTimeout(() => {
        setIsPlaying(true);
      }, 0);
    }
  };

  return {
    isPlaying,
    currentNote,
    startSequencer,
    stopSequencer,
    changeBpm,
    bpm,
  };
}
