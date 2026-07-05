import { Injectable, computed, signal, type Signal } from '@angular/core';
import { SessionStatus } from '../models/session-status.enum';
import { formatCountdown } from '../utils/format-countdown';

const JOIN_WINDOW_MS = 10 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class VideoSessionStateService {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  private readonly _currentTime = signal(0);
  private readonly _appointmentStartMs = signal(0);
  private readonly _appointmentEndMs = signal(0);
  private readonly _serverTimeOffsetMs = signal(0);
  private readonly _sessionConnecting = signal(false);
  private readonly _sessionConnected = signal(false);
  private readonly _sessionCompleted = signal(false);

  readonly currentTime: Signal<number> = computed(() => {
    return this._currentTime() + this._serverTimeOffsetMs();
  });

  readonly serverTimeOffsetMs: Signal<number> = this._serverTimeOffsetMs.asReadonly();

  readonly countdown: Signal<string> = computed(() => {
    const now = this.currentTime();
    const startMs = this._appointmentStartMs();
    if (startMs === 0) return '';

    const joinWindow = startMs - JOIN_WINDOW_MS;
    const remaining = joinWindow - now;
    if (remaining <= 0) return '';

    return formatCountdown(remaining);
  });

  readonly canJoin: Signal<boolean> = computed(() => {
    const now = this.currentTime();
    const startMs = this._appointmentStartMs();
    const endMs = this._appointmentEndMs();
    if (startMs === 0 || endMs === 0) return false;
    const joinWindow = startMs - JOIN_WINDOW_MS;
    return now >= joinWindow && now < endMs;
  });

  readonly sessionExpired: Signal<boolean> = computed(() => {
    const now = this.currentTime();
    const endMs = this._appointmentEndMs();
    return endMs !== 0 && now >= endMs;
  });

  readonly sessionStatus: Signal<SessionStatus> = computed(() => {
    if (this._sessionCompleted()) return SessionStatus.Completed;
    if (this._sessionConnected()) return SessionStatus.InProgress;
    if (this._sessionConnecting()) return SessionStatus.Connecting;

    const now = this.currentTime();
    const startMs = this._appointmentStartMs();
    const endMs = this._appointmentEndMs();

    if (endMs !== 0 && now >= endMs) return SessionStatus.Expired;

    if (startMs !== 0) {
      const joinWindow = startMs - JOIN_WINDOW_MS;
      if (now >= joinWindow) return SessionStatus.ReadyToJoin;
    }

    return SessionStatus.Waiting;
  });

  setServerTimeOffset(offsetMs: number): void {
    this._serverTimeOffsetMs.set(offsetMs);
  }

  init(appointmentStartMs: number, appointmentEndMs: number): void {
    this._appointmentStartMs.set(appointmentStartMs);
    this._appointmentEndMs.set(appointmentEndMs);
    this._currentTime.set(Date.now());
    this.startTimer();
  }

  setSessionConnecting(): void {
    this._sessionConnecting.set(true);
  }

  setSessionConnected(): void {
    this._sessionConnecting.set(false);
    this._sessionConnected.set(true);
  }

  setSessionCompleted(): void {
    this._sessionConnecting.set(false);
    this._sessionConnected.set(false);
    this._sessionCompleted.set(true);
  }

  reset(): void {
    this.stopTimer();
    this._currentTime.set(0);
    this._appointmentStartMs.set(0);
    this._appointmentEndMs.set(0);
    this._serverTimeOffsetMs.set(0);
    this._sessionConnecting.set(false);
    this._sessionConnected.set(false);
    this._sessionCompleted.set(false);
  }

  private startTimer(): void {
    this.stopTimer();
    this.intervalId = setInterval(() => {
      this._currentTime.set(Date.now());
    }, 1000);
  }

  private stopTimer(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
