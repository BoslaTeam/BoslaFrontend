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
    /* ── Toolbar Circle Button ── */
    .rec-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: none;
      background: #f0f4f8;
      color: #2C3E50;
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
      position: relative;
    }
    .rec-btn:hover:not(:disabled) {
      background: #e8ecf0;
      transform: scale(1.05);
    }
    .rec-btn:focus-visible {
      outline: 3px solid #2E86AB;
      outline-offset: 2px;
    }
    .rec-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    /* Active = Recording → orange accent (REC is allowed orange use case) */
    .rec-btn--active {
      background: rgba(243, 156, 18, 0.12);
      color: #F39C12;
    }
    .rec-btn--active:hover:not(:disabled) {
      background: rgba(243, 156, 18, 0.2);
    }
    .rec-btn--loading {
      pointer-events: none;
    }
    /* Record dot icon */
    .rec-btn-dot {
      display: inline-block;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2.5px solid currentColor;
      position: relative;
      flex-shrink: 0;
    }
    .rec-btn-dot::after {
      content: '';
      position: absolute;
      inset: 3px;
      border-radius: 50%;
      background: currentColor;
    }
    .rec-btn--active .rec-btn-dot {
      animation: rec-pulse 1.4s ease-in-out infinite;
    }
    /* Label hidden — aria-label handles accessibility */
    .rec-btn-label {
      display: none;
    }

    /* ── Confirmation Modal ── */
    .rec-confirm-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }
    .rec-confirm-box {
      background: #ffffff;
      border-radius: 20px;
      padding: 2rem 2.5rem;
      max-width: 380px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      animation: rec-scale-in 0.2s ease;
    }
    .rec-confirm-text {
      margin: 0 0 1.5rem;
      font-size: 1rem;
      color: #2C3E50;
      font-family: 'Cairo', sans-serif;
      line-height: 1.65;
      font-weight: 500;
    }
    .rec-confirm-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
    }
    .rec-confirm-btn {
      padding: 10px 28px;
      border: none;
      border-radius: 9999px;
      font-size: 0.9375rem;
      cursor: pointer;
      font-weight: 600;
      font-family: 'Cairo', sans-serif;
      transition: all 0.15s ease;
    }
    .rec-confirm-btn--yes {
      background: #F39C12;
      color: #fff;
    }
    .rec-confirm-btn--yes:hover {
      background: #d68910;
      transform: translateY(-1px);
    }
    .rec-confirm-btn--no {
      background: #f0f4f8;
      color: #2C3E50;
    }
    .rec-confirm-btn--no:hover {
      background: #e8ecf0;
    }
    @keyframes rec-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.4; transform: scale(0.88); }
    }
    @keyframes rec-scale-in {
      from { opacity: 0; transform: scale(0.94); }
      to   { opacity: 1; transform: scale(1); }
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