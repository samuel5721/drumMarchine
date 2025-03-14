import { useState, useRef, useCallback } from "react";
import { instruments } from "../data/instruments";
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
          gainNode.current.gain.value = volume.current;
          source.start();
        } else {
          // bass 케이스: instrumentName 예: "bass_C", "bass_C#" 등
          const [type, note] = instrumentName.split("_");
          if (type === "bass") {
            const freq = frequencyMap[note] || 65.41;
            const osc = audioContext.createOscillator();
            osc.type = "sine";
            osc.frequency.value = freq;
            osc.connect(gainNode.current).connect(audioContext.destination);
            gainNode.current.gain.value = volume.current;
            osc.start();
            // BPM 기반 sustain time (0.5 beat)
            // options.currentBpm를 사용 (없으면 기본값 120)
            const currentBpm = options.currentBpm || 120;
            const sustainTime = 0.25 * (60 / currentBpm);
            osc.stop(audioContext.currentTime + sustainTime);
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
