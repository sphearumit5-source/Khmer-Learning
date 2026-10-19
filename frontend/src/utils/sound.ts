// Child-friendly Web Audio Synthesizer for Khmer Learning

class SoundManager {
  private audioCtx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {
      // ignore
    }
  }

  playCorrect() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.audioCtx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx!.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.2, this.audioCtx!.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx!.currentTime + idx * 0.09 + 0.2);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);
        osc.start(this.audioCtx!.currentTime + idx * 0.09);
        osc.stop(this.audioCtx!.currentTime + idx * 0.09 + 0.25);
      });
    } catch (e) {
      // ignore
    }
  }

  playWrong() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, this.audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(200, this.audioCtx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
    } catch (e) {
      // ignore
    }
  }

  playFanfare() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.audioCtx) return;

    try {
      const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      arpeggio.forEach((f, i) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, this.audioCtx!.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.25, this.audioCtx!.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx!.currentTime + i * 0.12 + 0.4);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);
        osc.start(this.audioCtx!.currentTime + i * 0.12);
        osc.stop(this.audioCtx!.currentTime + i * 0.12 + 0.45);
      });
    } catch (e) {
      // ignore
    }
  }

  speakText(text: string, rate: number = 0.9): Promise<void> {
    return new Promise((resolve) => {
      if (!this.enabled || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      // Clean HTML tags if text contains markup
      const cleanText = text.replace(/<[^>]*>?/gm, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = rate;

      // Try finding Khmer or regional voices
      const voices = window.speechSynthesis.getVoices();
      const khmerVoice = voices.find(v => v.lang.includes('km') || v.lang.includes('kh'));
      if (khmerVoice) {
        utterance.voice = khmerVoice;
        utterance.lang = 'km-KH';
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const sounds = new SoundManager();
