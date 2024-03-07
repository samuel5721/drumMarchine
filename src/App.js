import React, { useState, useEffect, useRef } from 'react';
import kick from './assets/sound/drum_kick.wav';
import snare from './assets/sound/drum_snare.wav';
import hiHat from './assets/sound/drum_hiHat.wav';
import cowBell from './assets/sound/drum_cowBell.mp3'

import styles from './App.module.css';

function App() {
  const [audioContext, setAudioContext] = useState(null);
  const [isFetched, setIsFetched] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentNote, setCurrentNote] = useState(0);
  const bpm = useRef(120);
  const [intervalId, setIntervalId] = useState(null);
  const noteNum = 16;

  const soundMap = {
    kick:kick,
    snare:snare,
    hiHat:hiHat,
    cowBell:cowBell
  };
  const audioBuffer = useRef(
    Object.keys(soundMap).reduce((acc, key) => ({ ...acc, [key]: null }), {})
  );

  const score = useRef(
    Array.from({ length: 16 }, () => (
      Object.keys(soundMap).reduce((acc, key) => ({
        ...acc,
        [key]: Array.from({ length: noteNum }, () => false)
      }), {})
    ))
  );
  const [seeingScore, setSeeingScore] = useState(score.current);
  const currentSet = useRef(0);
  const [seeingCurrentSet, setSeeingCurrentSet] = useState(currentSet.current );

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
    clearInterval(intervalId);

    if(!isPlaying) return;

    let noteBuffer = 0;
    let id = setInterval(() => {
      for (const ins in score.current[currentSet.current]) {
            if (score.current[currentSet.current][ins][noteBuffer]) playSound(ins);
        }
        noteBuffer = (noteBuffer + 1) % 16;
        setCurrentNote(currentNote => noteBuffer);
    }, 1000/(bpm.current/60*4));
    
    setIntervalId(id);

    return () => {
      clearInterval(id);
      setCurrentNote(0);
    }

  }, [isPlaying])


  //해당 악기와 줄에 해당하는 음표 변경
  const changeScore = (set, ins, row) => {
    const updatedScore = score.current.map((scoreSet, index) => {
      if (index === set) {
        return {
          ...scoreSet,
          [ins]: scoreSet[ins].map((val, rowIndex) => rowIndex === row ? !val : val),
        };
      } else {
        return scoreSet;
      }
    });
  
    score.current = updatedScore;
    setSeeingScore([...updatedScore]);
  };

  //악보 변경
  const changeCurrentSet = (set) => {
    currentSet.current = set;
    setSeeingCurrentSet(currentSet.current);
  }

  //play 버튼 함수
  const play = () => {
    setIsPlaying(true);
  }

  const stop = () => {
    setIsPlaying(false);
    clearInterval(intervalId);
  }

  const scoreClear = () => {
    // score.current 전체를 복사합니다.
    const newScore = score.current.map((scoreSet, index) => {
        if (index === currentSet.current) {
            const clearedSet = {};
            for (const instrument in scoreSet) {
                clearedSet[instrument] = Array.from({ length: noteNum }, () => false);
            }
            return clearedSet;
        } else {
            return scoreSet;
        }
    });

    score.current = newScore;
    setSeeingScore([...newScore]);
}


  const changeBpm = (event) => {
    if(event.target.value <= 0) {
      bpm.current = 1; return;
    }
    if(event.target.value > 1000) {
      bpm.current = 999; return;
    }
    bpm.current = event.target.value;
  }

  return (
    <div className={styles.wrapper}>
      <h1>Press keys to play drums</h1>
      <div className={styles.optionWrapper}> 
        <input className={styles.optionInput} type='number' value={bpm.current} onChange={changeBpm} onClick={(event) => {event.target.select();}}/>
        <button className={styles.optionBtn} onClick={initializeAudio}>Start</button>
        {
          isPlaying ?
          <button className={styles.optionBtn} onClick={stop}>Stop</button> :
          <button className={styles.optionBtn} onClick={play}>Play</button>
        }
        <button className={styles.optionBtn} onClick={scoreClear}>Clear</button>
      </div>
      
      <div className={styles.lineWrapper}>
        {
          ['cowBell', 'hiHat', 'snare', 'kick', ].map((ins) => {
            return (
              <>
              <span>{ins}</span>
              <div className={styles.rowWrapper}>
                {Array.from({ length: noteNum }).map((_, i) => {
                  return(
                    <button
                      className={styles.noteBtn}
                      style={{ background:(seeingScore[seeingCurrentSet][ins][i]) ? 'black' : (i%4 === 0) ? '#eeeeee' : 'white' }}
                      onClick={()=>{
                        changeScore(currentSet.current, ins, i);
                    }}>
                    </button>
                  )
                })}
              </div>
              </>
              
            );
          })
        }
        <br />
        {
          <div className={styles.rowWrapper}>
          {Array.from({ length: noteNum }).map((_, i) => {
            return(
              <button
                className={styles.noteBtn}
                style={{
                  background: ((currentNote === i && isPlaying) || seeingCurrentSet === i) ? 'black' : (i%4 === 0) ? '#eeeeee' : 'white',
                  color: ((currentNote === i && isPlaying) || seeingCurrentSet === i) ? 'white' : 'black'
                }}
                onClick={()=>{
                  changeCurrentSet(i); 
              }}>
                {i+1}
              </button>
            )
          })}
        </div>
        }
      </div>
      <button onClick={ () => { console.log(score.current); } }>check</button>
    </div>
  );
}

export default App;





