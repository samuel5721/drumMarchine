// src/components/MainControls.js
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
  border: none;
  box-shadow: inset 0 0 0 1px #222;
  border-radius: 0.25rem;
`;

const ToggleBtn = styled(OptionBtn)`
  background-color: ${props => props.$isActive ? '#4CAF50' : 'white'};
  color: ${props => props.$isActive ? 'white' : 'black'};
`;

const FileInput = styled.input`
  display: none;
`;

const MainControls = ({
  bpmInput,
  handleBpmChange,
  volume,
  changeVolume,
  initializeAudio,
  isPlaying,
  start,
  stop,
  clearScore,
  instrumentType,
  exportScore,
  importScore,
  isToggleActive,
  setIsToggleActive,
  importPreset,
}) => {
  const fileInputRef = React.useRef(null);
  const presetInputRef = React.useRef(null);

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handlePresetImportClick = () => {
    presetInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const scoreData = JSON.parse(event.target.result);
          importScore(scoreData);
        } catch (error) {
          console.error('Error importing score:', error);
          alert('잘못된 파일 형식입니다.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePresetFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const presetData = event.target.result;
          importPreset(presetData);
        } catch (error) {
          console.error('Error importing preset:', error);
          alert('잘못된 프리셋 파일 형식입니다.');
        }
      };
      reader.readAsText(file);
    }
  };

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
          onChange={(e) => changeVolume(instrumentType, parseFloat(e.target.value))}
        />
        <OptionBtn onClick={initializeAudio}>Start</OptionBtn>
        {isPlaying ? (
          <OptionBtn onClick={stop}>Stop</OptionBtn>
        ) : (
          <OptionBtn onClick={start}>Play</OptionBtn>
        )}
        <OptionBtn onClick={clearScore}>All Clear</OptionBtn>
        <ToggleBtn 
          $isActive={isToggleActive}
          onClick={() => setIsToggleActive(!isToggleActive)}
        >
          {isToggleActive ? '예약 모드' : '즉시 모드'}
        </ToggleBtn>
      </Box>
      <Box>
        <OptionBtn onClick={exportScore}>Export</OptionBtn>
        <OptionBtn onClick={handleImportClick}>Import</OptionBtn>
        <OptionBtn onClick={handlePresetImportClick}>Import Preset</OptionBtn>
        <FileInput
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <FileInput
          type="file"
          accept=".txt"
          ref={presetInputRef}
          onChange={handlePresetFileChange}
        />
      </Box>
    </OptionWrapper>
  );
};

export default MainControls;
