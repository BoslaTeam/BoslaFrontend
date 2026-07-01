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
    .ss-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.75rem;
      background: rgba(244, 67, 54, 0.12);
      border-bottom: 1px solid rgba(244, 67, 54, 0.25);
      font-size: 0.8rem;
      color: #ef9a9a;
      flex-shrink: 0;
      animation: fadeIn 0.25s ease;
    }
    .ss-indicator-icon {
      font-size: 1rem;
    }
    .ss-indicator-text {
      flex: 1;
    }
    .ss-indicator-stop {
      background: rgba(244, 67, 54, 0.2);
      color: #ef9a9a;
      border: 1px solid rgba(244, 67, 54, 0.35);
      border-radius: 4px;
      padding: 0.2rem 0.6rem;
      font-size: 0.75rem;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s;
    }
    .ss-indicator-stop:hover:not(:disabled) {
      background: rgba(244, 67, 54, 0.35);
    }
    .ss-indicator-stop:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
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
