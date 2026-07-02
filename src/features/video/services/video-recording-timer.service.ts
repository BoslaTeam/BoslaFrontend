import { Injectable, signal } from '@angular/core';
import type { Signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VideoRecordingTimerService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private _startedAt: number | null = null;

  private readonly _elapsedMs = signal(0);
  private readonly _formatted = signal('00:00');
  private readonly _isActive = signal(false);

  readonly elapsed: Signal<number> = this._elapsedMs.asReadonly();
  readonly formatted: Signal<string> = this._formatted.asReadonly();
  readonly isActive: Signal<boolean> = this._isActive.asReadonly();

  start(startedAtUtc: string): void {
    this.stop();
    const ts = new Date(startedAtUtc).getTime();
    if (!Number.isFinite(ts)) return;

    this._startedAt = ts;
    this._isActive.set(true);
    this._elapsedMs.set(Math.max(0, Date.now() - ts));
    this._formatted.set(this.format(this._elapsedMs()));
    this.startInterval();
  }

  stop(): void {
    this.stopInterval();
    this._startedAt = null;
    this._elapsedMs.set(0);
    this._formatted.set('00:00');
    this._isActive.set(false);
  }

  private startInterval(): void {
    this.stopInterval();
    this.intervalId = setInterval(() => {
      if (this._startedAt === null) return;
      this._elapsedMs.set(Math.max(0, Date.now() - this._startedAt));
      this._formatted.set(this.format(this._elapsedMs()));
    }, 1000);
  }

  private stopInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private format(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}