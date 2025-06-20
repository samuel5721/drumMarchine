import { useState, useRef, useCallback, useEffect } from 'react';
import { instrumentTypes, instrumentDrumOrder, instrumentBassOrder, instrumentSynthOrder, instrumentGuitarOrder } from '../data/instruments';
import { drumSynthConfigs, guitarSynthConfigs } from '../data/synthConfigs';
const Tone = require('tone');

const useAudioEngine = () => {
  const [isFetched, setIsFetched] = useState(false);
  const synth = useRef(null);
  const drumSynths = useRef({});
  const bassSynths = useRef({});
  const synthSynths = useRef({});
  const guitarSynths = useRef({});
  const drumGains = useRef({});
  const bassGains = useRef({});
  const synthGains = useRef({});
  const guitarGains = useRef({});
  const masterGain = useRef(null);
  const volumes = useRef({
    [instrumentTypes.DRUM]: 0.5,
    [instrumentTypes.BASS]: 0.5,
    [instrumentTypes.SYNTH]: 0.5,
    [instrumentTypes.GUITAR]: 0.5,
    master: 0.5
  });

  const initializeAudio = useCallback(async () => {
    if (isFetched) return;
    
    try {
      // Tone.js 컨텍스트 시작
      await Tone.start();
      await Tone.loaded();

      // 마스터 게인 노드 생성
      masterGain.current = new Tone.Gain(1).toDestination();
    
    // 베이스 신디사이저 초기화
      bassSynths.current = {};
      bassGains.current = {};
      instrumentBassOrder.forEach(note => {
        const gainNode = new Tone.Gain(1).connect(masterGain.current);
        bassGains.current[note] = gainNode;
        bassSynths.current[note] = new Tone.Synth({
          oscillator: {
            type: "sine"
          },
          envelope: {
            attack: 0.01,
            decay: 0.1,
            sustain: 0.2,
            release: 1
          }
        }).connect(gainNode);
      });
      
      // 신디사이저 초기화
      synthSynths.current = {};
      synthGains.current = {};
      instrumentSynthOrder.forEach(note => {
        const gainNode = new Tone.Gain(0.5).connect(masterGain.current);
        synthGains.current[note] = gainNode;
        synthSynths.current[note] = new Tone.Synth({
          oscillator: {
            type: "square"
          },
          envelope: {
            attack: 0.01,
            decay: 0.1,
            sustain: 0.1,
            release: 1
          }
        }).connect(gainNode);
      });
    
    // 드럼 신디사이저 초기화
    drumSynths.current = {};
      drumGains.current = {};
    console.log('Initializing drum synths with configs:', drumSynthConfigs);
    
    Object.entries(drumSynthConfigs).forEach(([name, config]) => {
      console.log(`Creating synth for ${name}:`, config);
      const SynthClass = Tone[config.type];
      if (SynthClass) {
        try {
            const gainNode = new Tone.Gain(config.type === 'MembraneSynth' ? 5 : 3).connect(masterGain.current);
            drumGains.current[name] = gainNode;
            drumSynths.current[name] = new SynthClass(config.options).connect(gainNode);
          console.log(`Successfully created ${name} synth`);
        } catch (error) {
          console.error(`Failed to create ${name} synth:`, error);
        }
      } else {
        console.error(`Synth class not found for ${name}: ${config.type}`);
      }
    });
    
    console.log('Final drum synths:', drumSynths.current);

    // 일렉트릭 기타 신디사이저 초기화
    guitarSynths.current = {};
    guitarGains.current = {};
    instrumentGuitarOrder.forEach(note => {
      const gainNode = new Tone.Gain(1).connect(masterGain.current);
      guitarGains.current[note] = gainNode;
      
      // 기본 신디사이저 생성
      const synth = new Tone.Synth({
        oscillator: {
          type: "sawtooth",
          volume: 0
        },
        envelope: {
          attack: 0.005,
          decay: 0.2,
          sustain: 0.3,
          release: 1
        }
      }).connect(gainNode);
      
      guitarSynths.current[note] = synth;
    });

    setIsFetched(true);
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }, [isFetched]);

  const setVolume = useCallback((type, value) => {
    if (volumes.current.hasOwnProperty(type)) {
      volumes.current[type] = value;
      console.log(`Volume set for ${type}:`, value);

      // 볼륨 변경 즉시 적용
      if (type === instrumentTypes.DRUM) {
        Object.entries(drumGains.current).forEach(([name, gain]) => {
          if (gain) {
            const baseGain = drumSynthConfigs[name].type === 'MembraneSynth' ? 5 : 3;
            gain.gain.value = baseGain * value * volumes.current.master;
          }
        });
      } else if (type === instrumentTypes.BASS) {
        Object.values(bassGains.current).forEach(gain => {
          if (gain) {
            gain.gain.value = value *2* volumes.current.master;
          }
        });
      } else if (type === instrumentTypes.SYNTH) {
        Object.values(synthGains.current).forEach(gain => {
          if (gain) {
            gain.gain.value = 0.5 * value * volumes.current.master;
          }
        });
      } else if (type === 'master') {
        // 마스터 볼륨 변경 시 모든 악기에 적용
        Object.entries(drumGains.current).forEach(([name, gain]) => {
          if (gain) {
            const baseGain = drumSynthConfigs[name].type === 'MembraneSynth' ? 5 : 3;
            gain.gain.value = baseGain * volumes.current[instrumentTypes.DRUM] * value;
          }
        });
        Object.values(bassGains.current).forEach(gain => {
          if (gain) {
            gain.gain.value = volumes.current[instrumentTypes.BASS] *2* value;
          }
        });
        Object.values(synthGains.current).forEach(gain => {
          if (gain) {
            gain.gain.value = 0.5 * volumes.current[instrumentTypes.SYNTH] * value;
          }
        });
      } else if (type === instrumentTypes.GUITAR) {
        Object.values(guitarGains.current).forEach(gain => {
          if (gain) {
            gain.gain.value = 2 * value * volumes.current.master;  // 게인 값 증가
          }
        });
      }
    }
  }, []);

  const playSound = useCallback(
    async (instrumentName, options = {}) => {
      
      if (!isFetched) {
        console.log('Audio not initialized yet, initializing...');
        const initialized = await initializeAudio();
        if (!initialized) {
          console.error('Failed to initialize audio, cannot play sound');
          return;
        }
      }

      if (!drumSynths.current || !bassSynths.current || !synthSynths.current || !guitarSynths.current) {
        console.error('Synth is not properly initialized');
        return;
      }

      // 악기 타입 결정 로직 수정
      let instrumentType;
      if (instrumentDrumOrder.includes(instrumentName)) {
        instrumentType = instrumentTypes.DRUM;
      } else if (instrumentBassOrder.includes(instrumentName)) {
        instrumentType = instrumentTypes.BASS;
      } else if (instrumentSynthOrder.includes(instrumentName)) {
        instrumentType = instrumentTypes.SYNTH;
      } else if (instrumentGuitarOrder.includes(instrumentName)) {
        instrumentType = instrumentTypes.GUITAR;
      }

      if (!instrumentType) {
        console.error('instrumentType not found');
        return;
      }
      
      try {
        if (instrumentType === instrumentTypes.DRUM) {
          // 드럼 악기별 재생
          const drumSynth = drumSynths.current[instrumentName];
          const config = drumSynthConfigs[instrumentName];
          
          if (drumSynth && config) {
            // NoiseSynth는 note 파라미터가 필요 없음
            if (config.type === 'NoiseSynth') {
              drumSynth.triggerAttackRelease(config.playOptions.duration);
            } else {
              drumSynth.triggerAttackRelease(
                config.playOptions.note,
                config.playOptions.duration
              );
            }
          } else {
            console.error(`Missing synth or config for ${instrumentName}`);
          }
        } else if (instrumentType === instrumentTypes.BASS) {
          // 베이스 악기 재생
          const bassSynth = bassSynths.current[instrumentName];
          if (bassSynth) {
            // 드래그 길이에 따른 음 길이 계산
            const { sustainStep, currentBpm, isSharp, isOctaveUp } = options;
            
            // 16분음표 기준으로 길이 계산 (4분음표 = 1박)
            const durationInBeats = sustainStep * (1/4); // 16분음표 = 1/4박
            const durationInSeconds = (60 / currentBpm) * durationInBeats;
          
            // 음표 이름에서 실제 음 추출 (예: "bass_C1" -> "C1")
            let note = instrumentName.replace('bass_', '');
          
            // 샵이 적용된 경우 음을 반음 올림
            if (isSharp) {
              const noteMap = {
                'C': 'C#', 'D': 'D#', 'E': 'F', 'F': 'F#',
                'G': 'G#', 'A': 'A#', 'B': 'C'
              };
              const noteName = note.charAt(0);
              const octave = note.slice(1);
              note = noteMap[noteName] + octave;
            }
            
            // 한 옥타브 올리기
            if (isOctaveUp) {
              const freq = Tone.Frequency(note);
              note = freq.transpose(12).toNote();
            }
            
            bassSynth.triggerAttackRelease(note, durationInSeconds);
          } else {
            console.error(`Missing synth for ${instrumentName}`);
          }
        } else if (instrumentType === instrumentTypes.SYNTH) {
          // 신디사이저 악기 재생
          const synthSynth = synthSynths.current[instrumentName];
          if (synthSynth) {
          // 드래그 길이에 따른 음 길이 계산
            const { sustainStep, currentBpm, isSharp, isOctaveUp } = options;
          
          // 16분음표 기준으로 길이 계산 (4분음표 = 1박)
          const durationInBeats = sustainStep * (1/4); // 16분음표 = 1/4박
          const durationInSeconds = (60 / currentBpm) * durationInBeats;
          
            // 음표 이름에서 실제 음 추출 (예: "synth_C1" -> "C1")
            let note = instrumentName.replace('synth_', '');
            
            // 샵이 적용된 경우 음을 반음 올림
            if (isSharp) {
              const noteMap = {
                'C': 'C#', 'D': 'D#', 'E': 'F', 'F': 'F#',
                'G': 'G#', 'A': 'A#', 'B': 'C'
              };
              const noteName = note.charAt(0);
              const octave = note.slice(1);
              note = noteMap[noteName] + octave;
            }
            
            // 한 옥타브 올리기
            if (isOctaveUp) {
              const freq = Tone.Frequency(note);
              note = freq.transpose(12).toNote();
            }
            
            synthSynth.triggerAttackRelease(note, durationInSeconds);
          } else {
            console.error(`Missing synth for ${instrumentName}`);
          }
        } else if (instrumentType === instrumentTypes.GUITAR) {
          const guitarSynth = guitarSynths.current[instrumentName];
          if (guitarSynth) {
            const { sustainStep, currentBpm, isSharp, isOctaveUp } = options;
            const durationInBeats = sustainStep * (1/4);
            const durationInSeconds = (60 / currentBpm) * durationInBeats;
            
            let note = instrumentName.replace('guitar_', '');
            
            if (isSharp) {
              const noteMap = {
                'C': 'C#', 'D': 'D#', 'E': 'F', 'F': 'F#',
                'G': 'G#', 'A': 'A#', 'B': 'C'
              };
              const noteName = note.charAt(0);
              const octave = note.slice(1);
              note = noteMap[noteName] + octave;
            }
            
            if (isOctaveUp) {
              const freq = Tone.Frequency(note);
              note = freq.transpose(12).toNote();
            }
            
            guitarSynth.triggerAttackRelease(note, durationInSeconds);
          }
        }
      } catch (error) {
        console.error('Sound playing failed:', error);
      }
    },
    [isFetched]
  );

  return {
    isFetched,
    playSound,
    setVolume,
    volumes: volumes.current,
    initializeAudio
  };
};

export default useAudioEngine;