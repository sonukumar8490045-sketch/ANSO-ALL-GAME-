/**
 * Procedural Web Audio Sound Synthesizer for FUTURE FUSION GAMES
 * Zero external audio files, completely reliable and instantaneous.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  constructor() {
    // Sound will initialize on first user interaction to comply with browser autoplay policies
  }

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isMuted ? 0 : 0.25;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.25, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Sound when slot lever is pulled or spin button pressed
   */
  public playSpinStart() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.18);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.35);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  /**
   * Sound when each reel clicks or locks in place
   */
  public playReelStop(reelIndex: number = 0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 180 + reelIndex * 50;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  /**
   * Sound when player scores a win
   */
  public playWin(multiplier: number = 2) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const notes = multiplier >= 5 ? [523.25, 659.25, 783.99, 1046.5, 1318.5] : [440, 554.37, 659.25, 880];
    const duration = 0.09;
    const startT = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = startT + idx * duration;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration * 1.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + duration * 1.6);
    });
  }

  /**
   * Grand fanfare for Mega Jackpot
   */
  public playJackpot() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t0 = this.ctx.currentTime;
    const chord1 = [261.63, 329.63, 392.0, 523.25]; // C major
    const chord2 = [349.23, 440.0, 523.25, 698.46]; // F major
    const chord3 = [392.0, 493.88, 587.33, 783.99]; // G major
    const chord4 = [523.25, 659.25, 783.99, 1046.5]; // High C major

    const progression = [
      { chord: chord1, at: 0 },
      { chord: chord2, at: 0.25 },
      { chord: chord3, at: 0.5 },
      { chord: chord4, at: 0.75 },
    ];

    progression.forEach(({ chord, at }) => {
      chord.forEach((freq) => {
        if (!this.ctx || !this.masterGain) return;
        const t = t0 + at;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.36);
      });
    });
  }

  /**
   * Underwater / laser fishing sounds
   */
  public playLaserShot() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playFishCatch(isBig: boolean = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isBig ? 240 : 440, t);
    osc.frequency.exponentialRampToValueAtTime(isBig ? 880 : 880, t + 0.15);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  /**
   * Subtle UI click / futuristic button beep
   */
  public playUiClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.04);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  public playCoinDing() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(2200, t + 0.1);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.16);
  }
}

export const sound = new SoundService();
