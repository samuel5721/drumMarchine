import { useState, useRef, useCallback } from "react";
import { instruments } from "../data/instruments";

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
        if (s !== "turn" && instruments[s]) {
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

  // playSound를 useCallback으로 감싸서 함수 참조를 안정화합니다.
  const playSound = useCallback((instrumentName) => {
    if (audioBuffer.current[instrumentName] && audioContext) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer.current[instrumentName];
      source.connect(gainNode.current).connect(audioContext.destination);
      gainNode.current.gain.value = volume.current;
      source.start();
    }
  }, [audioContext]);

  const changeVolume = (newVolume) => {
    volume.current = newVolume;
    if (gainNode.current) {
      gainNode.current.gain.value = volume.current;
    }
  };

  return { initializeAudio, playSound, changeVolume, audioContext, isFetched, volume };
}
