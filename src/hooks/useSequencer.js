import { useState, useEffect, useRef, useCallback } from "react";
import { NOTE_NUM } from "../utils/constants";

export default function useSequencer({ score, currentSet, playSound }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNote, setCurrentNote] = useState(0);
  const bpm = useRef(120);
  const timerId = useRef(null);
  const isGoingLeft = useRef(false);

  /** setInterval로 하니까 딜레이가 개심해서 절대 시간 기준으로 바꿨음 */
  const scheduleSequencer = useCallback(() => {
    let startTime = Date.now();
    let tickCount = 0;
    // 1박자 간격
    const stepDuration = 1000 / ((bpm.current / 60) * 4);

    const tick = () => {
      // 기대 시각
      const expectedTime = startTime + tickCount * stepDuration;
      // 실제 시간 - 기대 시간 = 드리프트
      const drift = Date.now() - expectedTime;

      const currentScore = score.current[currentSet.current];
      // 현재 세트의 모든 악기에 대해 노트가 활성화되어 있다면 소리 재생
      for (const ins in currentScore) {
        if (currentScore[ins][tickCount % NOTE_NUM]) {
          playSound(ins);
        }
      }
      setCurrentNote(tickCount % NOTE_NUM);
      tickCount++;

      // 드리프트
      timerId.current = setTimeout(tick, Math.max(0, stepDuration - drift));
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
      // BPM 변경 -> 기존 타이머 취소 -> stepDuration 재계산
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
