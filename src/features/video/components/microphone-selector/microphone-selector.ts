import { Component, inject } from '@angular/core';
import { VideoDeviceService } from '../../services/video-device.service';
import { DeviceSelector } from '../device-selector/device-selector';

const MIC_ICON = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="6" y="2" width="12" height="12" rx="6" ry="6"/>
  <path d="M12 18v4"/>
  <path d="M8 22h8"/>
</svg>`;

@Component({
  selector: 'app-microphone-selector',
  standalone: true,
  imports: [DeviceSelector],
  template: `
    <app-device-selector
      [devices]="devices()"
      [selectedDeviceId]="selectedMicrophoneId()"
      [label]="'الميكروفون'"
      [icon]="micIcon"
      (selectedDeviceChanged)="onMicChange($event)"
    />
  `,
})
export class MicrophoneSelector {
  private readonly deviceService = inject(VideoDeviceService);

  readonly micIcon = MIC_ICON;
  readonly devices = this.deviceService.audioInputs;
  readonly selectedMicrophoneId = this.deviceService.selectedMicrophoneId;

  async onMicChange(deviceId: string): Promise<void> {
    await this.deviceService.selectMicrophone(deviceId);
  }
}
