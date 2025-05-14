import React from "react";
import * as Styled from "../style/Row.styled";

const SimpleInstrumentRow = ({
  instrumentName,
  rowScore = [],
  onToggleNote,
  isMouseDown
}) => {
  // 클릭/드래그로 on/off
  const handleMouseDown = (i) => {
    onToggleNote(instrumentName, i);
  };
  const handleMouseEnter = (i) => {
    if (isMouseDown) onToggleNote(instrumentName, i);
  };

  return (
    <Styled.RowWrapper>
      <Styled.InsSpan>{instrumentName}</Styled.InsSpan>
      <Styled.NoteBtnWrapper>
        {rowScore.map((isActive, i) => (
          <Styled.NoteBtn
            key={i}
            $isActive={isActive}
            $isBeat={i % 4 === 0}
            onMouseDown={() => handleMouseDown(i)}
            onMouseEnter={() => handleMouseEnter(i)}
          />
        ))}
      </Styled.NoteBtnWrapper>
    </Styled.RowWrapper>
  );
};

export default SimpleInstrumentRow; 