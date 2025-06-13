import React from 'react';
import styled from 'styled-components';
import useToneAudio from '../hooks/useToneAudio';

const ControlsWrapper = styled.div`
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const ControlGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  background-color: ${props => props.primary ? '#4CAF50' : '#f0f0f0'};
  color: ${props => props.primary ? 'white' : 'black'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const Slider = styled.input`
  width: 100%;
  margin: 0.5rem 0;
`;

const LogContainer = styled.div`
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  padding: 0.5rem;
  border-radius: 4px;
`;

const LogEntry = styled.div`
  font-family: monospace;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  color: ${props => {
    switch (props.level) {
      case 'ERROR': return '#ff0000';
      case 'WARNING': return '#ffa500';
      default: return '#000000';
    }
  }};
`;

const ErrorMessage = styled.div`
  color: #ff0000;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #ffeeee;
  border-radius: 4px;
`;

const AudioControls = () => {
  const {
    isInitialized,
    isPlaying,
    currentBpm,
    currentStep,
    logs,
    error,
    initializeAudio,
    startSequencer,
    stopSequencer,
    changeBpm,
    changeVolume,
    playNote
  } = useToneAudio();

  const handleInitialize = async () => {
    try {
      await initializeAudio();
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  };

  return (
    <ControlsWrapper>
      {error && (
        <ErrorMessage>
          {error === 'INITIALIZATION_ERROR' && '브라우저가 오디오 기능을 지원하지 않습니다.'}
          {error === 'PLAYBACK_ERROR' && '오디오 재생 중 오류가 발생했습니다.'}
          {error === 'SYNTH_ERROR' && '신디사이저 초기화 중 오류가 발생했습니다.'}
          {error === 'SEQUENCER_ERROR' && '시퀀서 초기화 중 오류가 발생했습니다.'}
        </ErrorMessage>
      )}

      <ControlGroup>
        <Button 
          primary 
          onClick={handleInitialize}
          disabled={isInitialized}
        >
          {isInitialized ? '오디오 초기화됨' : '오디오 초기화'}
        </Button>
        
        <Button
          onClick={isPlaying ? stopSequencer : startSequencer}
          disabled={!isInitialized}
        >
          {isPlaying ? '정지' : '재생'}
        </Button>
      </ControlGroup>

      <ControlGroup>
        <Label>BPM: {currentBpm}</Label>
        <Slider
          type="range"
          min="60"
          max="180"
          value={currentBpm}
          onChange={(e) => changeBpm(parseInt(e.target.value))}
          disabled={!isInitialized}
        />
      </ControlGroup>

      <ControlGroup>
        <Label>베이스 볼륨</Label>
        <Slider
          type="range"
          min="-40"
          max="0"
          step="1"
          defaultValue="-20"
          onChange={(e) => changeVolume('bass', parseFloat(e.target.value))}
          disabled={!isInitialized}
        />
      </ControlGroup>

      <ControlGroup>
        <Label>기타 볼륨</Label>
        <Slider
          type="range"
          min="-40"
          max="0"
          step="1"
          defaultValue="-20"
          onChange={(e) => changeVolume('guitar', parseFloat(e.target.value))}
          disabled={!isInitialized}
        />
      </ControlGroup>

      <ControlGroup>
        <Label>현재 스텝: {currentStep + 1}</Label>
      </ControlGroup>

      <LogContainer>
        <Label>로그</Label>
        {logs.map((log, index) => (
          <LogEntry key={index} level={log.level}>
            {new Date(log.timestamp).toLocaleTimeString()} - {log.message}
          </LogEntry>
        ))}
      </LogContainer>
    </ControlsWrapper>
  );
};

export default AudioControls; 