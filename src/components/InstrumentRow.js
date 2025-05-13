import React from "react";
import * as Styled from "../style/Row.styled";


const InstrumentRow = ({
  instrumentName,
  rowScore = [],
  onToggleNote,
  isMouseDown,
}) => {
  // const isSharp = instrumentName.includes("#");

  return (
    <Styled.RowWrapper
      style={{
        // background: isSharp ? "#eeeeee" : "white",
      }}
    >
      <Styled.InsSpan>{instrumentName}</Styled.InsSpan>
      <Styled.NoteBtnWrapper>
        {rowScore.map((note, i) => {
          // 베이스 노트인 경우 note는 객체, 드럼 노트인 경우 boolean
          const isActive = typeof note === 'object' ? note.on : note;
          
          return (
            <Styled.NoteBtn
              key={i}
              style={{
                background: isActive
                  ? "black"
                  : i % 4 === 0
                  ? "#eeeeee"
                  : "white",
              }}
              onMouseDown={() => onToggleNote(instrumentName, i)}
              onMouseEnter={() => {
                if (isMouseDown) onToggleNote(instrumentName, i);
              }}
            ></Styled.NoteBtn>
          );
        })}
      </Styled.NoteBtnWrapper>
    </Styled.RowWrapper>
  );
};

export default InstrumentRow;
