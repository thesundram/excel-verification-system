class AudioManager {
  private successAudio: HTMLAudioElement | null = null;
  private errorAudio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.successAudio = new Audio('/success.mp3');
        this.errorAudio = new Audio('/error.mp3');
        this.successAudio.load();
        this.errorAudio.load();
      } catch (error) {
        console.warn('Failed to initialize audio elements:', error);
      }
    }
  }

  private initContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
          this.audioContext = new AudioContextClass();
      }
    }
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
  }

  playSuccess() {
    if (this.successAudio) {
      this.successAudio.currentTime = 0;
      this.successAudio.play().catch(() => this.playSyntheticSuccess());
    } else {
      this.playSyntheticSuccess();
    }
  }

  playError() {
    if (this.errorAudio) {
      this.errorAudio.currentTime = 0;
      this.errorAudio.play().catch(() => this.playSyntheticError());
    } else {
      this.playSyntheticError();
    }
  }

  playWarning() {
    this.playSyntheticWarning();
  }

  playInfo() {
    this.playSyntheticInfo();
  }

  // Professional Synthetic Sounds 
  private playTone(frequency: number, type: OscillatorType, duration: number, startTimeOffset = 0, volume = 0.1) {
    try {
      this.initContext();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      const startTime = this.audioContext.currentTime + startTimeOffset;
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + Math.min(0.05, duration / 2));
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    } catch(e) {
      console.warn('AudioContext playback failed', e);
    }
  }

  private playSyntheticSuccess() {
    // Classic successful POS double chime (C6, E6)
    this.playTone(1046.50, 'sine', 0.15, 0, 0.2); 
    this.playTone(1318.51, 'sine', 0.3, 0.1, 0.2);
  }

  private playSyntheticError() {
    // Deep double buzz (like a buzzer)
    this.playTone(150, 'sawtooth', 0.2, 0, 0.2);
    this.playTone(150, 'sawtooth', 0.3, 0.25, 0.2);
  }

  private playSyntheticWarning() {
    // Attention-grabbing double mid-pitch beep
    this.playTone(440, 'square', 0.15, 0, 0.1);
    this.playTone(440, 'square', 0.2, 0.2, 0.1);
  }

  private playSyntheticInfo() {
    // Single crisp high beep (like a laser scanner or click)
    this.playTone(2000, 'sine', 0.1, 0, 0.05);
  }
}

export const audioManager = new AudioManager();
