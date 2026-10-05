"use client";

/** Pick a MediaRecorder MIME type the browser supports. iOS Safari needs audio/mp4. */
export function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/aac"];
  return candidates.find((t) => {
    try {
      return MediaRecorder.isTypeSupported(t);
    } catch {
      return false;
    }
  });
}

export function recordingSupported(): boolean {
  return typeof window !== "undefined" && typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

export class Recorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private raf = 0;
  private data: Uint8Array<ArrayBuffer> | null = null;
  mimeType: string | undefined;

  constructor(private onLevels?: (levels: number[]) => void) {}

  /** Must be called from a user gesture so iOS grants the microphone permission. */
  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    this.mimeType = pickMimeType();
    this.recorder = new MediaRecorder(this.stream, this.mimeType ? { mimeType: this.mimeType } : undefined);
    this.chunks = [];
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.recorder.start(250);
    this.startMeter();
  }

  private startMeter() {
    if (!this.stream || !this.onLevels) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    const source = this.ctx.createMediaStreamSource(this.stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.6;
    source.connect(this.analyser);
    this.data = new Uint8Array(this.analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
    const tick = () => {
      if (!this.analyser || !this.data) return;
      this.analyser.getByteFrequencyData(this.data);
      const bins = Array.from(this.data.slice(0, 24));
      this.onLevels?.(bins.map((v) => v / 255));
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  async stop(): Promise<Blob> {
    const rec = this.recorder;
    const type = this.mimeType ?? "audio/webm";
    const blob = await new Promise<Blob>((resolve) => {
      if (!rec || rec.state === "inactive") return resolve(new Blob(this.chunks, { type }));
      rec.onstop = () => resolve(new Blob(this.chunks, { type }));
      rec.stop();
    });
    this.cleanup();
    return blob;
  }

  cancel() {
    try {
      if (this.recorder && this.recorder.state !== "inactive") this.recorder.stop();
    } catch {
      /* ignore */
    }
    this.cleanup();
  }

  private cleanup() {
    cancelAnimationFrame(this.raf);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.recorder = null;
    this.analyser = null;
    void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
  }
}
