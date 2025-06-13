import { useState, useRef, useCallback } from "react";
import { instrumentTypes, instrumentDrumOrder, instrumentBassOrder } from "../data/instruments";
import { drumSynthConfigs } from "../data/synthConfigs";
import * as Tone from 'tone';

export default function useAudioEngine() {
  const [isFetched, setIsFetched] = useState(false);
  const synth = useRef(null);
  const drumSynths = useRef({});
  const volumes = useRef({
    [instrumentTypes.DRUM]: 0.5,
    [instrumentTypes.BASS]: 0.5,
    master: 0.5
  });

  const initializeAudio = async () => {
    if (isFetched) return;
    await Tone.start();
    
    // 베이스 신디사이저 초기화
    synth.current = new Tone.Synth().toDestination();
    
    // 드럼 신디사이저 초기화
    drumSynths.current = {};
    console.log('Initializing drum synths with configs:', drumSynthConfigs);
    
    Object.entries(drumSynthConfigs).forEach(([name, config]) => {
      console.log(`Creating synth for ${name}:`, config);
      const SynthClass = Tone[config.type];
      if (SynthClass) {
        try {
          drumSynths.current[name] = new SynthClass(config.options).toDestination();
          console.log(`Successfully created ${name} synth`);
        } catch (error) {
          console.error(`Failed to create ${name} synth:`, error);
        }
      } else {
        console.error(`Synth class not found for ${name}: ${config.type}`);
      }
    });
    
    console.log('Final drum synths:', drumSynths.current);
    setIsFetched(true);
  };

  const playSound = useCallback(
    (instrumentName, options = {}) => {
      console.log('playSound called with:', instrumentName, options);
      
      if (!synth.current || !drumSynths.current) {
        console.log('synth is not initialized');
        return;
      }

      // 악기 타입 결정 로직 수정
      let instrumentType;
      if (instrumentDrumOrder.includes(instrumentName)) {
        instrumentType = instrumentTypes.DRUM;
      } else if (instrumentBassOrder.includes(instrumentName)) {
        instrumentType = instrumentTypes.BASS;
      }
      
      console.log('instrumentType:', instrumentType);

      if (!instrumentType) {
        console.log('instrumentType not found');
        return;
      }

      // 볼륨 값 검증 및 계산
      const instrumentVolume = volumes.current[instrumentType] || 0.5;
      const masterVolume = volumes.current.master || 0.5;
      const volume = Math.max(0, Math.min(1, instrumentVolume * masterVolume));
      
      try {
        if (instrumentType === instrumentTypes.DRUM) {
          // 드럼 악기별 재생
          const drumSynth = drumSynths.current[instrumentName];
          const config = drumSynthConfigs[instrumentName];
          
          console.log(`Playing drum ${instrumentName}:`, { 
            drumSynth, 
            config,
            type: config.type,
            options: config.options,
            playOptions: config.playOptions
          });
          
          if (drumSynth && config) {
            drumSynth.volume.value = Tone.gainToDb(volume);
            
            // NoiseSynth는 note 파라미터가 필요 없음
            if (config.type === 'NoiseSynth') {
              console.log(`Triggering NoiseSynth for ${instrumentName}`);
              drumSynth.triggerAttackRelease(config.playOptions.duration);
            } else {
              console.log(`Triggering ${config.type} for ${instrumentName}`);
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
          synth.current.volume.value = Tone.gainToDb(volume);
          
          // 베이스 악기 이름에서 음높이 추출
          const note = instrumentName.replace('bass_', '');
          
          // 드래그 길이에 따른 음 길이 계산
          const sustainStep = options.sustainStep || 1;
          const currentBpm = options.currentBpm || 120;
          
          // 16분음표 기준으로 길이 계산 (4분음표 = 1박)
          const durationInBeats = sustainStep * (1/4); // 16분음표 = 1/4박
          const durationInSeconds = (60 / currentBpm) * durationInBeats;
          
          console.log('BASS note:', note, 'duration:', durationInSeconds, 'seconds');
          synth.current.triggerAttackRelease(note, durationInSeconds);
        }
      } catch (error) {
        console.warn('Sound playing failed:', error);
      }
    },
    []
  );

  const changeVolume = (instrumentType, newVolume) => {
    if (volumes.current.hasOwnProperty(instrumentType)) {
      // 볼륨 값 검증
      const validatedVolume = Math.max(0, Math.min(1, newVolume));
      volumes.current[instrumentType] = validatedVolume;
    }
  };

  return {
    initializeAudio,
    playSound,
    changeVolume,
    volumes: volumes.current,
  };
}
