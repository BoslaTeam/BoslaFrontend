import { Component, inject, computed } from '@angular/core';
import { VideoScreenShareService } from '../../services/video-screen-share.service';
import { ScreenShareState } from '../../models/screen-share-state.enum';

@Component({
  selector: 'app-screen-share-button',
  standalone: true,
  template: `
    <button
      class="vr-tb-btn"
      [class.vr-tb-btn--active]="isSharing()"
      [class.vr-tb-btn--loading]="isTransitioning()"
      [disabled]="disabled()"
      (click)="toggle()"
      [attr.aria-label]="label()"
      [attr.aria-pressed]="isSharing()"
      type="button"
      [title]="label()"
    >
      @if (isSharing()) {
        <!-- Stop sharing: filled square icon -->
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
          <rect x="8" y="7" width="8" height="6" rx="1" fill="currentColor" stroke="none"/>
        </svg>
      } @else {
        <!-- Start sharing: monitor + arrow icon -->
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
          <polyline points="8 10 12 6 16 10"/>
          <line x1="12" y1="6" x2="12" y2="14"/>
        </svg>
      }
    </button>
  `,
  styles: [`
    /*
     * The screen share button adopts the parent toolbar's vr-tb-btn class.
     * Active state override is defined here in :host scope so it can layer
     * on top of the base vr-tb-btn style without specificity conflicts.
     */
    :host {
      display: contents; /* transparent host — no extra wrapper in layout */
    }

    /* Active (sharing) state — Bosla blue accent */
    .vr-tb-btn.vr-tb-btn--active {
      background: rgba(46, 134, 171, 0.15) !important;
      color: #2E86AB !important;
    }
    .vr-tb-btn.vr-tb-btn--active:hover:not(:disabled) {
      background: rgba(46, 134, 171, 0.25) !important;
    }

    /* Loading/transitioning state */
    .vr-tb-btn--loading {
      opacity: 0.6;
      pointer-events: none;
    }
  `],
})
export class ScreenShareButton {
  private readonly screenShareService = inject(VideoScreenShareService);

  readonly isSharing = this.screenShareService.isSharing;

  readonly isTransitioning = computed(() => {
    const s = this.screenShareService.state();
    return s === ScreenShareState.Starting || s === ScreenShareState.Stopping;
  });

  readonly disabled = computed(() => {
    const s = this.screenShareService.state();
    return s === ScreenShareState.Starting || s === ScreenShareState.Stopping;
  });

  readonly label = computed(() => {
    switch (this.screenShareService.state()) {
      case ScreenShareState.Starting: return 'جارٍ بدء المشاركة...';
      case ScreenShareState.Stopping: return 'جارٍ إيقاف المشاركة...';
      case ScreenShareState.Sharing:  return 'إيقاف مشاركة الشاشة';
      default:                        return 'مشاركة الشاشة';
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
