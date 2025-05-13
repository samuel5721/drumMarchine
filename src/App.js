import React, { useState, useEffect, useRef } from "react";
import MainControls from "./components/MainControls";
import Controls from "./components/Controls";
import InstrumentRow from "./components/InstrumentRow";
import SequenceRow from "./components/SequenceRow";
import useAudioEngine from "./hooks/useAudioEngine";
import useSequencer from "./hooks/useSequencer";
import { NOTE_NUM, DEFAULT_BPM } from "./utils/constants";
import {
  instrumentTypes,
  instruments,
  instrumentDrumOrder,
  instrumentBassOrder,
} from "./data/instruments";
import styled from "styled-components";

function App() {
  const { initializeAudio, playSound, changeVolume, volumes } = useAudioEngine();
  const [focusedInstrumentType, setFocusedInstrumentType] = useState(null);

  // 각 악기 세트별로 노트 관리
  const initialScore = {
    [instrumentTypes.DRUM]: Array.from({ length: NOTE_NUM }, () => {
      const instrumentScore = {};
      instrumentDrumOrder.forEach((ins) => {
        instrumentScore[ins] = Array(NOTE_NUM).fill(false);
      });
      return instrumentScore;
    }),
    [instrumentTypes.BASS]: Array.from({ length: NOTE_NUM }, () => {
      const instrumentScore = {};
      instrumentBassOrder.forEach((ins) => {
        instrumentScore[ins] = Array(NOTE_NUM).fill({
          on: false,
          isSharp: false
        });
      });
      return instrumentScore;
    })
  };
  const score = useRef(initialScore);
  const [seeingScore, setSeeingScore] = useState(initialScore);

  // 각 악기 세트별 현재 세트 관리
  const currentSet = useRef({
    [instrumentTypes.DRUM]: 0,
    [instrumentTypes.BASS]: 0
  });
  const [seeingCurrentSet, setSeeingCurrentSet] = useState({
    [instrumentTypes.DRUM]: 0,
    [instrumentTypes.BASS]: 0
  });

  // 시퀀서 훅
  const { isPlaying, currentNote, startSequencer, stopSequencer, changeBpm } =
    useSequencer({ score, currentSet, playSound, instruments });

  // BPM
  const [bpmInput, setBpmInput] = useState(DEFAULT_BPM);

  // 마우스 드래그 상태
  const [isMouseDown, setIsMouseDown] = useState(0);
  useEffect(() => {
    const handleMouseDown = () => setIsMouseDown(1);
    const handleMouseUp = () => setIsMouseDown(0);

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // 노트 토글
  const toggleNote = (instrument, index) => {
    const instrumentType = instrumentDrumOrder.includes(instrument) ? instrumentTypes.DRUM : instrumentTypes.BASS;
    const updatedScoreSet = { ...score.current[instrumentType][currentSet.current[instrumentType]] };
    
    if (instrumentType === instrumentTypes.DRUM) {
      // 드럼 기존 로직 유지
      updatedScoreSet[instrument] = updatedScoreSet[instrument].map((val, i) =>
        i === index ? !val : val
      );
    } else {
      // 베이스 객체로 처리
      updatedScoreSet[instrument] = updatedScoreSet[instrument].map((note, i) =>
        i === index ? { ...note, on: !note.on } : note
      );
    }
    
    score.current[instrumentType][currentSet.current[instrumentType]] = updatedScoreSet;
    setSeeingScore({ ...score.current });
  };

  // 세트 클리어
  const clearScore = () => {
    if (focusedInstrumentType) {
      const clearedSet = {};
      Object.keys(score.current[focusedInstrumentType][currentSet.current[focusedInstrumentType]]).forEach((ins) => {
        clearedSet[ins] = Array(NOTE_NUM).fill(0);
      });
      score.current[focusedInstrumentType][currentSet.current[focusedInstrumentType]] = clearedSet;
      setSeeingScore({ ...score.current });
    }
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
      // 포커스 설정
      if (e.key === 'q') {
        setFocusedInstrumentType(instrumentTypes.DRUM);
      } else if (e.key === 'w') {
        setFocusedInstrumentType(instrumentTypes.BASS);
      }
      
      // Ctrl + 숫자키로 전체 악보 변경
      if (e.ctrlKey) {
        if (e.key >= "1" && e.key <= "9") {
          e.preventDefault(); // 브라우저 기본 동작 방지
          const newSet = parseInt(e.key, 10) - 1;
          Object.values(instrumentTypes).forEach(type => {
            currentSet.current[type] = newSet;
          });
          setSeeingCurrentSet({ ...currentSet.current });
          setFocusedInstrumentType(null); // 포커스 해제
        }
        if (e.key === "0") {
          e.preventDefault(); // 브라우저 기본 동작 방지
          Object.values(instrumentTypes).forEach(type => {
            currentSet.current[type] = 9;
          });
          setSeeingCurrentSet({ ...currentSet.current });
          setFocusedInstrumentType(null); // 포커스 해제
        }
      }
      // 포커스된 악기 세트의 악보 변경
      else if (focusedInstrumentType) {
        if (e.key >= "1" && e.key <= "9") {
          e.preventDefault(); // 브라우저 기본 동작 방지
          currentSet.current[focusedInstrumentType] = parseInt(e.key, 10) - 1;
          setSeeingCurrentSet({ ...currentSet.current });
        }
        if (e.key === "0") {
          e.preventDefault(); // 브라우저 기본 동작 방지
          currentSet.current[focusedInstrumentType] = 9;
          setSeeingCurrentSet({ ...currentSet.current });
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedInstrumentType]);

  return (
    <Wrapper>
      <HeaderBox>
        <h1>Music Lab</h1>
        <MainControls
          bpmInput={bpmInput}
          handleBpmChange={handleBpmChange}
          volume={volumes.master}
          changeVolume={changeVolume}
          initializeAudio={initializeAudio}
          isPlaying={isPlaying}
          start={startSequencer}
          stop={stopSequencer}
          clearScore={clearScore}
          instrumentType="master"
        />
      </HeaderBox>
      <BodyBox>
        <LeftSide>
          <LineWrapper 
            onClick={() => setFocusedInstrumentType(instrumentTypes.DRUM)}
            style={{ border: focusedInstrumentType === instrumentTypes.DRUM ? '1px solid #ccc' : 'none' }}
          >
            <Controls
              bpmInput={bpmInput}
              handleBpmChange={handleBpmChange}
              volume={volumes[instrumentTypes.DRUM]}
              changeVolume={changeVolume}
              initializeAudio={initializeAudio}
              isPlaying={isPlaying}
              start={startSequencer}
              stop={stopSequencer}
              clearScore={clearScore}
              instrumentType={instrumentTypes.DRUM}
            />
            {instrumentDrumOrder.map((ins) => (
              <InstrumentRow
                key={ins}
                instrumentName={ins}
                rowScore={seeingScore[instrumentTypes.DRUM][seeingCurrentSet[instrumentTypes.DRUM]][ins]}
                onToggleNote={toggleNote}
                isMouseDown={isMouseDown}
              />
            ))}
            <br />
            <SequenceRow
              sequanceName={instrumentTypes.DRUM}
              seeingCurrentSet={seeingCurrentSet[instrumentTypes.DRUM]}
              currentNote={currentNote}
              isPlaying={isPlaying}
              setSeeingCurrentSet={(newSet) => {
                currentSet.current[instrumentTypes.DRUM] = newSet;
                setSeeingCurrentSet({ ...currentSet.current });
              }}
              score={score.current[instrumentTypes.DRUM]}
              currentSet={currentSet.current[instrumentTypes.DRUM]}
            />
          </LineWrapper>
        </LeftSide>
        <RightSide>
          <LineWrapper 
            onClick={() => setFocusedInstrumentType(instrumentTypes.BASS)}
            style={{ border: focusedInstrumentType === instrumentTypes.BASS ? '1px solid #ccc' : 'none' }}
          >
            <Controls
              bpmInput={bpmInput}
              handleBpmChange={handleBpmChange}
              volume={volumes[instrumentTypes.BASS]}
              changeVolume={changeVolume}
              initializeAudio={initializeAudio}
              isPlaying={isPlaying}
              start={startSequencer}
              stop={stopSequencer}
              clearScore={clearScore}
              instrumentType={instrumentTypes.BASS}
            />
            {instrumentBassOrder.map((ins) => (
              <InstrumentRow
                key={ins}
                instrumentName={ins}
                rowScore={seeingScore[instrumentTypes.BASS][seeingCurrentSet[instrumentTypes.BASS]][ins]}
                onToggleNote={toggleNote}
                isMouseDown={isMouseDown}
              />
            ))}
            <br />
            <SequenceRow
              sequanceName={instrumentTypes.BASS}
              seeingCurrentSet={seeingCurrentSet[instrumentTypes.BASS]}
              currentNote={currentNote}
              isPlaying={isPlaying}
              setSeeingCurrentSet={(newSet) => {
                currentSet.current[instrumentTypes.BASS] = newSet;
                setSeeingCurrentSet({ ...currentSet.current });
              }}
              score={score.current[instrumentTypes.BASS]}
              currentSet={currentSet.current[instrumentTypes.BASS]}
            />
          </LineWrapper>
        </RightSide>
      </BodyBox>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HeaderBox = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const BodyBox = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-around;
`;

const LeftSide = styled.div`
  width: 50%;
  // background-color: lightblue;
`;

const RightSide = styled.div`
  width: 50%;
  // background-color: lightgreen;
`;

const LineWrapper = styled.div`
  width: 100%;
  max-width: 40rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: border 0.2s ease;
  cursor: pointer;
`;

export default App;
