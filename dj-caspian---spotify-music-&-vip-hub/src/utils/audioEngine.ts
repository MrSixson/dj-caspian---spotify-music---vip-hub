/**
 * Web Audio Engine for DJ Caspian Spotify Player
 * Supports:
 * - HTMLAudioElement playback for uploaded/URL tracks
 * - Procedural electronic synth (kicks, sub-bass, hi-hats, synth leads) for tracks
 * - Real-time frequency analyzer for audio visualizers
 * - Exportable audio blobs for VIP downloads
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private isSynthesizing = false;
  private synthInterval: number | null = null;
  private currentTrackId: string | null = null;
  private volume: number = 0.8;
  private step: number = 0;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.analyser.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public stop() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.isSynthesizing = false;

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {
        // already stopped
      }
      this.currentSource = null;
    }
    this.currentTrackId = null;
  }

  public pause() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.isSynthesizing = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public playTrack(
    trackId: string,
    audioUrl?: string,
    bpm: number = 126,
    synthPreset: string = 'festival_drop',
    onTimeUpdate?: (current: number) => void
  ) {
    this.initContext();
    if (!this.ctx || !this.gainNode || !this.analyser) return;

    if (this.currentTrackId === trackId && (this.audioElement || this.isSynthesizing)) {
      // Resume
      if (this.audioElement && this.audioElement.paused) {
        this.audioElement.play().catch(() => {});
        return;
      }
    }

    this.stop();
    this.currentTrackId = trackId;

    if (audioUrl && (audioUrl.startsWith('data:') || audioUrl.startsWith('blob:') || audioUrl.startsWith('http'))) {
      // Play real audio file
      if (!this.audioElement) {
        this.audioElement = new Audio();
        const source = this.ctx.createMediaElementSource(this.audioElement);
        source.connect(this.analyser);
        this.analyser.connect(this.gainNode);
      }
      this.audioElement.src = audioUrl;
      this.audioElement.volume = this.volume;
      this.audioElement.ontimeupdate = () => {
        if (onTimeUpdate && this.audioElement) {
          onTimeUpdate(this.audioElement.currentTime);
        }
      };
      this.audioElement.play().catch((err) => {
        console.warn('Playback error, falling back to synthesizer', err);
        this.startSynthesizer(bpm, synthPreset, onTimeUpdate);
      });
    } else {
      // Synthesize rhythmic DJ Caspian electronic dance track!
      this.startSynthesizer(bpm, synthPreset, onTimeUpdate);
    }
  }

  private startSynthesizer(bpm: number, preset: string, onTimeUpdate?: (current: number) => void) {
    if (!this.ctx || !this.gainNode || !this.analyser) return;
    this.isSynthesizing = true;
    this.step = 0;
    const intervalMs = (60 / bpm / 4) * 1000; // 16th notes
    let simulatedSeconds = 0;

    // DJ Caspian scale notes (Persian Chahargah / Harmonic Minor & Deep Techno scales)
    const notesFestival = [130.81, 146.83, 155.56, 174.61, 196.00, 207.65, 246.94, 261.63]; // Harmonic minor
    const notesDeep = [65.41, 77.78, 87.31, 98.00, 116.54, 130.81]; // Deep bass notes

    this.synthInterval = window.setInterval(() => {
      if (!this.ctx || !this.gainNode || !this.analyser || !this.isSynthesizing) return;

      const time = this.ctx.currentTime;
      const s = this.step % 16;

      // 1. Kick drum on 0, 4, 8, 12 (4-on-the-floor DJ club beat)
      if (s === 0 || s === 4 || s === 8 || s === 12) {
        this.triggerKick(time);
      }

      // 2. Offbeat Hi-Hat on 2, 6, 10, 14
      if (s === 2 || s === 6 || s === 10 || s === 14) {
        this.triggerHiHat(time, false);
      }
      // Shaker/closed hat on 16th notes
      if (s % 2 !== 0) {
        this.triggerHiHat(time, true);
      }

      // 3. Bassline / Lead Synth
      if (preset === 'persian_club' || preset === 'festival_drop') {
        if (s % 2 === 0) {
          const note = notesFestival[(s * 3 + Math.floor(this.step / 16)) % notesFestival.length];
          this.triggerBassLead(time, note, 0.12, 'sawtooth');
        }
      } else {
        // Deep groove / Tech house rolling sub
        if (s === 2 || s === 6 || s === 10 || s === 14 || s === 15) {
          const note = notesDeep[(Math.floor(this.step / 8)) % notesDeep.length];
          this.triggerBassLead(time, note, 0.16, 'triangle');
        }
      }

      // Snare / Clap on 4 and 12
      if (s === 4 || s === 12) {
        this.triggerClap(time);
      }

      this.step++;
      simulatedSeconds += intervalMs / 1000;
      if (onTimeUpdate) {
        onTimeUpdate(simulatedSeconds);
      }
    }, intervalMs);
  }

  private triggerKick(time: number) {
    if (!this.ctx || !this.gainNode || !this.analyser) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.analyser);
    this.analyser.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  private triggerHiHat(time: number, isClosed: boolean) {
    if (!this.ctx || !this.gainNode || !this.analyser) return;
    // Buffer noise
    const bufferSize = this.ctx.sampleRate * (isClosed ? 0.04 : 0.12);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(isClosed ? 7000 : 5000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isClosed ? 0.15 : 0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (isClosed ? 0.04 : 0.12));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);
    this.analyser.connect(this.gainNode);

    noise.start(time);
    noise.stop(time + (isClosed ? 0.05 : 0.15));
  }

  private triggerClap(time: number) {
    if (!this.ctx || !this.gainNode || !this.analyser) return;
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, time);
    filter.Q.setValueAtTime(2, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);
    this.analyser.connect(this.gainNode);

    noise.start(time);
    noise.stop(time + 0.2);
  }

  private triggerBassLead(time: number, freq: number, duration: number, type: OscillatorType) {
    if (!this.ctx || !this.gainNode || !this.analyser) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, time);
    filter.frequency.exponentialRampToValueAtTime(400, time + duration);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);
    this.analyser.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  /**
   * Generates a downloadable high-quality WAV audio file for VIP users
   */
  public generateVipDownloadBlob(title: string, artist: string, bpm: number = 128): Blob {
    const sampleRate = 44100;
    const durationSeconds = 30; // 30 sec high quality preview / clip
    const numSamples = sampleRate * durationSeconds;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // Write WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // PCM
    view.setUint16(20, 1, true); // 1 channel
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true); // 16-bit
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Generate dance synth waveform data
    const freq1 = 130.81;
    const beatInterval = 60 / bpm;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const beat = (t % beatInterval) / beatInterval;
      // Kick transient + bass
      const kick = Math.sin(2 * Math.PI * (55 + 90 * Math.exp(-beat * 25)) * t) * Math.exp(-beat * 8);
      const bass = Math.sin(2 * Math.PI * freq1 * t) * 0.4;
      const sample = Math.max(-1, Math.min(1, kick + bass));
      view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }
}

export const audioEngine = new AudioEngine();
