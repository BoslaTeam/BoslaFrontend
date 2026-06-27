import { Injectable, signal, inject } from '@angular/core';
import type { Signal } from '@angular/core';
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import { AGORA_CONFIG } from '@features/video/constants/agora.constants';

export type AgoraConnectionState = 'disconnected' | 'connecting' | 'connected';

@Injectable({ providedIn: 'root' })
export class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;

  // Private writable signals
  private readonly _connectionState = signal<AgoraConnectionState>('disconnected');
  private readonly _joined = signal(false);
  private readonly _joining = signal(false);
  private readonly _cameraEnabled = signal(true);
  private readonly _microphoneEnabled = signal(true);
  private readonly _error = signal<string | null>(null);

  // Public read-only signals
  readonly connectionState: Signal<AgoraConnectionState> = this._connectionState.asReadonly();
  readonly joined: Signal<boolean> = this._joined.asReadonly();
  readonly joining: Signal<boolean> = this._joining.asReadonly();
  readonly cameraEnabled: Signal<boolean> = this._cameraEnabled.asReadonly();
  readonly microphoneEnabled: Signal<boolean> = this._microphoneEnabled.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();

  // ── Public state helpers (used by components) ──

  setError(message: string | null): void {
    this._error.set(message);
  }

  clearError(): void {
    this._error.set(null);
  }

  // ── SDK lifecycle ──

  getClient(): IAgoraRTCClient | null {
    return this.client;
  }

  initialize(): void {
    if (this.client) {
      return;
    }
    this.client = AgoraRTC.createClient(AGORA_CONFIG);
    console.log('[Agora] Client Created');
  }

  async join(appId: string, channel: string, token: string, uid: number): Promise<void> {
    if (!this.client) {
      throw new Error('Agora client not initialized. Call initialize() first.');
    }
    this._joining.set(true);
    this._error.set(null);
    this._connectionState.set('connecting');

    try {
      await this.client.join(appId, channel, token, uid);
      this._connectionState.set('connected');
      console.log('[Agora] Joined Channel', channel);
    } catch (err) {
      const message = this.mapJoinError(err);
      this._error.set(message);
      this._connectionState.set('disconnected');
      this._joining.set(false);
      throw err;
    }
  }

  async createTracks(): Promise<void> {
    try {
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      console.log('[Agora] Created Microphone Track');
    } catch (err) {
      const message = this.mapDeviceError(err, 'microphone');
      this._error.set(message);
      throw err;
    }

    try {
      this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
      console.log('[Agora] Created Camera Track');
    } catch (err) {
      const message = this.mapDeviceError(err, 'camera');
      this._error.set(message);
      if (this.localAudioTrack) {
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }
      throw err;
    }
  }

  async publish(): Promise<void> {
    if (!this.client || !this.localAudioTrack || !this.localVideoTrack) {
      throw new Error('Client or tracks not ready');
    }

    try {
      await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
      console.log('[Agora] Published Audio');
      console.log('[Agora] Published Video');
      this._joined.set(true);
      this._joining.set(false);
    } catch (err) {
      const message = 'Failed to publish tracks. Please try again.';
      this._error.set(message);
      throw err;
    }
  }

  // renderLocalVideo(element: HTMLElement): void {
  //   if (this.localVideoTrack) {
  //     this.localVideoTrack.play(element);
  //   }
  // }
  renderLocalVideo(element: HTMLElement): void {
    console.log('[DEBUG] ===== renderLocalVideo ====');
    console.log('[DEBUG] track type:', typeof this.localVideoTrack);
    console.log('[DEBUG] track isPlaying:', this.localVideoTrack?.isPlaying);
    console.log('[DEBUG] element tagName:', element.tagName);
    console.log('[DEBUG] element className:', element.className);
    console.log('[DEBUG] element id:', element.id);
    console.log('[DEBUG] element isConnected:', element.isConnected);
    console.log('[DEBUG] element offsetParent:', element.offsetParent?.tagName ?? null);
    console.log('[DEBUG] element offsetHeight:', element.offsetHeight);
    console.log('[DEBUG] element offsetWidth:', element.offsetWidth);
    console.log('[DEBUG] element childElementCount BEFORE:', element.childElementCount);
    console.log('[DEBUG] element children BEFORE:', Array.from(element.children).map(c => c.tagName));

    if (this.localVideoTrack) {
      console.log('[DEBUG] Calling this.localVideoTrack.play(element)...');
      this.localVideoTrack.play(element);
      console.log('[DEBUG] play() returned synchronously');
      console.log('[DEBUG] element childElementCount AFTER:', element.childElementCount);
      console.log('[DEBUG] element children AFTER:', Array.from(element.children).map(c => c.tagName));
      console.log('[DEBUG] element.querySelector("video"):', element.querySelector('video'));
      console.log('[DEBUG] element.innerHTML:', element.innerHTML.substring(0, 500));
    } else {
      console.error('Local video track is NULL');
    }
  }
  async disconnect(): Promise<void> {
    this._joining.set(false);

    if (this.client && this.localAudioTrack && this.localVideoTrack) {
      try {
        await this.client.unpublish([this.localAudioTrack, this.localVideoTrack]);
      } catch (err) {
        console.warn('[Agora] Unpublish error during cleanup', err);
      }
    }

    if (this.localAudioTrack) {
      this.localAudioTrack.stop();
      this.localAudioTrack.close();
      this.localAudioTrack = null;
    }

    if (this.localVideoTrack) {
      this.localVideoTrack.stop();
      this.localVideoTrack.close();
      this.localVideoTrack = null;
    }

    if (this.client) {
      try {
        await this.client.leave();
        console.log('[Agora] Left Channel');
      } catch (err) {
        console.warn('[Agora] Leave error during cleanup', err);
      }
      this.client = null;
    }

    this._connectionState.set('disconnected');
    this._joined.set(false);
    this._cameraEnabled.set(true);
    this._microphoneEnabled.set(true);
    this._error.set(null);

    console.log('[Agora] Cleanup Completed');
  }

  // ── Toggles ──

  async toggleCamera(): Promise<void> {
    if (this.localVideoTrack) {
      await this.localVideoTrack.setEnabled(!this._cameraEnabled());
      this._cameraEnabled.set(!this._cameraEnabled());
    }
  }

  async toggleMicrophone(): Promise<void> {
    if (this.localAudioTrack) {
      await this.localAudioTrack.setEnabled(!this._microphoneEnabled());
      this._microphoneEnabled.set(!this._microphoneEnabled());
    }
  }

  // ── Error mapping ──

  private mapJoinError(err: unknown): string {
    const msg = String(err);
    if (msg.includes('DYNAMIC_USE_STATIC_KEY') || msg.includes('token')) {
      return 'Invalid or expired token. Please rejoin.';
    }
    if (msg.includes('UID_CONFLICT')) {
      return 'This user ID is already in the session.';
    }
    if (msg.includes('TIMEOUT')) {
      return 'Connection timed out. Check your network and try again.';
    }
    return 'Failed to join the session. Please try again.';
  }

  private mapDeviceError(err: unknown, device: 'camera' | 'microphone'): string {
    const msg = String(err);
    if (msg.includes('NotAllowed') || msg.includes('PermissionDenied')) {
      return `${device === 'camera' ? 'Camera' : 'Microphone'} permission denied. Please allow access in your browser settings.`;
    }
    if (msg.includes('NotFound') || msg.includes('NotReadable')) {
      return `No ${device} found. Please connect a ${device} and try again.`;
    }
    return `Failed to access ${device}. Please check your device settings.`;
  }

  checkBrowserSupport(): boolean {
    return AgoraRTC.checkSystemRequirements();
  }
}
