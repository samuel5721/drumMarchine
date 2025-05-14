import React from "react";
import * as Styled from "../style/Row.styled";
import { NOTE_NUM } from "../utils/constants";

const SequenceRow = ({
  sequanceName,
  seeingCurrentSet,
  currentNote,
  isPlaying,
  setSeeingCurrentSet,
  score,
  currentSet,
}) => {
  return (
    <Styled.RowWrapper>
      <Styled.InsSpan />
      {Array.from({ length: NOTE_NUM }).map((_, i) => (
        <Styled.NoteBtn
          isSharp={false}
          key={i}
          $isCurrent={currentNote === i && isPlaying}
          $isSelected={seeingCurrentSet === i}
          $isBeat={i % 4 === 0}
          onClick={() => {
            setSeeingCurrentSet(i);
          }}
        >
          {i + 1}
        </Styled.NoteBtn>
      ))}
    </Styled.RowWrapper>
  );
};

export default SequenceRow;
