import React, { useState, useEffect, useRef } from 'react';
import drum_kick from './assets/sound/drum_kick.wav';
import drum_snare from './assets/sound/drum_snare.wav';
import drum_hiHat from './assets/sound/drum_hiHat.wav';

function App() {
  const [audioContext, setAudioContext] = useState(null);
  const [isFetched, setIsFetched] = useState(false);
  const audioBuffer = useRef({
    kick: null,
    snare: null,
    hiHat: null,
  });

  const keyDrumMap = {
    c: 'kick',
    x: 'snare',
    z: 'hiHat',
  };

  const soundMap = {
    kick: drum_kick,
    snare: drum_snare,
    hiHat: drum_hiHat,
  };

  const [score, setScore] = useState({
    kick: Array.from({length: 16}, () => false),
    snare: Array.from({length: 16}, () => false),
    hiHat: Array.from({length: 16}, () => false),
  });

  function changeScore(ins, row) {
    let scoreArr = score;
    scoreArr[ins][row] = scoreArr[ins][row] ? false : true;
    setScore(scoreArr);
  };

  const initializeAudio = async () => {
    let localAudioContext = audioContext;

    // Create the AudioContext on user interaction
    if (!localAudioContext) {
      localAudioContext = new AudioContext();
      setAudioContext(localAudioContext);
      await localAudioContext.resume();
    }

    try {
      for (let s in soundMap) {
        const response = await fetch(soundMap[s]);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = await localAudioContext.decodeAudioData(arrayBuffer);
        audioBuffer.current[s] = buffer;
      }
    } catch (e) {
      console.error('Error fetching or decoding audio', e);
    }
    setIsFetched(true);
};

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
  }, [audioContext]);

  const handleKeyDown = (event) => {
    console.log(keyDrumMap[event.key]);
    playSound(keyDrumMap[event.key]);
  };

  // 사운드가 실질적으로 재생되는 함수
  const playSound = (drumType) => {
    if (audioBuffer.current[drumType] && audioContext) {
      console.log("played", drumType);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer.current[drumType];
      source.connect(audioContext.destination);
      source.start();
    }
  };

  return (
    <div>
      <h1>Press keys to play drums</h1>
      {
        (isFetched 
          ? (
            <>
              <button>Play Kick</button>
              <p>Now play your music!</p>
            </>
          )
          : <button onClick={initializeAudio}>Start Audio</button>
        )
      }
      <div>
        <button onClick={ () => { changeScore('kick', 0); } }>1</button>
        <button onClick={ () => { console.log(score); } }>check</button>
      </div>
    </div>
  );
}

export default App;





