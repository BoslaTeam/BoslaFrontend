import { Injectable, computed, inject } from '@angular/core';
import type { Signal } from '@angular/core';
import { AgoraService } from '@core/services/agora.service';
import { VideoSignalrService } from './video-signalr.service';
import { VideoConnectionState } from '../models/video-connection-state.enum';

export function toConnectionLabel(state: VideoConnectionState): string {
  switch (state) {
    case VideoConnectionState.Connected:
      return 'متصل';
    case VideoConnectionState.Connecting:
      return 'جاري الاتصال...';
    case VideoConnectionState.Reconnecting:
      return 'جاري إعادة الاتصال...';
    case VideoConnectionState.Disconnected:
      return 'انقطع الاتصال';
    case VideoConnectionState.Ended:
      return 'انتهت الجلسة';
  }
}

@Injectable({ providedIn: 'root' })
export class VideoConnectionService {
  private readonly agoraService = inject(AgoraService);
  private readonly signalrService = inject(VideoSignalrService);

  readonly state: Signal<VideoConnectionState> = computed(() => {
    const ended = this.signalrService.sessionEnded();
    if (ended) return VideoConnectionState.Ended;

    const agoraState = this.agoraService.connectionState();
    const signalrState = this.signalrService.connectionState();

    if (agoraState === 'connected' && signalrState === 'connected') {
      return VideoConnectionState.Connected;
    }

    if (signalrState === 'reconnecting') {
      return VideoConnectionState.Reconnecting;
    }

    if (agoraState === 'connecting' || signalrState === 'connecting') {
      return VideoConnectionState.Connecting;
    }

    if (this.agoraService.joined() && agoraState === 'disconnected') {
      return VideoConnectionState.Reconnecting;
    }

    return VideoConnectionState.Disconnected;
  });

  readonly label: Signal<string> = computed(() => toConnectionLabel(this.state()));
}
