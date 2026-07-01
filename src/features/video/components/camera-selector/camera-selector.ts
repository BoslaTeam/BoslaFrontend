import { Component, inject } from '@angular/core';
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
    @if (deviceService.cameraLabelsAvailable()) {
      <app-device-selector
        [devices]="deviceService.videoInputs()"
        [selectedDeviceId]="deviceService.selectedCameraId()"
        [label]="'الكاميرا'"
        [icon]="cameraIcon"
        (selectedDeviceChanged)="onCameraChange($event)"
      />
    } @else {
      <div class="device-permission-placeholder">
        <span class="device-permission-placeholder-icon" [innerHTML]="cameraIcon"></span>
        <span class="device-permission-placeholder-text">امنح صلاحية الكاميرا لإظهار أسماء الأجهزة.</span>
      </div>
    }
  `,
  styles: [`
    .device-permission-placeholder {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.3rem 0.5rem;
      font-size: 0.7rem;
      color: #78909c;
      user-select: none;
      max-width: 180px;
    }
    .device-permission-placeholder-icon {
      display: inline-flex;
      align-items: center;
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      opacity: 0.6;
    }
    .device-permission-placeholder-text {
      font-weight: 400;
      line-height: 1.35;
    }
  `],
})
export class CameraSelector {
  readonly deviceService = inject(VideoDeviceService);

  readonly cameraIcon = CAMERA_ICON;

  async onCameraChange(deviceId: string): Promise<void> {
    await this.deviceService.selectCamera(deviceId);
  }
}
