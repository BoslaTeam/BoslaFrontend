import { Component, inject, computed } from '@angular/core';
import { VideoScreenShareService } from '../../services/video-screen-share.service';
import { ScreenShareState } from '../../models/screen-share-state.enum';

const SHARE_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
  <line x1="8" y1="21" x2="16" y2="21"/>
  <line x1="12" y1="17" x2="12" y2="21"/>
</svg>`;

const STOP_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="currentColor" stroke-width="2">
  <rect x="6" y="6" width="12" height="12" rx="2"/>
  <line x1="8" y1="21" x2="16" y2="21"/>
  <line x1="12" y1="17" x2="12" y2="21"/>
</svg>`;

@Component({
  selector: 'app-screen-share-button',
  standalone: true,
  template: `
    <button
      class="screen-share-btn"
      [class.screen-share-btn--active]="isSharing()"
      [disabled]="disabled()"
      (click)="toggle()"
      [attr.aria-label]="label()"
      type="button"
    >
      <span class="screen-share-btn-icon" [innerHTML]="isSharing() ? stopIcon : shareIcon"></span>
      <span class="screen-share-btn-label">{{ label() }}</span>
    </button>
  `,
  styles: [`
    /* ── Toolbar Circle Button ── */
    .screen-share-btn {
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
    }
    .screen-share-btn:hover:not(:disabled) {
      background: #e8ecf0;
      transform: scale(1.05);
    }
    .screen-share-btn:focus-visible {
      outline: 3px solid #2E86AB;
      outline-offset: 2px;
    }
    .screen-share-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    /* Active (Sharing) state → Bosla blue tint */
    .screen-share-btn--active {
      background: rgba(46, 134, 171, 0.12);
      color: #2E86AB;
    }
    .screen-share-btn--active:hover:not(:disabled) {
      background: rgba(46, 134, 171, 0.2);
    }
    .screen-share-btn-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
    }
    /* Label hidden — aria-label on button provides context */
    .screen-share-btn-label {
      display: none;
    }
    /* Mobile: shrink to 44px to match other toolbar buttons */
    @media (max-width: 768px) {
      .screen-share-btn {
        width: 44px;
        height: 44px;
      }
    }
  `],
})
export class ScreenShareButton {
  private readonly screenShareService = inject(VideoScreenShareService);

  readonly shareIcon = SHARE_ICON;
  readonly stopIcon = STOP_ICON;
  readonly isSharing = this.screenShareService.isSharing;

  readonly disabled = computed(() => {
    const s = this.screenShareService.state();
    return s === ScreenShareState.Starting || s === ScreenShareState.Stopping;
  });

  readonly label = computed(() => {
    switch (this.screenShareService.state()) {
      case ScreenShareState.Starting: return 'جارٍ بدء المشاركة...';
      case ScreenShareState.Stopping: return 'جارٍ إيقاف المشاركة...';
      case ScreenShareState.Sharing: return '🟥 إيقاف المشاركة';
      default: return 'مشاركة الشاشة';
    }
  });

  toggle(): void {
    if (this.screenShareService.isSharing()) {
      this.screenShareService.stopScreenShare();
    } else {
      this.screenShareService.startScreenShare();
    }
  }
}
