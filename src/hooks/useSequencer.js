import { useState, useEffect, useRef } from "react";
import { NOTE_NUM } from "../utils/constants";

export default function useSequencer({ score, currentSet, playSound }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNote, setCurrentNote] = useState(0);
  const bpm = useRef(120);
  const intervalId = useRef(null);
  const isGoingLeft = useRef(false);

  useEffect(() => {
    // 인터벌은 isPlaying 상태가 변경될 때만 생성되도록 합니다.
    if (!isPlaying) return;
    // 이전 인터벌이 있다면 지우기
    if (intervalId.current) clearInterval(intervalId.current);

    let noteIndex = 0;
    const interval = setInterval(() => {
      const currentScore = score.current[currentSet.current];
      // 현재 세트의 모든 악기를 순회합니다.
      for (const ins in currentScore) {
        if (currentScore[ins][noteIndex]) {
          playSound(ins);
        }
      }
      noteIndex = isGoingLeft.current
        ? (noteIndex + NOTE_NUM - 1) % NOTE_NUM
        : (noteIndex + 1) % NOTE_NUM;
      setCurrentNote(noteIndex);
    }, 1000 / ((bpm.current / 60) * 4));

    intervalId.current = interval;
    return () => {
      clearInterval(interval);
      setCurrentNote(0);
    };
  }, [isPlaying]); // 의존성 배열을 isPlaying만 사용 (다른 값들은 ref로 관리)

  const startSequencer = () => setIsPlaying(true);
  const stopSequencer = () => {
    setIsPlaying(false);
    if (intervalId.current) clearInterval(intervalId.current);
  };

  const changeBpm = (newBpm) => {
    bpm.current = newBpm;
    if (isPlaying) {
      // BPM 변경 시 재시작: 기존 인터벌을 지우고 다시 시작
      if (intervalId.current) clearInterval(intervalId.current);
      let noteIndex = currentNote;
      const interval = setInterval(() => {
        const currentScore = score.current[currentSet.current];
        for (const ins in currentScore) {
          if (currentScore[ins][noteIndex]) {
            if (ins === "turn") {
              isGoingLeft.current = !isGoingLeft.current;
            } else {
              playSound(ins);
            }
          }
        }
        noteIndex = isGoingLeft.current
          ? (noteIndex + NOTE_NUM - 1) % NOTE_NUM
          : (noteIndex + 1) % NOTE_NUM;
        setCurrentNote(noteIndex);
      }, 1000 / ((bpm.current / 60) * 4));
      intervalId.current = interval;
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
