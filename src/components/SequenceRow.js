import React from "react";
import * as Styled from "../style/Row.styled";

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
      {Array.from({ length: score.current.length }).map((_, i) => (
        <Styled.NoteBtn
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
