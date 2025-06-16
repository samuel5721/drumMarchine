export const drumSynthConfigs = {
  kick: {
    type: 'MembraneSynth',
    config: {
      pitchDecay: 0.05,
      octaves: 10,
      oscillator: {
        type: 'sine4'
      },
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0.01,
        release: 1.4,
        attackCurve: 'exponential'
      }
    },
    playOptions: {
      note: 'C1',
      duration: '16n',
      volume: 10,
    }
  },
  snare: {
    type: 'NoiseSynth',
    config: {
      noise: {
        type: 'white'
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0
      }
    },
    playOptions: {
      duration: '16n',
      volume: 8  // 기본 볼륨 증가
    }
  },
  hihat: {
    type: 'NoiseSynth',
    config: {
      noise: {
        type: 'white'
      },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0
      }
    },
    playOptions: {
      duration: '16n',
      volume: 6  // 기본 볼륨 증가
    }
  },
  ride: {
    type: 'NoiseSynth',
    config: {
      noise: {
        type: 'white'
      },
      envelope: {
        attack: 0.001,
        decay: 0.3,
        sustain: 0
      }
    },
    playOptions: {
      duration: '16n',
      volume: 7  // 기본 볼륨 증가
    }
  }
}; 