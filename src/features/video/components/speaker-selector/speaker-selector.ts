import { Component, inject, computed } from '@angular/core';
import { VideoDeviceService } from '../../services/video-device.service';
import { DeviceSelector } from '../device-selector/device-selector';

const SPEAKER_ICON = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
</svg>`;

@Component({
  selector: 'app-speaker-selector',
  standalone: true,
  imports: [DeviceSelector],
  template: `
    @if (supported()) {
      <app-device-selector
        [devices]="devices()"
        [selectedDeviceId]="selectedSpeakerId()"
        [label]="'السماعة'"
        [icon]="speakerIcon"
        (selectedDeviceChanged)="onSpeakerChange($event)"
      />
    } @else {
      <div class="speaker-selector-unsupported" role="status">
        <span class="speaker-selector-icon" [innerHTML]="speakerIcon"></span>
        <span class="speaker-selector-unsupported-text">المتصفح لا يدعم تغيير السماعة.</span>
      </div>
    }
  `,
  styles: [`
    .speaker-selector-unsupported {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.7rem;
      color: #78909c;
      user-select: none;
    }
    .speaker-selector-icon {
      display: inline-flex;
      align-items: center;
      width: 14px;
      height: 14px;
      opacity: 0.6;
    }
    .speaker-selector-unsupported-text {
      font-weight: 400;
    }
  `],
})
export class SpeakerSelector {
  private readonly deviceService = inject(VideoDeviceService);

  readonly speakerIcon = SPEAKER_ICON;
  readonly devices = this.deviceService.audioOutputs;
  readonly selectedSpeakerId = this.deviceService.selectedSpeakerId;
  readonly supported = this.deviceService.hasAudioOutputSupport;

  async onSpeakerChange(deviceId: string): Promise<void> {
    await this.deviceService.selectSpeaker(deviceId);
  }
}
