import { Injectable, inject, signal, computed } from '@angular/core';
import type { Signal } from '@angular/core';
import type { IAgoraRTCRemoteUser, IAgoraRTCClient } from 'agora-rtc-sdk-ng';
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
  private readonly _measuring = signal(false);

  /** Tracks the last quality value to guard against duplicate signal updates. */
  private lastLocalQuality: NetworkQuality = NetworkQuality.Unknown;

  /** Callback references so we can remove listeners in stop(). */
  private onLocalQuality: ((stats: NetworkQualityStats) => void) | null = null;
  private onRemoteQuality: ((user: IAgoraRTCRemoteUser, stats: NetworkQualityStats) => void) | null = null;

  // ── Public readonly API ──────────────────────────────────────────

  /** Local user's current network quality (Unknown before first event). */
  readonly localQuality: Signal<NetworkQuality> = this._localQuality.asReadonly();

  /**
   * Per-participant remote quality map.
   *
   * Key: Agora UID (number).
   * Value: current NetworkQuality for that participant.
   *
   * The returned Map is an immutable snapshot — consumers cannot mutate
   * service state. To read a single participant's quality use
   * {@link getRemoteQuality}.
   *
   * Future participant-card pattern:
   * ```
   * <div>
   *   <span>{{ participant.name }}</span>
   *   <app-network-quality-badge
   *     [quality]="networkQualityService.getRemoteQuality(participant.uid)"
   *   />
   * </div>
   * ```
   */
  readonly remoteQualities: Signal<ReadonlyMap<number, NetworkQuality>> = this._remoteQualities.asReadonly();

  /** True while Agora hasn't emitted the first network-quality event since start(). */
  readonly measuring: Signal<boolean> = this._measuring.asReadonly();

  /**
   * Derived warning state — true only when local quality is Bad or VeryBad.
   * Implemented as a computed so it only fires change detection on actual
   * state transitions, not on every Agora event.
   */
  readonly warningActive: Signal<boolean> = computed(() => {
    const q = this._localQuality();
    return q === NetworkQuality.Bad || q === NetworkQuality.VeryBad;
  });

  private registered = false;

  // ── Lifecycle ────────────────────────────────────────────────────

  start(): void {
    if (this.registered) return;
    const client = this.agoraService.getClient();
    if (!client) return;

    this.registered = true;

    this._measuring.set(true);

    this.onLocalQuality = (stats: NetworkQualityStats) => {
      const quality = Math.max(stats.uplinkNetworkQuality, stats.downlinkNetworkQuality);
      const mapped = this.toEnum(quality);

      if (this._measuring()) {
        this._measuring.set(false);
      }

      // Guard: only update signal when value actually changes.
      if (mapped !== this.lastLocalQuality) {
        this.lastLocalQuality = mapped;
        this._localQuality.set(mapped);
      }
    };

    this.onRemoteQuality = (user: IAgoraRTCRemoteUser, stats: NetworkQualityStats) => {
      const quality = Math.max(stats.uplinkNetworkQuality, stats.downlinkNetworkQuality);
      this._remoteQualities.update(map => {
        map.set(user.uid as number, this.toEnum(quality));
        return new Map(map);
      });
    };

    client.on('network-quality', this.onLocalQuality);
    client.on('remote-user-network-quality', this.onRemoteQuality);
  }

  stop(): void {
    const client = this.agoraService.getClient();
    if (client && this.registered) {
      if (this.onLocalQuality) {
        client.off('network-quality', this.onLocalQuality);
      }
      if (this.onRemoteQuality) {
        client.off('remote-user-network-quality', this.onRemoteQuality);
      }
    }

    this.onLocalQuality = null;
    this.onRemoteQuality = null;
    this.lastLocalQuality = NetworkQuality.Unknown;
    this._localQuality.set(NetworkQuality.Unknown);
    this._remoteQualities.set(new Map());
    this._measuring.set(false);
    this.registered = false;
  }

  // ── Public helpers ───────────────────────────────────────────────

  /**
   * Convenience accessor for reading a single remote participant's quality.
   * Returns Unknown when no data has been received for that uid yet.
   */
  getRemoteQuality(uid: number): NetworkQuality {
    return this._remoteQualities().get(uid) ?? NetworkQuality.Unknown;
  }

  // ── Internal ─────────────────────────────────────────────────────

  private toEnum(value: number): NetworkQuality {
    return value >= NetworkQuality.Unknown && value <= NetworkQuality.VeryBad
      ? (value as NetworkQuality)
      : NetworkQuality.Unknown;
  }
}
