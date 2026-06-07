// Web Speech API wrapper for English TTS
class TTS {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.rate = 1;
    this._initVoice();
    // Chrome requires user gesture to load voices; retry on first speak
    this._voiceReady = false;
  }

  _initVoice() {
    const voices = this.synth.getVoices();
    // Prefer an English voice
    const enVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
      || voices.find(v => v.lang.startsWith('en-US'))
      || voices.find(v => v.lang.startsWith('en-GB'))
      || voices.find(v => v.lang.startsWith('en'));
    if (enVoice) {
      this.voice = enVoice;
      this._voiceReady = true;
    }
  }

  speak(text, rate = null) {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synth.cancel();

      // Ensure voices are loaded (Chrome lazy-loads them)
      if (!this._voiceReady) {
        this._initVoice();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.voice;
      utterance.rate = rate || this.rate;
      utterance.lang = 'en-US';
      utterance.pitch = 1;

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        if (e.error === 'canceled' || e.error === 'interrupted') {
          resolve();
        } else {
          reject(e);
        }
      };

      this.synth.speak(utterance);
    });
  }

  speakWord(word) {
    return this.speak(word, 0.85); // Slower for clarity
  }

  setRate(rate) {
    this.rate = rate;
  }

  stop() {
    this.synth.cancel();
  }

  isSpeaking() {
    return this.synth.speaking;
  }
}

export const tts = new TTS();
