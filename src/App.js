import React, { useState, useEffect, useRef } from "react";
import Controls from "./components/Controls";
import InstrumentRow from "./components/InstrumentRow";
import SequenceRow from "./components/SequenceRow";
import useAudioEngine from "./hooks/useAudioEngine";
import useSequencer from "./hooks/useSequencer";
import { NOTE_NUM, DEFAULT_BPM } from "./utils/constants";
import { instruments, instrumentOrder } from "./data/instruments";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LineWrapper = styled.div`
  width: 100%;
  max-width: 40rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

function App() {
  const { initializeAudio, playSound, changeVolume, volume } = useAudioEngine();

  // 세트(혹은 노트 수)만큼 점수 관리
  const initialScore = Array.from({ length: NOTE_NUM }, () => {
    const instrumentScore = {};
    Object.keys(instruments).forEach((ins) => {
      instrumentScore[ins] = Array(NOTE_NUM).fill(false);
    });
    return instrumentScore;
  });
  const score = useRef(initialScore);
  const [seeingScore, setSeeingScore] = useState(score.current);

  // 현재 세트 관리
  const currentSet = useRef(0);
  const [seeingCurrentSet, setSeeingCurrentSet] = useState(0);

  // 시퀀서 훅
  const { isPlaying, currentNote, startSequencer, stopSequencer, changeBpm } =
    useSequencer({ score, currentSet, playSound, instruments });

  // BPM
  const [bpmInput, setBpmInput] = useState(DEFAULT_BPM);

  // 마우스 드래그 상태
  const [isMouseDown, setIsMouseDown] = useState(false);
  useEffect(() => {
    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // 노트 토글
  const toggleNote = (instrument, index) => {
    const updatedScoreSet = { ...score.current[currentSet.current] };
    updatedScoreSet[instrument] = updatedScoreSet[instrument].map((val, i) =>
      i === index ? !val : val
    );
    score.current[currentSet.current] = updatedScoreSet;
    setSeeingScore([...score.current]);
  };

  // 세트 클리어
  const clearScore = () => {
    const clearedSet = {};
    Object.keys(score.current[currentSet.current]).forEach((ins) => {
      clearedSet[ins] = Array(NOTE_NUM).fill(false);
    });
    score.current[currentSet.current] = clearedSet;
    setSeeingScore([...score.current]);
  };

  // BPM 변경
  const handleBpmChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setBpmInput(value);
      changeBpm(value);
    }
  };

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= "1" && e.key <= "9") {
        currentSet.current = parseInt(e.key, 10) - 1;
        setSeeingCurrentSet(currentSet.current);
      }
      if (e.key === "0") {
        currentSet.current = 9;
        setSeeingCurrentSet(9);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Wrapper>
      <h1>Music Lab</h1>
      <Controls
        bpmInput={bpmInput}
        handleBpmChange={handleBpmChange}
        volume={volume.current}
        changeVolume={changeVolume}
        initializeAudio={initializeAudio}
        isPlaying={isPlaying}
        start={startSequencer}
        stop={stopSequencer}
        clearScore={clearScore}
      />
      <LineWrapper>
        {instrumentOrder.map((ins) => (
          <InstrumentRow
            key={ins}
            instrumentName={ins}
            rowScore={seeingScore[seeingCurrentSet][ins]}
            onToggleNote={toggleNote}
            isMouseDown={isMouseDown} // 추가: 드래그 기능에 필요
          />
        ))}
        <br />
        <SequenceRow
          sequanceName={"drum"}
          seeingCurrentSet={seeingCurrentSet}
          currentNote={currentNote}
          isPlaying={isPlaying}
          setSeeingCurrentSet={setSeeingCurrentSet}
          score={score}
          currentSet={currentSet}
        />
      </LineWrapper>
    </Wrapper>
  );
}

export default App;
