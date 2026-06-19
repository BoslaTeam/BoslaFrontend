import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

export type AgoraConnectionState = 'disconnected' | 'connecting' | 'connected';

/**
 * Thin wrapper around Agora Web SDK client lifecycle (App ID, join/leave channel).
 * Track-level controls (mute, camera toggle, screen share) are implemented in
 * `features/video` to keep this service environment/credential-focused only.
 */
@Injectable({ providedIn: 'root' })
export class AgoraService {
  private readonly appId = environment.agoraAppId;
  private client: unknown = null;

  readonly connectionState = signal<AgoraConnectionState>('disconnected');

  getAppId(): string {
    return this.appId;
  }

  setClient(client: unknown): void {
    this.client = client;
  }

  getClient(): unknown {
    return this.client;
  }

  reset(): void {
    this.client = null;
    this.connectionState.set('disconnected');
  }
}