import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-device-selector',
  standalone: true,
  templateUrl: './device-selector.html',
  styleUrl: './device-selector.css',
})
export class DeviceSelector {
  readonly devices = input<ReadonlyArray<{ deviceId: string; label: string }>>([]);
  readonly selectedDeviceId = input<string | null>(null);
  readonly label = input<string>('');
  readonly icon = input<string>('');
  readonly disabled = input(false);

  readonly selectedDeviceChanged = output<string>();

  readonly hasDevices = computed(() => this.devices().length > 0);

  onChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedDeviceChanged.emit(select.value);
  }
}
