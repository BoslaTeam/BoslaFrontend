import { Component, inject, computed, signal, Input, ViewChild, ElementRef } from '@angular/core';
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

      <!-- Start Confirmation Modal -->
      @if (confirming()) {
        <dialog #confirmDialog class="rec-confirm-dialog" (click)="cancelConfirm()"
          aria-labelledby="rec-confirm-title">
          <div class="rec-confirm-box" (click)="$event.stopPropagation()">
            <div class="rec-confirm-icon" aria-hidden="true">
              <!-- Record dot icon -->
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round">
                <circle cx="12" cy="12" r="9"/>
                <circle cx="12" cy="12" r="4" fill="currentColor"/>
              </svg>
            </div>
            <p class="rec-confirm-title" id="rec-confirm-title">تسجيل الجلسة؟</p>
            <p class="rec-confirm-text">سيتم تسجيل هذه الجلسة. يرجى إعلام جميع المشاركين بذلك.</p>
            <div class="rec-confirm-actions">
              <button class="rec-confirm-btn rec-confirm-btn--no"
                (click)="cancelConfirm()" type="button">إلغاء</button>
              <button class="rec-confirm-btn rec-confirm-btn--yes"
                (click)="confirmStart()" type="button">بدء التسجيل</button>
            </div>
          </div>
        </dialog>
      }

      <!-- Idle: Start Recording button -->
      @if (!isRecording()) {
        <button
          class="vr-tb-btn"
          [class.vr-tb-btn--loading]="loading()"
          [disabled]="disabled()"
          (click)="handleClick()"
          aria-label="بدء التسجيل"
          title="بدء التسجيل"
          type="button"
        >
          <!-- Record circle icon -->
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="12" r="4" fill="currentColor"/>
          </svg>
        </button>
      }

      <!-- Recording: Stop Recording button (only shown while recording) -->
      @if (isRecording()) {
        <button
          class="vr-tb-btn vr-tb-btn--recording"
          [class.vr-tb-btn--loading]="loading()"
          [disabled]="disabled()"
          (click)="handleClick()"
          aria-label="إيقاف التسجيل"
          title="إيقاف التسجيل"
          type="button"
        >
          <!-- Stop square icon -->
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="currentColor"
            stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
            <rect x="5" y="5" width="14" height="14" rx="2"/>
          </svg>
        </button>
      }

    }
  `,
  styles: [`
    :host {
      display: contents; /* transparent host */
    }

    /* ── Recording-Active State: orange accent ── */
    .vr-tb-btn.vr-tb-btn--recording {
      background: rgba(243, 156, 18, 0.15) !important;
      color: #F39C12 !important;
      animation: rec-btn-pulse 2.2s ease-in-out infinite;
    }
    .vr-tb-btn.vr-tb-btn--recording:hover:not(:disabled) {
      background: rgba(243, 156, 18, 0.25) !important;
      animation: none;
    }
    .vr-tb-btn--loading {
      opacity: 0.6;
      pointer-events: none;
    }

    @keyframes rec-btn-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(243, 156, 18, 0); }
      50%       { box-shadow: 0 0 0 6px rgba(243, 156, 18, 0.2); }
    }

    /* ── Confirmation Modal (Native Dialog) ── */
    .rec-confirm-dialog {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      max-width: 100vw;
      max-height: 100vh;
      margin: 0;
      border: none;
      background: transparent;
      padding: 24px;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 100000;
      overflow: hidden;
      outline: none;
    }
    .rec-confirm-dialog::backdrop {
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .rec-confirm-box {
      background: #ffffff;
      border-radius: 20px;
      padding: 2rem 2rem 1.75rem;
      width: 440px;
      max-width: 100%;
      text-align: center;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
      animation: rec-box-in 0.2s ease;
      box-sizing: border-box;
    }
    @media (max-width: 768px) {
      .rec-confirm-box {
        width: min(420px, calc(100vw - 48px));
      }
    }
    .rec-confirm-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(243, 156, 18, 0.1);
      color: #F39C12;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }
    .rec-confirm-title {
      margin: 0 0 0.5rem;
      font-size: 1.125rem;
      color: #1B4F72;
      font-family: 'Cairo', sans-serif;
      font-weight: 700;
    }
    .rec-confirm-text {
      margin: 0 0 1.5rem;
      font-size: 0.9375rem;
      color: #4a5568;
      font-family: 'Cairo', sans-serif;
      line-height: 1.65;
      font-weight: 400;
    }
    .rec-confirm-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
    }
    .rec-confirm-btn {
      flex: 1;
      padding: 10px 20px;
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

    @keyframes rec-box-in {
      from { opacity: 0; transform: scale(0.94) translateY(8px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
  `],
})
export class RecordingButton {
  @ViewChild('confirmDialog') set confirmDialog(ref: ElementRef<HTMLDialogElement> | undefined) {
    if (ref) {
      ref.nativeElement.showModal();
    }
  }
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