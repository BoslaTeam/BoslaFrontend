import { Component, inject, signal } from '@angular/core';
import { VideoDeviceService } from '../../services/video-device.service';

const SPEAKER_ICON = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
</svg>`;

@Component({
  selector: 'app-speaker-test-button',
  standalone: true,
  template: `
    <button
      class="speaker-test-btn"
      [disabled]="playing()"
      (click)="playTestSound()"
      [attr.aria-label]="'اختبار السماعة'"
      type="button"
    >
      <span class="speaker-test-btn-icon" [innerHTML]="speakerIcon"></span>
      <span class="speaker-test-btn-label">{{ playing() ? 'جارٍ الاختبار...' : 'اختبار' }}</span>
    </button>
  `,
  styles: [`
    /* ── Device Card Test Button ── */
    .speaker-test-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: #f0f4f8;
      color: #2C3E50;
      border: 1px solid transparent;
      border-radius: 8px;
      padding: 8px 16px;
      font-family: 'Cairo', 'Inter', sans-serif;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      width: 100%;
      box-sizing: border-box;
    }
    .speaker-test-btn:hover:not(:disabled) {
      background: #e8ecf0;
      border-color: rgba(0, 0, 0, 0.08);
    }
    .speaker-test-btn:focus-visible {
      outline: 3px solid #2E86AB;
      outline-offset: 2px;
    }
    .speaker-test-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .speaker-test-btn-icon {
      display: inline-flex;
      align-items: center;
      width: 15px;
      height: 15px;
      color: #2E86AB;
      flex-shrink: 0;
    }
    .speaker-test-btn-label {
      font-weight: 500;
    }
  `],
})
export class SpeakerTestButton {
  private readonly deviceService = inject(VideoDeviceService);

  readonly speakerIcon = SPEAKER_ICON;
  readonly playing = signal(false);

  private audioContext: AudioContext | null = null;

  async playTestSound(): Promise<void> {
    if (this.playing()) return;

    this.playing.set(true);

    try {
      this.audioContext = new AudioContext();
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime + 0.15);
      oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);

      oscillator.connect(gain);
      gain.connect(this.audioContext.destination);

      const selectedSpeakerId = this.deviceService.selectedSpeakerId();
      if (selectedSpeakerId && 'setSinkId' in HTMLAudioElement.prototype) {
        try {
          const silent = new Audio();
          (silent as any).setSinkId(selectedSpeakerId);
        } catch {
          // Fall back to default output
        }
      }

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.6);

      oscillator.onended = () => {
        this.audioContext?.close();
        this.audioContext = null;
        this.playing.set(false);
      };
    } catch {
      this.audioContext?.close();
      this.audioContext = null;
      this.playing.set(false);
    }
  }
}
