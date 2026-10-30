
/**
 * DJ Caspian Audio Engine
 * Real audio playback + Web Audio analyser + procedural synth.
 * Handles Supabase signed URLs, playback errors and track switching.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;

  private currentSource: AudioBufferSourceNode | null = null;
  private isSynthesizing = false;
  private synthInterval: number | null = null;

  private currentTrackId: string | null = null;
  private volume = 0.8;
  private step = 0;
  private simulatedSeconds = 0;

  private timeUpdateCallback?: (current: number) => void;
  private errorCallback?: (error: Error) => void;

  constructor() {}

  private initContext(): void {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as {
          webkitAudioContext: typeof AudioContext;
        }).webkitAudioContext;

      this.ctx = new AudioCtx();

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = this.volume;

      this.analyser.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      console.log("[DJ AUDIO] AudioContext initialized");
    }
  }

  private async resumeContext(): Promise<void> {
    this.initContext();

    if (!this.ctx) return;

    if (this.ctx.state !== "running") {
      try {
        await this.ctx.resume();
      } catch (error) {
        console.error("[DJ AUDIO] Context resume failed:", error);
        throw error;
      }
    }

    console.log("[DJ AUDIO] Context state:", this.ctx.state);
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));

    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(
        this.volume,
        this.ctx.currentTime,
        0.01
      );
    }

    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getDebugInfo() {
    return {
      contextState: this.ctx?.state ?? "not initialized",
      trackId: this.currentTrackId,
      source: this.audioElement?.currentSrc ?? "",
      paused: this.audioElement?.paused ?? true,
      currentTime: this.audioElement?.currentTime ?? 0,
      duration: this.audioElement?.duration ?? 0,
      readyState: this.audioElement?.readyState ?? 0,
      networkState: this.audioElement?.networkState ?? 0,
      volume: this.audioElement?.volume ?? this.volume,
      muted: this.audioElement?.muted ?? false,
      mediaError: this.audioElement?.error?.message ?? null,
      synthesizing: this.isSynthesizing
    };
  }

  private connectAudioElement(): void {
    if (!this.ctx || !this.analyser) return;

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.preload = "auto";
      this.audioElement.crossOrigin = "anonymous";
      this.audioElement.volume = this.volume;

      this.mediaSource = this.ctx.createMediaElementSource(
        this.audioElement
      );

      this.mediaSource.connect(this.analyser);

      this.audioElement.addEventListener("playing", () => {
        console.log("[DJ AUDIO] PLAYING", this.getDebugInfo());
      });

      this.audioElement.addEventListener("canplay", () => {
        console.log("[DJ AUDIO] CAN PLAY", this.getDebugInfo());
      });

      this.audioElement.addEventListener("waiting", () => {
        console.warn("[DJ AUDIO] Waiting for audio data");
      });

      this.audioElement.addEventListener("stalled", () => {
        console.warn("[DJ AUDIO] Audio download stalled");
      });

      this.audioElement.addEventListener("ended", () => {
        console.log("[DJ AUDIO] Track ended");
      });

      this.audioElement.addEventListener("error", () => {
        console.error(
          "[DJ AUDIO] MEDIA ERROR",
          this.audioElement?.error,
          this.getDebugInfo()
        );
      });
    }
  }

  public stop(): void {
    if (this.synthInterval !== null) {
      window.clearInterval(this.synthInterval);
      this.synthInterval = null;
    }

    this.isSynthesizing = false;
    this.simulatedSeconds = 0;

    if (this.audioElement) {
      this.audioElement.pause();

      try {
        this.audioElement.currentTime = 0;
      } catch {
        // Metadata may not have loaded yet.
      }
    }

    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {
        // Source may already be stopped.
      }

      this.currentSource = null;
    }

    this.currentTrackId = null;
    this.timeUpdateCallback = undefined;
  }

  public pause(): void {
    if (this.synthInterval !== null) {
      window.clearInterval(this.synthInterval);
      this.synthInterval = null;
    }

    this.isSynthesizing = false;

    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public async playTrack(
    trackId: string,
    audioUrl?: string,
    bpm: number = 126,
    synthPreset: string = "festival_drop",
    onTimeUpdate?: (current: number) => void
  ): Promise<void> {
    try {
      await this.resumeContext();

      if (!this.ctx || !this.analyser || !this.gainNode) {
        throw new Error("Audio system could not initialize");
      }

      // Resume current track if the same track was paused.
      if (this.currentTrackId === trackId) {
        if (this.audioElement && this.audioElement.paused) {
          this.timeUpdateCallback = onTimeUpdate;
          await this.audioElement.play();
          return;
        }

        if (this.isSynthesizing) {
          return;
        }
      }

      this.stop();

      this.currentTrackId = trackId;
      this.timeUpdateCallback = onTimeUpdate;

      const isValidUrl =
        typeof audioUrl === "string" &&
        /^(https?:|blob:|data:)/i.test(audioUrl);

      if (isValidUrl && audioUrl) {
        await this.playRealAudio(audioUrl);
      } else {
        console.warn("[DJ AUDIO] No valid audio URL. Starting synth.");
        this.startSynthesizer(bpm, synthPreset);
      }
    } catch (error) {
      console.error("[DJ AUDIO] PLAY TRACK FAILED:", error);

      const normalizedError =
        error instanceof Error
          ? error
          : new Error(String(error));

      this.errorCallback?.(normalizedError);

      // Do not silently replace a real track with synthetic music.
      // This keeps the real playback failure visible during diagnosis.
    }
  }

  private async playRealAudio(url: string): Promise<void> {
    this.connectAudioElement();

    if (!this.audioElement) {
      throw new Error("Audio element could not be created");
    }

    const audio = this.audioElement;

    audio.pause();
    audio.src = url;
    audio.volume = this.volume;
    audio.muted = false;
    audio.load();

    audio.ontimeupdate = () => {
      if (this.timeUpdateCallback) {
        this.timeUpdateCallback(audio.currentTime);
      }
    };

    audio.onloadedmetadata = () => {
      console.log("[DJ AUDIO] METADATA LOADED", {
        duration: audio.duration,
        readyState: audio.readyState
      });
    };

    console.log("[DJ AUDIO] Starting real audio:", {
      urlAvailable: Boolean(url),
      volume: audio.volume,
      contextState: this.ctx?.state
    });

    try {
      await audio.play();

      console.log("[DJ AUDIO] PLAY PROMISE RESOLVED", {
        paused: audio.paused,
        currentTime: audio.currentTime,
        duration: audio.duration,
        contextState: this.ctx?.state
      });
    } catch (error) {
      console.error("[DJ AUDIO] BROWSER PLAY ERROR:", error);
      throw error;
    }
  }

  public setErrorCallback(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }

  private startSynthesizer(
    bpm: number,
    preset: string
  ): void {
    if (!this.ctx || !this.analyser) return;

    this.stopSynthOnly();

    this.isSynthesizing = true;
    this.step = 0;
    this.simulatedSeconds = 0;

    const safeBpm = Math.max(40, Math.min(240, bpm));
    const intervalMs = (60 / safeBpm / 4) * 1000;

    const notesFestival = [
      130.81, 146.83, 155.56, 174.61,
      196.00, 207.65, 246.94, 261.63
    ];

    const notesDeep = [
      65.41, 77.78, 87.31, 98.00,
      116.54, 130.81
    ];

    this.synthInterval = window.setInterval(() => {
      if (!this.ctx || !this.isSynthesizing) return;

      const time = this.ctx.currentTime;
      const s = this.step % 16;

      if ([0, 4, 8, 12].includes(s)) {
        this.triggerKick(time);
      }

      if ([2, 6, 10, 14].includes(s)) {
        this.triggerHiHat(time, false);
      }

      if (s % 2 !== 0) {
        this.triggerHiHat(time, true);
      }

      if (preset === "persian_club" || preset === "festival_drop") {
        if (s % 2 === 0) {
          const note =
            notesFestival[
              (s * 3 + Math.floor(this.step / 16)) %
                notesFestival.length
            ];

          this.triggerBassLead(time, note, 0.12, "sawtooth");
        }
      } else if ([2, 6, 10, 14, 15].includes(s)) {
        const note =
          notesDeep[Math.floor(this.step / 8) % notesDeep.length];

        this.triggerBassLead(time, note, 0.16, "triangle");
      }

      if (s === 4 || s === 12) {
        this.triggerClap(time);
      }

      this.step++;
      this.simulatedSeconds += intervalMs / 1000;

      this.timeUpdateCallback?.(this.simulatedSeconds);
    }, intervalMs);
  }

  private stopSynthOnly(): void {
    if (this.synthInterval !== null) {
      window.clearInterval(this.synthInterval);
      this.synthInterval = null;
    }

    this.isSynthesizing = false;
  }

  private triggerKick(time: number): void {
    if (!this.ctx || !this.analyser) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.analyser);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  private triggerHiHat(time: number, isClosed: boolean): void {
    if (!this.ctx || !this.analyser) return;

    const duration = isClosed ? 0.04 : 0.12;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);

    const buffer = this.ctx.createBuffer(
      1,
      bufferSize,
      this.ctx.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(isClosed ? 7000 : 5000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isClosed ? 0.15 : 0.25, time);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      time + duration
    );

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);

    noise.start(time);
    noise.stop(time + duration + 0.03);
  }

  private triggerClap(time: number): void {
    if (!this.ctx || !this.analyser) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.18);
    const buffer = this.ctx.createBuffer(
      1,
      bufferSize,
      this.ctx.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] =
        (Math.random() * 2 - 1) *
        Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1100, time);
    filter.Q.setValueAtTime(2, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);

    noise.start(time);
    noise.stop(time + 0.2);
  }

  private triggerBassLead(
    time: number,
    freq: number,
    duration: number,
    type: OscillatorType
  ): void {
    if (!this.ctx || !this.analyser) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, time);
    filter.frequency.exponentialRampToValueAtTime(
      400,
      time + duration
    );

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      time + duration
    );

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  public generateVipDownloadBlob(
    title: string,
    artist: string,
    bpm: number = 128
  ): Blob {
    const sampleRate = 44100;
    const durationSeconds = 30;
    const numSamples = sampleRate * durationSeconds;

    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, value: string) => {
      for (let i = 0; i < value.length; i++) {
        view.setUint8(offset + i, value.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, numSamples * 2, true);

    const frequency = 130.81;
    const safeBpm = Math.max(40, Math.min(240, bpm));
    const beatInterval = 60 / safeBpm;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const beat = (t % beatInterval) / beatInterval;

      const kick =
        Math.sin(
          2 * Math.PI *
          (55 + 90 * Math.exp(-beat * 25)) * t
        ) * Math.exp(-beat * 8);

      const bass =
        Math.sin(2 * Math.PI * frequency * t) * 0.4;

      const sample = Math.max(-1, Math.min(1, kick + bass));

      view.setInt16(
        44 + i * 2,
        sample < 0
          ? sample * 0x8000
          : sample * 0x7FFF,
        true
      );
    }

    return new Blob([buffer], { type: "audio/wav" });
  }
}

export const audioEngine = new AudioEngine();
