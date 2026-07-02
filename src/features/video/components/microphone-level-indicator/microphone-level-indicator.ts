import { Component, DestroyRef, OnInit, inject, signal, computed } from '@angular/core';

@Component({
  selector: 'app-microphone-level-indicator',
  standalone: true,
  templateUrl: './microphone-level-indicator.html',
  styleUrl: './microphone-level-indicator.css',
})
export class MicrophoneLevelIndicator implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private rafId: number | null = null;

  private readonly _level = signal(0);
  private readonly _active = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly level = this._level.asReadonly();
  readonly active = this._active.asReadonly();
  readonly error = this._error.asReadonly();

  readonly barPercent = computed(() => {
    return Math.min(Math.round((this._level() / 255) * 100), 100);
  });

  readonly barClass = computed(() => {
    const pct = this.barPercent();
    if (pct < 30) return 'level-bar--low';
    if (pct < 60) return 'level-bar--medium';
    return 'level-bar--high';
  });

  ngOnInit(): void {
    this.start();
  }

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.stop();
    });
  }

  async start(): Promise<void> {
    if (this._active()) return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);

      this.dataArray = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
      this._active.set(true);
      this._error.set(null);
      this.loop();
    } catch (err) {
      const msg = String(err);
      if (msg.includes('NotAllowed') || msg.includes('PermissionDenied')) {
        this._error.set('لم يتم السماح باستخدام الميكروفون.');
      } else {
        this._error.set('تعذر الوصول إلى الميكروفون.');
      }
    }
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop();
      }
      this.stream = null;
    }

    this.analyser = null;
    this.dataArray = null;
    this._level.set(0);
    this._active.set(false);
  }

  private loop(): void {
    if (!this.analyser || !this.dataArray) return;

    (this.analyser as any).getByteTimeDomainData(this.dataArray);

    let max = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const v = Math.abs(this.dataArray[i] - 128);
      if (v > max) max = v;
    }

    this._level.set(max);

    this.rafId = requestAnimationFrame(() => this.loop());
  }
}
