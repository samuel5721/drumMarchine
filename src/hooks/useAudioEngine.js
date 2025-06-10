import { useState, useRef, useCallback } from "react";
import { instrumentTypes, instruments } from "../data/instruments";
import { frequencyMap } from "../data/scale";

export default function useAudioEngine() {
  const [audioContext, setAudioContext] = useState(null);
  const [isFetched, setIsFetched] = useState(false);
  const gainNodes = useRef({});
  const masterGainNode = useRef(null);
  const volumes = useRef({
    [instrumentTypes.DRUM]: 0.5,
    [instrumentTypes.BASS]: 0.5,
    [instrumentTypes.ELECTRIC_GUITAR]: 0.5,
    master: 0.5
  });
  const audioBuffer = useRef(
    Object.keys(instruments).reduce((acc, key) => ({ ...acc, [key]: null }), {})
  );

  const initializeAudio = async () => {
    if (isFetched) return;
    let localAudioContext = audioContext;
    if (!localAudioContext) {
      localAudioContext = new AudioContext();
      setAudioContext(localAudioContext);
      
      // 마스터 GainNode 생성
      masterGainNode.current = localAudioContext.createGain();
      masterGainNode.current.connect(localAudioContext.destination);
      masterGainNode.current.gain.value = volumes.current.master;
      
      // Drum과 Bass 세트별로 GainNode 생성
      Object.entries(instrumentTypes).forEach(([key, type]) => {
        gainNodes.current[type] = localAudioContext.createGain();
        gainNodes.current[type].connect(masterGainNode.current);
        const volume = volumes.current[type] || 0.5;
        gainNodes.current[type].gain.setValueAtTime(volume * 2, localAudioContext.currentTime);
      });
      
      await localAudioContext.resume();
    }
    try {
      for (let s in instruments) {
        if (instruments[s]) {
          const response = await fetch(instruments[s]);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = await localAudioContext.decodeAudioData(arrayBuffer);
          audioBuffer.current[s] = buffer;
        }
      }
    } catch (e) {
      console.error("Error fetching or decoding audio", e);
    }
    setIsFetched(true);
  };

  const playSound = useCallback(
    (instrumentName, options = {}) => {
      if (audioContext) {
        if (instruments[instrumentName]) {
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer.current[instrumentName];
          source.connect(gainNodes.current[instrumentTypes.DRUM]);
          source.start();
        } else {
          const [type, note] = instrumentName.split("_");
          let oscType = '';
          switch(type) {
            case instrumentTypes.BASS: oscType = 'sine'; break;
            case instrumentTypes.ELECTRIC_GUITAR: oscType = 'triangle'; break;
            default: console.error('Invalid instrument type:', type); break;
          }


          const freq = frequencyMap[note] || 65.41;
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();

          osc.type = oscType;
          osc.frequency.value = freq;
          osc.connect(gain).connect(gainNodes.current[instrumentTypes.BASS]);

          // 볼륨 값을 0.0001 이상으로 제한
          const volumeValue = Math.max(volumes.current[instrumentTypes.BASS] * 4, 0.0001);
          gain.gain.value = volumeValue;

          osc.start();

          const currentBpm = options.currentBpm || 120;
          // sustainStep이 있으면 그만큼 지속, 없으면 기본값
          const sustainStep = options.sustainStep || 1;
          // 한 스텝의 시간(16분음표 기준)
          const stepTime = (60 / currentBpm) / 4;
          const sustainTime = sustainStep * stepTime;

          gain.gain.setTargetAtTime(
            0,
            audioContext.currentTime + sustainTime - 0.05,
            0.01
          );

          osc.stop(audioContext.currentTime + sustainTime);
        }
      }
    },
    [audioContext]
  );

  const changeVolume = (instrumentType, newVolume) => {
    // 볼륨 값을 0.0001 이상으로 제한
    const safeVolume = Math.max(newVolume, 0.0001);
    
    if (instrumentType === 'master') {
      volumes.current.master = safeVolume;
      if (masterGainNode.current) {
        masterGainNode.current.gain.value = safeVolume;
      }
    } else {
      volumes.current[instrumentType] = safeVolume;
      if (gainNodes.current[instrumentType]) {
        gainNodes.current[instrumentType].gain.value = safeVolume * 2;
      }
    }
  };

  return {
    initializeAudio,
    playSound,
    changeVolume,
    volumes: volumes.current,
  };
}
