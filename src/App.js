import React, { useState, useEffect, useRef } from 'react';
import drum_kick from './assets/sound/drum_kick.wav';
import drum_snare from './assets/sound/drum_snare.wav';
import drum_hiHat from './assets/sound/drum_hiHat.wav';

import styles from './App.module.css';

function App() {
  const [audioContext, setAudioContext] = useState(null);
  const [isFetched, setIsFetched] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [intervalId, setIntervalId] = useState(null);
  const noteNum = 16;
  const audioBuffer = useRef({
    kick: null,
    snare: null,
    hiHat: null,
  });
  const soundMap = {
    kick: drum_kick,
    snare: drum_snare,
    hiHat: drum_hiHat,
  };

  const [score, setScore] = useState({
    kick: Array.from({length: noteNum}, () => false),
    snare: Array.from({length: noteNum}, () => false),
    hiHat: Array.from({length: noteNum}, () => false),
  });

  //오디오 초기화
  const initializeAudio = async () => {
    if(isFetched) return;

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

  // 사운드가 실질적으로 재생되는 함수
  const playSound = (drumType) => {
    clearInterval(intervalId);
    if (audioBuffer.current[drumType] && audioContext) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer.current[drumType];
      source.connect(audioContext.destination);
      source.start();
    }
  };

  useEffect(() => {
    if (isPlaying) {
      let currentNote = 0;

      const interval = setInterval(() => {
        for (const ins in score) {
            if (score[ins][currentNote]) playSound(ins);
        }

        currentNote = (currentNote + 1) % noteNum;
      }, 1000/(bpm/60*4));

      setIntervalId(interval);
    } else {
      if (intervalId) clearInterval(intervalId); 
    }

    return () => { 
        if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, bpm])

  //해당 악기와 줄에 해당하는 음표 변경
  const changeScore = (ins, row) => {
    const updatedScore = { ...score };
    updatedScore[ins] = [...updatedScore[ins]];
    updatedScore[ins][row] = !updatedScore[ins][row];
    setScore(updatedScore);
  };

  //play 버튼 함수
  const play = () => {
    setIsPlaying(true);
  }

  const stop = () => {
    setIsPlaying(false);
  }

  const scoreClear = () => {
    const newScore = {};
    for (const instrument in score) {
        newScore[instrument] = Array.from({ length: noteNum }, () => false);
    }
    setScore(newScore);
    setIsPlaying(false);
  }

  const changeBpm = (event) => {
    if(event.target.value <= 0) {
      setBpm(1); return;
    }
    if(event.target.value > 1000) {
      setBpm(999); return;
    }
    setBpm(event.target.value);
  }

  return (
    <div>
      <h1>Press keys to play drums</h1>
      <div className={styles.optionWrapper}> 
        <input type='number' value={bpm} onChange={changeBpm} onClick={(event) => {event.target.select();}}/>
        <button onClick={initializeAudio}>Start Audio</button>
        {
          isPlaying ? <button onClick={stop}>stop</button>
          :<button onClick={play}>Play</button>
        }
        <button onClick={scoreClear}>clear</button>
      </div>
      
      <div className={styles.lineWrapper}>
        {
          ['hiHat', 'snare', 'kick'].map((ins) => {
            return (
              <div className={styles.rowWrapper}>
                {Array.from({ length: noteNum }).map((_, i) => {
                  return(
                    <button
                      className={styles.noteBtn}
                      style={{ background:(score[ins][i]) ? '#72ac51' : (i%4 === 0) ? '#d6d6d6' : '#ebebeb' }}
                      onClick={()=>{
                        if(!isPlaying) {
                          if(!score[ins][i]) playSound(ins);
                          changeScore(ins, i);
                        }
                    }}>
                      {(i%4 === 0 && !score[ins][i]) ? (i+4)/4 : ''}
                    </button>
                  )
                })}
              </div>
            );
          })
        }
      </div>
      <button onClick={ () => { console.log(score); } }>check</button>
    </div>
  );
}

export default App;





