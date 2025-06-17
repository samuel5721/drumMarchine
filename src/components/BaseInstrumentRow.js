import React, { useState, useEffect } from "react";
import * as Styled from "../style/Row.styled";
import styled from "styled-components";

const NoteButton = styled.button`
  width: 40px;
  height: 40px;
  border: 1px solid #ccc;
  background-color: ${props => {
    if (props.$isOn) {
      if (props.$isOctaveUp) {
        return '#808080'; // 회색
      }
      return props.$isSharp ? '#000' : '#333';
    }
    return props.$isInDragRange ? '#444' : '#222';
  }};
  color: ${props => props.$isOn ? '#fff' : '#666'};
  cursor: pointer;
  transition: all 0.1s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: ${props => props.$isOn ? 'bold' : 'normal'};

  &:hover {
    background-color: ${props => props.$isOn ? '#444' : '#333'};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const BaseInstrumentRow = ({
  instrumentName,
  rowScore = [],
  dragInfo = {},
  setDragInfo = () => {},
  setNoteRange = () => {}
}) => {
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // Alt, Ctrl, Shift 키 감지
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Alt') setIsAltPressed(true);
      if (e.key === 'Control') setIsCtrlPressed(true);
      if (e.key === 'Shift') setIsShiftPressed(true);
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Alt') setIsAltPressed(false);
      if (e.key === 'Control') setIsCtrlPressed(false);
      if (e.key === 'Shift') setIsShiftPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 드래그 관련 이벤트 핸들러
  const handleMouseDown = (i) => {
    setDragInfo({ 
      instrument: instrumentName, 
      startIdx: i, 
      isDragging: true, 
      startOn: rowScore[i].on, 
      startGroupId: rowScore[i].groupId,
      isAltPressed,
      isCtrlPressed,
      isShiftPressed
    });
  };
  const handleMouseEnter = (i) => {
    if (dragInfo.isDragging && dragInfo.instrument === instrumentName) {
      setDragInfo({ ...dragInfo, endIdx: i });
    }
  };
  const handleMouseUp = (i) => {
    if (dragInfo.isDragging && dragInfo.instrument === instrumentName) {
      setDragInfo({ ...dragInfo, isDragging: false, endIdx: i });
      if (dragInfo.startOn && dragInfo.startGroupId) {
        setNoteRange(instrumentName, null, null, dragInfo.startGroupId); // 해제용
      } else {
        setNoteRange(instrumentName, dragInfo.startIdx, i, null, dragInfo.isAltPressed, isCtrlPressed, isShiftPressed);
      }
    }
  };

  // 드래그 구간 하이라이트 계산
  let dragRange = null;
  if (dragInfo.isDragging && dragInfo.instrument === instrumentName && dragInfo.startIdx != null && dragInfo.endIdx != null) {
    const min = Math.min(dragInfo.startIdx, dragInfo.endIdx);
    const max = Math.max(dragInfo.startIdx, dragInfo.endIdx);
    dragRange = { min, max };
  }

  return (
    <Styled.RowWrapper>
      <Styled.InsSpan>{instrumentName}</Styled.InsSpan>
      <Styled.NoteBtnWrapper>
        {(() => {
          // groupId가 0이 아닌 연속 구간만 span으로 감싸기
          const chunks = [];
          let chunk = [];
          let prevGroupId = null;
          let prevIdx = null;
          rowScore.forEach((note, i) => {
            if (
              note.on && note.groupId !== 0 &&
              prevGroupId === note.groupId && prevIdx === i - 1
            ) {
              chunk.push({ ...note, idx: i });
            } else {
              if (chunk.length > 0) {
                chunks.push({ groupId: prevGroupId, notes: chunk });
                chunk = [];
              }
              if (note.on && note.groupId !== 0) {
                chunk.push({ ...note, idx: i });
              } else {
                // 개별 NoteBtn (on=false 또는 groupId=0)
                chunks.push({ groupId: 0, notes: [{ ...note, idx: i }] });
              }
            }
            prevGroupId = note.on && note.groupId !== 0 ? note.groupId : null;
            prevIdx = note.on && note.groupId !== 0 ? i : null;
          });
          if (chunk.length > 0) {
            chunks.push({ groupId: prevGroupId, notes: chunk });
          }
          return chunks.map((chunk, ci) =>
            chunk.groupId !== 0 ? (
              <Styled.NoteGroup key={ci}>
                {chunk.notes.map((note) => (
                  <Styled.NoteBtn
                    key={note.idx}
                    $isOn={true}
                    $isInDragRange={dragRange && note.idx >= dragRange.min && note.idx <= dragRange.max}
                    $isOctaveUp={note.isOctaveUp}
                    onMouseDown={() => handleMouseDown(note.idx)}
                    onMouseEnter={() => handleMouseEnter(note.idx)}
                    onMouseUp={() => handleMouseUp(note.idx)}
                  >
                    {note.isSharp && '#'}
                  </Styled.NoteBtn>
                ))}
              </Styled.NoteGroup>
            ) : (
              chunk.notes.map((note) => (
                <Styled.NoteBtn
                  key={note.idx}
                  $isOn={note.on}
                  $isInDragRange={dragRange && note.idx >= dragRange.min && note.idx <= dragRange.max}
                  $isBeat={note.idx % 4 === 0}
                  $isOctaveUp={note.isOctaveUp}
                  onMouseDown={() => handleMouseDown(note.idx)}
                  onMouseEnter={() => handleMouseEnter(note.idx)}
                  onMouseUp={() => handleMouseUp(note.idx)}
                >
                  {note.isSharp && '#'}
                </Styled.NoteBtn>
              ))
            )
          );
        })()}
      </Styled.NoteBtnWrapper>
    </Styled.RowWrapper>
  );
};

export default BaseInstrumentRow; 