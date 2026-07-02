import { Component, inject, computed, signal, Input } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { VideoSessionService } from '../../services/video-session.service';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/enums/user-role.enum';
import { VideoRecordingTimerService } from '../../services/video-recording-timer.service';

@Component({
  selector: 'app-recording-button',
  standalone: true,
  template: `
    @if (visible()) {
      @if (confirming()) {
        <div class="rec-confirm-overlay" (click)="cancelConfirm()">
          <div class="rec-confirm-box" (click)="$event.stopPropagation()">
            <p class="rec-confirm-text">سيتم تسجيل الجلسة. هل تريد المتابعة؟</p>
            <div class="rec-confirm-actions">
              <button class="rec-confirm-btn rec-confirm-btn--yes" (click)="confirmStart()">تسجيل</button>
              <button class="rec-confirm-btn rec-confirm-btn--no" (click)="cancelConfirm()">إلغاء</button>
            </div>
          </div>
        </div>
      }
      <button
        class="rec-btn"
        [class.rec-btn--active]="isRecording()"
        [class.rec-btn--loading]="loading()"
        [disabled]="disabled()"
        (click)="handleClick()"
        [attr.aria-label]="label()"
        type="button"
      >
        <span class="rec-btn-dot"></span>
        <span class="rec-btn-label">{{ label() }}</span>
      </button>
    }
  `,
  styles: [`
    .rec-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(255, 255, 255, 0.08);
      color: #b0bec5;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 0.35rem 0.6rem;
      font-size: 0.75rem;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .rec-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.14);
      color: #eceff1;
    }
    .rec-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .rec-btn--active {
      background: rgba(244, 67, 54, 0.18);
      color: #ef9a9a;
      border-color: rgba(244, 67, 54, 0.35);
    }
    .rec-btn--active:hover:not(:disabled) {
      background: rgba(244, 67, 54, 0.26);
      color: #ffcdd2;
    }
    .rec-btn--loading {
      pointer-events: none;
    }
    .rec-btn-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
    .rec-btn--active .rec-btn-dot {
      animation: rec-pulse 1.4s ease-in-out infinite;
    }
    .rec-btn-label {
      font-weight: 500;
    }
    .rec-confirm-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .rec-confirm-box {
      background: #1a1a2e;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      padding: 1.5rem 2rem;
      max-width: 320px;
      text-align: center;
    }
    .rec-confirm-text {
      margin: 0 0 1rem;
      font-size: 0.95rem;
      color: #eceff1;
    }
    .rec-confirm-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
    }
    .rec-confirm-btn {
      padding: 0.45rem 1.25rem;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      font-weight: 500;
    }
    .rec-confirm-btn--yes {
      background: #d32f2f;
      color: #fff;
    }
    .rec-confirm-btn--yes:hover {
      background: #e53935;
    }
    .rec-confirm-btn--no {
      background: rgba(255,255,255,0.1);
      color: #b0bec5;
    }
    .rec-confirm-btn--no:hover {
      background: rgba(255,255,255,0.16);
    }
    @keyframes rec-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
  `],
})
export class RecordingButton {
  private readonly videoSessionService = inject(VideoSessionService);
  private readonly authService = inject(AuthService);
  readonly recordingTimer = inject(VideoRecordingTimerService);

  private readonly _sessionId = signal<string | null>(null);

  @Input()
  set sessionId(value: string | undefined | '') {
    if (value) this._sessionId.set(value);
  }

  get sessionId(): string | null {
    return this._sessionId();
  }

  /** Backward-compatible programmatic API */
  setSessionId(id: string): void {
    this._sessionId.set(id);
  }

  private readonly _confirming = signal(false);
  private readonly _loading = signal(false);

  readonly confirming = this._confirming.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isRecording = this.recordingTimer.isActive;

  readonly visible = computed(() => {
    const role = this.authService.userRole();
    return role === UserRole.Specialist;
  });

  readonly disabled = computed(() => this._loading());

  readonly label = computed(() => {
    if (this._loading()) return 'جارٍ...';
    if (this.isRecording()) return 'إيقاف التسجيل';
    return 'تسجيل';
  });

  handleClick(): void {
    if (this.isRecording()) {
      this.stop();
    } else {
      this._confirming.set(true);
    }
  }

  confirmStart(): void {
    this._confirming.set(false);
    this.start();
  }

  cancelConfirm(): void {
    this._confirming.set(false);
  }

  private async start(): Promise<void> {
    const id = this.sessionId;
    if (!id) return;
    this._loading.set(true);
    try {
      await firstValueFrom(
        this.videoSessionService.startRecording(id)
      );
    } catch (err) {
      console.error('[RecordingButton] Start failed', err);
    } finally {
      this._loading.set(false);
    }
  }

  private async stop(): Promise<void> {
    const id = this.sessionId;
    if (!id) return;
    this._loading.set(true);
    try {
      await firstValueFrom(
        this.videoSessionService.stopRecording(id)
      );
    } catch (err) {
      console.error('[RecordingButton] Stop failed', err);
    } finally {
      this._loading.set(false);
    }
  }
}