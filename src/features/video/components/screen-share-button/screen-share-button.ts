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
    .screen-share-btn {
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
    .screen-share-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.14);
      color: #eceff1;
    }
    .screen-share-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .screen-share-btn--active {
      background: rgba(244, 67, 54, 0.18);
      color: #ef9a9a;
      border-color: rgba(244, 67, 54, 0.35);
    }
    .screen-share-btn--active:hover:not(:disabled) {
      background: rgba(244, 67, 54, 0.26);
      color: #ffcdd2;
    }
    .screen-share-btn-icon {
      display: inline-flex;
      align-items: center;
      width: 18px;
      height: 18px;
    }
    .screen-share-btn-label {
      font-weight: 500;
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
