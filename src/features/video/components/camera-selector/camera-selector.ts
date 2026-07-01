import { Component, inject, computed } from '@angular/core';
import { VideoDeviceService } from '../../services/video-device.service';
import { DeviceSelector } from '../device-selector/device-selector';

const CAMERA_ICON = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M23 7l-7 5 7 5V7z"/>
  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
</svg>`;

@Component({
  selector: 'app-camera-selector',
  standalone: true,
  imports: [DeviceSelector],
  template: `
    <app-device-selector
      [devices]="devices()"
      [selectedDeviceId]="selectedCameraId()"
      [label]="'الكاميرا'"
      [icon]="cameraIcon"
      (selectedDeviceChanged)="onCameraChange($event)"
    />
  `,
})
export class CameraSelector {
  private readonly deviceService = inject(VideoDeviceService);

  readonly cameraIcon = CAMERA_ICON;
  readonly devices = this.deviceService.videoInputs;
  readonly selectedCameraId = this.deviceService.selectedCameraId;

  async onCameraChange(deviceId: string): Promise<void> {
    await this.deviceService.selectCamera(deviceId);
  }
}
