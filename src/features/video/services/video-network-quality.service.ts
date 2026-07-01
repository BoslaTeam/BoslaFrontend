import { Injectable, inject, signal } from '@angular/core';
import type { Signal } from '@angular/core';
import type { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { AgoraService } from '@core/services/agora.service';
import { NetworkQuality } from '../models/network-quality.enum';

interface NetworkQualityStats {
  uplinkNetworkQuality: number;
  downlinkNetworkQuality: number;
}

@Injectable({ providedIn: 'root' })
export class VideoNetworkQualityService {
  private readonly agoraService = inject(AgoraService);

  private readonly _localQuality = signal<NetworkQuality>(NetworkQuality.Unknown);
  private readonly _remoteQualities = signal<Map<number, NetworkQuality>>(new Map());
  private readonly _warningActive = signal(false);

  readonly localQuality: Signal<NetworkQuality> = this._localQuality.asReadonly();
  readonly remoteQualities: Signal<Map<number, NetworkQuality>> = this._remoteQualities.asReadonly();
  readonly warningActive: Signal<boolean> = this._warningActive.asReadonly();

  private registered = false;

  start(): void {
    if (this.registered) return;
    const client = this.agoraService.getClient();
    if (!client) return;

    this.registered = true;

    client.on('network-quality', (stats: NetworkQualityStats) => {
      const quality = Math.max(stats.uplinkNetworkQuality, stats.downlinkNetworkQuality);
      const mapped = this.toEnum(quality);
      this._localQuality.set(mapped);
      this._warningActive.set(mapped === NetworkQuality.Bad || mapped === NetworkQuality.VeryBad);
    });

    client.on('remote-user-network-quality', (user: IAgoraRTCRemoteUser, stats: NetworkQualityStats) => {
      const quality = Math.max(stats.uplinkNetworkQuality, stats.downlinkNetworkQuality);
      this._remoteQualities.update(map => {
        map.set(user.uid as number, this.toEnum(quality));
        return new Map(map);
      });
    });
  }

  stop(): void {
    this._localQuality.set(NetworkQuality.Unknown);
    this._remoteQualities.set(new Map());
    this._warningActive.set(false);
    this.registered = false;
  }

  private toEnum(value: number): NetworkQuality {
    return value >= NetworkQuality.Unknown && value <= NetworkQuality.VeryBad
      ? (value as NetworkQuality)
      : NetworkQuality.Unknown;
  }
}
