import React, { useState, useEffect, useRef } from "react";
import MainControls from "./components/MainControls";
import Controls from "./components/Controls";
import SequenceRow from "./components/SequenceRow";
import useAudioEngine from "./hooks/useAudioEngine";
import useSequencer from "./hooks/useSequencer";
import { NOTE_NUM, DEFAULT_BPM } from "./utils/constants";
import {
  instrumentTypes,
  instrumentDrumOrder,
  instrumentBassOrder,
} from "./data/instruments";
import SimpleInstrumentRow from "./components/SimpleInstrumentRow";
import BaseInstrumentRow from "./components/BaseInstrumentRow";

import styled from "styled-components";
import * as Tone from 'tone';

function App() {
  const { initializeAudio, playSound, setVolume, volumes } = useAudioEngine();
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
          isSharp: false,
          groupId: 0
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
    useSequencer({ score, currentSet, playSound });

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

  // groupId를 위한 카운터
  const groupIdRef = useRef(1);

  // 드래그 상태 관리 (베이스 음 길이 지정용)
  const [dragInfo, setDragInfo] = useState({
    instrument: null,
    startIdx: null,
    isDragging: false
  });

  // 악보 내보내기
  const exportScore = () => {
    const scoreData = {
      score: score.current,
      bpm: bpmInput,
      volumes: volumes.current
    };
    const blob = new Blob([JSON.stringify(scoreData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drumset_score.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 악보 가져오기
  const importScore = (scoreData) => {
    if (scoreData.score) {
      score.current = scoreData.score;
      setSeeingScore({ ...score.current });
    }
    if (scoreData.bpm) {
      setBpmInput(scoreData.bpm);
      changeBpm(scoreData.bpm);
    }
    if (scoreData.volumes) {
      Object.entries(scoreData.volumes).forEach(([type, volume]) => {
        setVolume(type, volume);
      });
    }
  };

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
      // 베이스: groupId 방식 적용
      const row = updatedScoreSet[instrument];
      const clicked = row[index];
      if (!clicked.on) {
        // 새로운 음 시작: 새로운 groupId 할당
        const newGroupId = groupIdRef.current++;
        row[index] = { ...clicked, on: true, groupId: newGroupId };
      } else {
        // 이미 켜진 음 클릭: 해당 groupId 전체 off
        const offGroupId = clicked.groupId;
        updatedScoreSet[instrument] = row.map(note =>
          note.groupId === offGroupId ? { ...note, on: false, groupId: 0 } : note
        );
      }
    }
    
    score.current[instrumentType][currentSet.current[instrumentType]] = updatedScoreSet;
    setSeeingScore({ ...score.current });
  };

  // 세트 클리어
  const clearScore = () => {
    // 모든 악기 타입에 대해 클리어 수행
    Object.values(instrumentTypes).forEach(type => {
      const clearedSet = {};
      Object.keys(score.current[type][currentSet.current[type]]).forEach((ins) => {
        if (type === instrumentTypes.DRUM) {
          clearedSet[ins] = Array(NOTE_NUM).fill(false);
        } else {
          clearedSet[ins] = Array(NOTE_NUM).fill({
            on: false,
            isSharp: false,
            groupId: 0
          });
        }
      });
      score.current[type][currentSet.current[type]] = clearedSet;
    });
    setSeeingScore({ ...score.current });
  };

  // BPM 변경
  const handleBpmChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setBpmInput(value);
      changeBpm(value);
      Tone.getContext().transport.bpm.value = value;
    }
  };

  // 베이스 음 구간 지정 함수
  const setBassNoteRange = (instrument, startIdx, endIdx, removeGroupId = null) => {
    const instrumentType = instrumentTypes.BASS;
    const updatedScoreSet = { ...score.current[instrumentType][currentSet.current[instrumentType]] };
    const row = updatedScoreSet[instrument];
    if (removeGroupId) {
      // 해당 groupId 전체 해제
      updatedScoreSet[instrument] = row.map(note =>
        note.groupId === removeGroupId ? { ...note, on: false, groupId: 0 } : note
      );
    } else {
      // 새로운 groupId 할당
      const newGroupId = groupIdRef.current++;
      const minIdx = Math.min(startIdx, endIdx);
      const maxIdx = Math.max(startIdx, endIdx);
      updatedScoreSet[instrument] = row.map((note, i) =>
        (i >= minIdx && i <= maxIdx)
          ? { ...note, on: true, groupId: newGroupId }
          : note
      );
    }
    score.current[instrumentType][currentSet.current[instrumentType]] = updatedScoreSet;
    setSeeingScore({ ...score.current });
  };

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 포커스 설정
      if (e.key === 'q') {
        setFocusedInstrumentType(instrumentTypes.DRUM);
      } else if (e.key === 'w') {
        setFocusedInstrumentType(instrumentTypes.BASS);
      } else if (e.key === 'Escape') {
        setFocusedInstrumentType(null);
      }
      
      // Ctrl + 숫자키로 전체 악보 변경
      if (e.ctrlKey) {
        if (e.key >= "1" && e.key <= "9") {
          e.preventDefault();
          const newSet = parseInt(e.key, 10) - 1;
          Object.values(instrumentTypes).forEach(type => {
            currentSet.current[type] = newSet;
          });
          setSeeingCurrentSet({ ...currentSet.current });
          setFocusedInstrumentType(null); // 포커스 해제
        }
        if (e.key === "0") {
          e.preventDefault();
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
          e.preventDefault();
          currentSet.current[focusedInstrumentType] = parseInt(e.key, 10) - 1;
          setSeeingCurrentSet({ ...currentSet.current });
        }
        if (e.key === "0") {
          e.preventDefault();
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
          changeVolume={setVolume}
          initializeAudio={initializeAudio}
          isPlaying={isPlaying}
          start={startSequencer}
          stop={stopSequencer}
          clearScore={clearScore}
          instrumentType="master"
          exportScore={exportScore}
          importScore={importScore}
        />
      </HeaderBox>
      <BodyBox>
        <LeftSide>
          <LineWrapper 
            onClick={() => setFocusedInstrumentType(instrumentTypes.DRUM)}
            isFocused={focusedInstrumentType === instrumentTypes.DRUM}
          >
            <Controls
              bpmInput={bpmInput}
              handleBpmChange={handleBpmChange}
              volume={volumes[instrumentTypes.DRUM]}
              changeVolume={setVolume}
              initializeAudio={initializeAudio}
              isPlaying={isPlaying}
              start={startSequencer}
              stop={stopSequencer}
              clearScore={clearScore}
              instrumentType={instrumentTypes.DRUM}
            />
            {instrumentDrumOrder.map((ins) => (
              <SimpleInstrumentRow
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
            isFocused={focusedInstrumentType === instrumentTypes.BASS}
          >
            <Controls
              bpmInput={bpmInput}
              handleBpmChange={handleBpmChange}
              volume={volumes[instrumentTypes.BASS]}
              changeVolume={setVolume}
              initializeAudio={initializeAudio}
              isPlaying={isPlaying}
              start={startSequencer}
              stop={stopSequencer}
              clearScore={clearScore}
              instrumentType={instrumentTypes.BASS}
            />
            {instrumentBassOrder.map((ins) => (
              <BaseInstrumentRow
                key={ins}
                instrumentName={ins}
                rowScore={seeingScore[instrumentTypes.BASS][seeingCurrentSet[instrumentTypes.BASS]][ins]}
                dragInfo={dragInfo}
                setDragInfo={setDragInfo}
                setNoteRange={setBassNoteRange}
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
  border: none;
  box-shadow: ${props => props.isFocused ? 'inset 0 0 0 1px #888' : 'none'};
`;


export default App;
