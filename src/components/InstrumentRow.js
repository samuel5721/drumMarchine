import React from "react";
import * as Styled from "../style/Row.styled";

const InstrumentRow = ({
  instrumentName,
  rowScore = [],
  onToggleNote,
  isMouseDown,
}) => {
  return (
    <Styled.RowWrapper>
      <Styled.InsSpan>{instrumentName}</Styled.InsSpan>
      <Styled.NoteBtnWrapper>
        {rowScore.map((isActive, i) => (
          <Styled.NoteBtn
            key={i}
            style={{
              background: isActive
                ? "black"
                : i % 4 === 0
                ? "#eeeeee"
                : "white",
            }}
            onClick={() => onToggleNote(instrumentName, i)}
            onMouseEnter={() => {
              if (isMouseDown) onToggleNote(instrumentName, i);
            }}
          ></Styled.NoteBtn>
        ))}
      </Styled.NoteBtnWrapper>
    </Styled.RowWrapper>
  );
};

export default InstrumentRow;
