import { Component, inject } from '@angular/core';
import { VideoRecordingTimerService } from '../../services/video-recording-timer.service';

@Component({
  selector: 'app-recording-indicator',
  standalone: true,
  template: `
    @if (recordingTimer.isActive()) {
      <div class="rec-indicator">
        <span class="rec-indicator-dot"></span>
        <span class="rec-indicator-label">REC {{ recordingTimer.formatted() }}</span>
      </div>
    }
  `,
  styles: [`
    .rec-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      background: rgba(244, 67, 54, 0.18);
      color: #ef9a9a;
      font-size: 0.75rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.03em;
      user-select: none;
    }
    .rec-indicator-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #f44336;
      animation: rec-ind-pulse 1.2s ease-in-out infinite;
    }
    .rec-indicator-label {
      white-space: nowrap;
    }
    @keyframes rec-ind-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
  `],
})
export class RecordingIndicator {
  readonly recordingTimer = inject(VideoRecordingTimerService);
}