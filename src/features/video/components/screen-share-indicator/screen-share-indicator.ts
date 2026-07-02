import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { VideoScreenShareService } from '../../services/video-screen-share.service';
import { ScreenShareState } from '../../models/screen-share-state.enum';

@Component({
  selector: 'app-screen-share-indicator',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="ss-indicator" role="status" aria-live="polite">
        <span class="ss-indicator-icon">🖥</span>
        <span class="ss-indicator-text">{{ label() }}</span>
        <button
          class="ss-indicator-stop"
          (click)="stop()"
          [disabled]="stopping()"
          type="button"
          aria-label="إيقاف مشاركة الشاشة"
        >
          {{ stopping() ? 'جارٍ الإيقاف...' : 'إيقاف المشاركة' }}
        </button>
      </div>
    }
  `,
  styles: [`
    /* ── Floating Pill Badge (top-right inside stage) ── */
    .ss-indicator {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 10;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 12px 7px 10px;
      background: rgba(27, 79, 114, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 9999px;
      color: #ffffff;
      font-size: 0.8125rem;
      font-weight: 500;
      white-space: nowrap;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      animation: ss-fade-in 0.25s ease;
    }
    .ss-indicator-icon {
      font-size: 0.9rem;
      line-height: 1;
    }
    .ss-indicator-text {
      font-weight: 500;
    }
    .ss-indicator-stop {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 9999px;
      padding: 4px 12px;
      font-size: 0.75rem;
      font-family: 'Cairo', 'Inter', sans-serif;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s ease;
      font-weight: 500;
      margin-left: 2px;
    }
    .ss-indicator-stop:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.25);
    }
    .ss-indicator-stop:focus-visible {
      outline: 2px solid rgba(255, 255, 255, 0.6);
      outline-offset: 2px;
    }
    .ss-indicator-stop:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    @keyframes ss-fade-in {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreenShareIndicator {
  private readonly screenShareService = inject(VideoScreenShareService);

  readonly visible = computed(() => this.screenShareService.state() === ScreenShareState.Sharing);

  readonly stopping = computed(() => this.screenShareService.state() === ScreenShareState.Stopping);

  readonly label = computed(() => {
    switch (this.screenShareService.state()) {
      case ScreenShareState.Sharing: return 'أنت تشارك شاشتك';
      default: return '';
    }
  });

  stop(): void {
    this.screenShareService.stopScreenShare();
  }
}
