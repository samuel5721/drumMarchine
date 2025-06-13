// 드럼 신디사이저 설정
export const drumSynthConfigs = {
  // 킥드럼 (Kick)
  kick: {
    type: 'MembraneSynth',
    options: {
      pitchDecay: 0.05,
      octaves: 6,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.1 }
    },
    playOptions: {
      note: "C1",
      duration: "8n"
    }
  },

  // 스네어 (Snare)
  snare: {
    type: 'NoiseSynth',
    options: {
      noise: { type: "white" },
      envelope: { 
        attack: 0.005, 
        decay: 0.1, 
        sustain: 0, 
        release: 0.1 
      }
    },
    playOptions: {
      duration: "8n"
    }
  },

  // 하이햇 (Hi-hat)
  hiHat: {
    type: 'NoiseSynth',
    options: {
      noise: { type: "white" },
      envelope: { 
        attack: 0.001, 
        decay: 0.05, 
        sustain: 0, 
        release: 0.01 
      }
    },
    playOptions: {
      duration: "16n"
    }
  },

  // 크래쉬 심벌 (Crash)
  crash: {
    type: 'MetalSynth',
    options: {
      frequency: 300,
      envelope: { attack: 0.001, decay: 1, release: 3 },
      harmonicity: 5.1,
      modulationIndex: 64,
      resonance: 4000,
      octaves: 1.5
    },
    playOptions: {
      note: "C4",
      duration: "2n"
    }
  },

  // 하이탐 (High Tom)
  highTom: {
    type: 'MembraneSynth',
    options: {
      pitchDecay: 0.1,
      octaves: 4,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.1 }
    },
    playOptions: {
      note: "E2",
      duration: "8n"
    }
  },

  // 미들탐 (Middle Tom)
  midTom: {
    type: 'MembraneSynth',
    options: {
      pitchDecay: 0.1,
      octaves: 4,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.1 }
    },
    playOptions: {
      note: "C2",
      duration: "8n"
    }
  },

  // 로우탐 (Low Tom)
  lowTom: {
    type: 'MembraneSynth',
    options: {
      pitchDecay: 0.1,
      octaves: 4,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.1 }
    },
    playOptions: {
      note: "A1",
      duration: "8n"
    }
  }
}; 