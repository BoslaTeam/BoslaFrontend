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
    @if (deviceService.microphoneLabelsAvailable()) {
      <app-device-selector
        [devices]="deviceService.audioInputs()"
        [selectedDeviceId]="deviceService.selectedMicrophoneId()"
        [label]="'الميكروفون'"
        [icon]="micIcon"
        (selectedDeviceChanged)="onMicChange($event)"
      />
    } @else {
      <div class="device-permission-placeholder">
        <span class="device-permission-placeholder-icon" [innerHTML]="micIcon"></span>
        <span class="device-permission-placeholder-text">امنح صلاحية الميكروفون لإظهار أسماء الأجهزة.</span>
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
export class MicrophoneSelector {
  readonly deviceService = inject(VideoDeviceService);

  readonly micIcon = MIC_ICON;

  async onMicChange(deviceId: string): Promise<void> {
    await this.deviceService.selectMicrophone(deviceId);
  }
}
