import { Injectable, signal, DestroyRef, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppointmentExpiryService {
  private readonly destroyRef = inject(DestroyRef);
  private timerId: any = null;
  
  private readonly _isExpired = signal(false);
  readonly isExpired = this._isExpired.asReadonly();

  start(endTimeUtc: string | Date | number): void {
    this.stop();
    this._isExpired.set(false);

    let endTime: number;
    if (endTimeUtc instanceof Date) {
      endTime = endTimeUtc.getTime();
    } else if (typeof endTimeUtc === 'number') {
      endTime = endTimeUtc;
    } else {
      let str = String(endTimeUtc).trim();
      if (str.includes('T') && !str.endsWith('Z') && !str.includes('+')) {
        const timePart = str.slice(str.indexOf('T'));
        if (!timePart.includes('-')) {
          str += 'Z';
        }
      }
      endTime = new Date(str).getTime();
    }

    if (!Number.isFinite(endTime)) return;

    const checkExpiry = () => {
      const now = Date.now();
      if (now >= endTime) {
        this._isExpired.set(true);
        this.stop();
      }
    };

    // Check immediately
    checkExpiry();

    if (!this._isExpired()) {
      // Check every second
      this.timerId = setInterval(checkExpiry, 1000);

      this.destroyRef.onDestroy(() => {
        this.stop();
      });
    }
  }

  stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
