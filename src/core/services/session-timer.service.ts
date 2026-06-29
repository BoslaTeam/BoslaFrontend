import { Injectable, computed, signal } from '@angular/core';
import type { Signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionTimerService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private _startedAt: number | null = null;

  private readonly _elapsedMs = signal(0);
  private readonly _formattedElapsed = signal('00:00');

  readonly elapsedTime: Signal<number> = this._elapsedMs.asReadonly();
  readonly formattedElapsedTime: Signal<string> = this._formattedElapsed.asReadonly();

  start(startedAt: number, endedAt?: number): void {
    this.stop();
    this._startedAt = startedAt;

    if (endedAt !== undefined) {
      const elapsed = Math.max(0, endedAt - startedAt);
      this._elapsedMs.set(elapsed);
      this._formattedElapsed.set(this.format(elapsed));
      return;
    }

    this._elapsedMs.set(Math.max(0, Date.now() - startedAt));
    this._formattedElapsed.set(this.format(this._elapsedMs()));
    this.startInterval();
  }

  stop(): void {
    this.stopInterval();
    this._startedAt = null;
    this._elapsedMs.set(0);
    this._formattedElapsed.set('00:00');
  }

  private startInterval(): void {
    this.stopInterval();
    this.intervalId = setInterval(() => {
      if (this._startedAt === null) return;
      const elapsed = Math.max(0, Date.now() - this._startedAt);
      this._elapsedMs.set(elapsed);
      this._formattedElapsed.set(this.format(elapsed));
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
