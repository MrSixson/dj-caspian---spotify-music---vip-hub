/**
 * DJ Caspian Audio Engine
 * Real audio playback only.
 * No procedural synth fallback.
 * Handles Supabase signed URLs, playback errors and track switching.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;

  private currentTrackId: string | null = null;
  private volume = 0.8;

  private timeUpdateCallback?: (current: number) => void;
  private errorCallback?: (error: Error) => void;

  private initContext(): void {
    if (this.ctx) return;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as {
        webkitAudioContext: typeof AudioContext;
      }).webkitAudioContext;

    if (!AudioCtx) {
      throw new Error("Web Audio API is not supported by this browser.");
    }

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

  private async resumeContext(): Promise<void> {
    this.initContext();

    if (this.ctx && this.ctx.state !== "running") {
      await this.ctx.resume();
    }

    if (this.ctx?.state !== "running") {
      throw new Error("AudioContext could not start.");
    }
  }

  private connectAudioElement(): void {
    if (!this.ctx || !this.analyser) {
      throw new Error("Audio system is not initialized.");
    }

    if (this.audioElement) return;

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

  public getVolume(): number {
    return this.volume;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
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
      synthesizing: false
    };
  }

  public stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();

      try {
        this.audioElement.currentTime = 0;
      } catch {
        // Metadata may not be loaded yet.
      }

      this.audioElement.removeAttribute("src");
      this.audioElement.load();
    }

    this.currentTrackId = null;
    this.timeUpdateCallback = undefined;
  }

  public pause(): void {
    this.audioElement?.pause();
  }

  public async playTrack(
    trackId: string,
    audioUrl?: string,
    _bpm: number = 126,
    _synthPreset: string = "festival_drop",
    onTimeUpdate?: (current: number) => void
  ): Promise<void> {
    try {
      if (
        typeof audioUrl !== "string" ||
        !/^https?:\/\//i.test(audioUrl)
      ) {
        throw new Error(
          "لینک آهنگ اصلی در دسترس نیست. پخش آهنگ متوقف شد."
        );
      }

      await this.resumeContext();
      this.connectAudioElement();

      if (!this.audioElement) {
        throw new Error("Audio element could not be created.");
      }

      if (
        this.currentTrackId === trackId &&
        !this.audioElement.paused
      ) {
        return;
      }

      if (
        this.currentTrackId === trackId &&
        this.audioElement.paused &&
        this.audioElement.currentSrc
      ) {
        this.timeUpdateCallback = onTimeUpdate;
        await this.audioElement.play();
        return;
      }

      this.stop();

      this.currentTrackId = trackId;
      this.timeUpdateCallback = onTimeUpdate;

      const audio = this.audioElement;

      audio.pause();
      audio.src = audioUrl;
      audio.volume = this.volume;
      audio.muted = false;

      audio.ontimeupdate = () => {
        this.timeUpdateCallback?.(audio.currentTime);
      };

      audio.onloadedmetadata = () => {
        console.log("[DJ AUDIO] METADATA LOADED", {
          duration: audio.duration,
          readyState: audio.readyState
        });
      };

      audio.onerror = () => {
        const mediaError = audio.error;
        let message = "Audio loading failed.";
        if (mediaError) {
          message = "Audio loading failed. Media error code: " + mediaError.code;
        }

        console.error("[DJ AUDIO]", message, this.getDebugInfo());
        this.errorCallback?.(new Error(message));
      };

      audio.load();

      console.log("[DJ AUDIO] Loading real audio", {
        trackId,
        urlAvailable: Boolean(audioUrl)
      });

      await audio.play();

      console.log("[DJ AUDIO] PLAY PROMISE RESOLVED", {
        paused: audio.paused,
        currentTime: audio.currentTime,
        duration: audio.duration,
        contextState: this.ctx?.state
      });
    } catch (error) {
      console.error("[DJ AUDIO] PLAY TRACK FAILED:", error);

      const normalizedError =
        error instanceof Error
          ? error
          : new Error(String(error));

      this.errorCallback?.(normalizedError);
      throw normalizedError;
    }
  }

  public setErrorCallback(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }
}

export const audioEngine = new AudioEngine();
