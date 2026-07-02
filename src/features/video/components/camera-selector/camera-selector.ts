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
    /* ── Permission Placeholder — Light Mode ── */
    .device-permission-placeholder {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      padding: 4px 0;
      font-family: 'Cairo', 'Inter', sans-serif;
      font-size: 0.8125rem;
      color: #95A5A6;
      user-select: none;
      line-height: 1.5;
    }
    .device-permission-placeholder-icon {
      display: inline-flex;
      align-items: center;
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      margin-top: 2px;
      opacity: 0.7;
    }
    .device-permission-placeholder-text {
      font-weight: 400;
      line-height: 1.5;
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
