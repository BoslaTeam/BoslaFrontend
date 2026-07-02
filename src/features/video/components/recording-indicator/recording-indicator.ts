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
    /* ── Recording Active Badge — Orange per DS rules (live/recording) ── */
    .rec-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(243, 156, 18, 0.1);
      color: #b45309;
      font-family: 'Inter', sans-serif;
      font-size: 0.8125rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
      user-select: none;
      white-space: nowrap;
    }
    .rec-indicator-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #F39C12;
      flex-shrink: 0;
      animation: rec-ind-pulse 1.2s ease-in-out infinite;
    }
    .rec-indicator-label {
      white-space: nowrap;
    }
    @keyframes rec-ind-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.4; transform: scale(0.85); }
    }
  `],
})
export class RecordingIndicator {
  readonly recordingTimer = inject(VideoRecordingTimerService);
}