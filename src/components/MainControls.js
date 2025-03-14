// src/components/Controls.js
import React from "react";
import styled from "styled-components";

const OptionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 1rem 0;
`;

const Box = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  margin: 0 2rem;
`;

const OptionInput = styled.input`
  width: 5rem;
  height: 1.5rem;
  padding-left: 0.3rem;
  font-size: 16px;
`;

const OptionBtn = styled.button`
  min-width: 3rem;
  max-width: 6rem;
  max-width: 20rem;
  padding: 0.2rem;
  background-color: white;
  color: black;
  border: 1px solid black;
  border-radius: 0.25rem;
`;

const Controls = ({
  bpmInput,
  handleBpmChange,
  volume,
  changeVolume,
  initializeAudio,
  isPlaying,
  start,
  stop,
  clearScore,
}) => {
  return (
    <OptionWrapper>
      <Box>
        <OptionInput
          type="number"
          value={bpmInput}
          onChange={handleBpmChange}
          onBlur={handleBpmChange}
          onClick={(e) => e.target.select()}
        />
        <OptionInput
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => changeVolume(parseFloat(e.target.value))}
        />
        <OptionBtn onClick={initializeAudio}>Start</OptionBtn>
        {isPlaying ? (
          <OptionBtn onClick={stop}>Stop</OptionBtn>
        ) : (
          <OptionBtn onClick={start}>Play</OptionBtn>
        )}
        <OptionBtn onClick={clearScore}>All Clear</OptionBtn>
      </Box>
      <Box>
        <OptionBtn onClick={clearScore}>Export</OptionBtn>
        <OptionBtn onClick={clearScore}>Import</OptionBtn>
      </Box>
    </OptionWrapper>
  );
};

export default Controls;
