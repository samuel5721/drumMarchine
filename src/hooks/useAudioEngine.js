import { useState, useRef, useCallback } from "react";
import { instrumentTypes, instruments } from "../data/instruments";
import { frequencyMap } from "../data/scale";

export default function useAudioEngine() {
  const [audioContext, setAudioContext] = useState(null);
  const [isFetched, setIsFetched] = useState(false);
  const gainNode = useRef(null);
  const volume = useRef(0.5);
  const audioBuffer = useRef(
    Object.keys(instruments).reduce((acc, key) => ({ ...acc, [key]: null }), {})
  );

  const initializeAudio = async () => {
    if (isFetched) return;
    let localAudioContext = audioContext;
    if (!localAudioContext) {
      localAudioContext = new AudioContext();
      setAudioContext(localAudioContext);
      gainNode.current = localAudioContext.createGain();
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

  // playSound 함수 수정: 옵션 객체를 받아서, bass 케이스에서 currentBpm 사용
  const playSound = useCallback(
    (instrumentName, options = {}) => {
      if (audioContext) {
        if (instruments[instrumentName]) {
          // 기존 사운드 재생 로직
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer.current[instrumentName];
          source.connect(gainNode.current).connect(audioContext.destination);
          gainNode.current.gain.value = volume.current * 1.5;
          source.start();
        } else {
          // bass 케이스: instrumentName 예: "bass_C", "bass_C#" 등
          const [type, note] = instrumentName.split("_");
          switch (type) {
            case instrumentTypes.BASS:
              const freq = frequencyMap[note] || 65.41;
              const osc = audioContext.createOscillator();
              const gain = audioContext.createGain(); // 개별 GainNode 생성

              osc.type = "sine";
              osc.frequency.value = freq;
              osc.connect(gain).connect(audioContext.destination);

              // 볼륨 설정
              gain.gain.value = volume.current * 1.5;

              osc.start();

              // BPM 기반 sustain time (0.5 beat)
              const currentBpm = options.currentBpm || 120;
              const sustainTime = 0.5 * (60 / currentBpm);

              // 부드러운 페이드아웃 적용
              gain.gain.setTargetAtTime(
                0,
                audioContext.currentTime + sustainTime - 0.05,
                0.01
              );

              // 충분히 감쇠된 후 정지
              osc.stop(audioContext.currentTime + sustainTime);
              break;

            default:
              console.error("Invalid instrument name");
          }
        }
      }
    },
    [audioContext]
  );

  const changeVolume = (newVolume) => {
    volume.current = newVolume;
    if (gainNode.current) {
      gainNode.current.gain.value = volume.current;
    }
  };

  return {
    initializeAudio,
    playSound,
    changeVolume,
    audioContext,
    isFetched,
    volume,
  };
}
