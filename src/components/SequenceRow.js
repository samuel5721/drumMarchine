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
          style={{
            background:
              (currentNote === i && isPlaying) || seeingCurrentSet === i
                ? "black"
                : i % 4 === 0
                ? "#eeeeee"
                : "white",
            color:
              (currentNote === i && isPlaying) || seeingCurrentSet === i
                ? "white"
                : "black",
          }}
          onClick={() => {
            currentSet.current = i;
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
