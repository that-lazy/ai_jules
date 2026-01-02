import * as Speech from 'expo-speech';

export const SpeechService = {
  speak: (text: string) => {
    Speech.stop(); // Stop any previous speech
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9,
    });
  },

  stop: () => {
    Speech.stop();
  }
};
