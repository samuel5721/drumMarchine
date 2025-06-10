import kick from "../assets/sound/drum_kick.wav";
import snare from "../assets/sound/drum_snare.wav";
import hiHat from "../assets/sound/drum_hiHat.wav";
import cowBell from "../assets/sound/drum_cowBell.mp3";

export const instrumentTypes = {
  DRUM: "drum",
  BASS: "bass",
  ELECTRIC_GUITAR: "electric Guitar",
};

export const instruments = {
  kick,
  snare,
  hiHat,
  cowBell,
};

export const instrumentDrumOrder = ["cowBell", "hiHat", "snare", "kick"];

//bass 순서 반대로
export const instrumentBassOrder = [
  "bass_B",
  "bass_A",
  "bass_G",
  "bass_F",
  "bass_E",
  "bass_D",
  "bass_C",
];

export const instrumentElectricGuitarOrder = [
  "Eg_B",
  "Eg_A",
  "Eg_G",
  "Eg_F",
  "Eg_E",
  "Eg_D",
  "Eg_C",
]