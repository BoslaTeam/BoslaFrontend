import { Injectable, signal } from '@angular/core';
import type { Signal } from '@angular/core';
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  IAgoraRTCRemoteUser,
  ILocalTrack,
  ILocalVideoTrack,
} from 'agora-rtc-sdk-ng';
import { AGORA_CONFIG } from '@features/video/constants/agora.constants';

export type AgoraConnectionState = 'disconnected' | 'connecting' | 'connected';

export interface RemoteParticipant {
  uid: number;
  hasVideo: boolean;
  hasAudio: boolean;
  containerId: string;
}

@Injectable({ providedIn: 'root' })
export class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private screenTrack: ILocalVideoTrack | null = null;

  private remoteVideoTracks = new Map<number, IRemoteVideoTrack>();
  private remoteAudioTracks = new Map<number, IRemoteAudioTrack>();

  private readonly _connectionState = signal<AgoraConnectionState>('disconnected');
  private readonly _joined = signal(false);
  private readonly _joining = signal(false);
  private readonly _cameraEnabled = signal(true);
  private readonly _microphoneEnabled = signal(true);
  private readonly _error = signal<string | null>(null);
  private readonly _remoteParticipants = signal<RemoteParticipant[]>([]);
  private readonly _screenSharing = signal(false);
  private readonly _localUid = signal<number | null>(null);

  readonly connectionState: Signal<AgoraConnectionState> = this._connectionState.asReadonly();
  readonly joined: Signal<boolean> = this._joined.asReadonly();
  readonly joining: Signal<boolean> = this._joining.asReadonly();
  readonly cameraEnabled: Signal<boolean> = this._cameraEnabled.asReadonly();
  readonly microphoneEnabled: Signal<boolean> = this._microphoneEnabled.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();
  readonly remoteParticipants: Signal<RemoteParticipant[]> = this._remoteParticipants.asReadonly();
  readonly screenSharing: Signal<boolean> = this._screenSharing.asReadonly();
  readonly localUid: Signal<number | null> = this._localUid.asReadonly();

  setError(message: string | null): void {
    this._error.set(message);
  }

  clearError(): void {
    this._error.set(null);
  }

  getClient(): IAgoraRTCClient | null {
    return this.client;
  }

  initialize(): void {
    if (this.client) {
      return;
    }
    this.client = AgoraRTC.createClient(AGORA_CONFIG);
    this.registerRemoteEventHandlers();
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
      this._localUid.set(uid);
      this._connectionState.set('connected');
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
    } catch (err) {
      const message = this.mapDeviceError(err, 'microphone');
      this._error.set(message);
      throw err;
    }

    try {
      this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
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
      this._joined.set(true);
      this._joining.set(false);
    } catch (err) {
      const message = 'Failed to publish tracks. Please try again.';
      this._error.set(message);
      throw err;
    }
  }

  renderLocalVideo(element: HTMLElement): void {
    if (this.localVideoTrack) {
      this.localVideoTrack.play(element);
    }
  }

  // ── Remote participants ──

  private registerRemoteEventHandlers(): void {
    if (!this.client) return;

    this.client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
      await this.handleUserPublished(user, mediaType);
    });

    this.client.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
      this.handleUserUnpublished(user, mediaType);
    });

    this.client.on('user-left', (user: IAgoraRTCRemoteUser) => {
      this.handleUserLeft(user);
    });
  }

  private async handleUserPublished(user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio'): Promise<void> {
    if (!this.client) return;
    const uid = user.uid as number;
    try {
      await this.client.subscribe(user, mediaType);
    } catch (err) {
      console.error('[Agora] Failed to subscribe to remote user', uid, mediaType, err);
      return;
    }

    if (mediaType === 'video') {
      const videoTrack = user.videoTrack as IRemoteVideoTrack;
      if (videoTrack) {
        this.remoteVideoTracks.set(uid, videoTrack);
        const containerId = `remote-video-${uid}`;

        this._remoteParticipants.update(list => {
          const existing = list.find(p => p.uid === uid);
          if (existing) return list.map(p => p.uid === uid ? { ...p, hasVideo: true } : p);
          return [...list, { uid, hasVideo: true, hasAudio: false, containerId }];
        });

        requestAnimationFrame(() => {
          const container = document.getElementById(containerId);
          if (container) {
            try {
              videoTrack.play(container);
            } catch (err) {
              console.error('[Agora] Remote video play failed', uid, err);
            }
          } else {
            console.warn('[Agora] Remote video container not found after render', containerId);
          }
        });
      } else {
        console.warn('[Agora] Remote user has no video track after subscribe', uid);
      }
    } else {
      const audioTrack = user.audioTrack as IRemoteAudioTrack;
      if (audioTrack) {
        this.remoteAudioTracks.set(uid, audioTrack);
        try {
          audioTrack.play();
        } catch (err) {
          console.error('[Agora] Remote audio play failed', uid, err);
        }

        this._remoteParticipants.update(list => {
          const existing = list.find(p => p.uid === uid);
          if (existing) return list.map(p => p.uid === uid ? { ...p, hasAudio: true } : p);
          return [...list, { uid, hasVideo: false, hasAudio: true, containerId: `remote-video-${uid}` }];
        });
      } else {
        console.warn('[Agora] Remote user has no audio track after subscribe', uid);
      }
    }
  }

  private handleUserUnpublished(user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio'): void {
    const uid = user.uid as number;

    if (mediaType === 'video') {
      const track = this.remoteVideoTracks.get(uid);
      this.remoteVideoTracks.delete(uid);
      if (track) track.stop();
      this._remoteParticipants.update(list =>
        list.map(p => p.uid === uid ? { ...p, hasVideo: false } : p)
      );
    } else {
      const track = this.remoteAudioTracks.get(uid);
      this.remoteAudioTracks.delete(uid);
      if (track) track.stop();
      this._remoteParticipants.update(list =>
        list.map(p => p.uid === uid ? { ...p, hasAudio: false } : p)
      );
    }
  }

  private handleUserLeft(user: IAgoraRTCRemoteUser): void {
    const uid = user.uid as number;
    this.remoteVideoTracks.delete(uid);
    this.remoteAudioTracks.delete(uid);
    this._remoteParticipants.update(list => list.filter(p => p.uid !== uid));
  }

  async disconnect(): Promise<void> {
    this._joining.set(false);

    const unpublishTracks: ILocalTrack[] = [];
    if (this.localAudioTrack) unpublishTracks.push(this.localAudioTrack);
    if (this.localVideoTrack) unpublishTracks.push(this.localVideoTrack);
    if (this.screenTrack) unpublishTracks.push(this.screenTrack);

    if (this.client && unpublishTracks.length > 0) {
      try {
        await this.client.unpublish(unpublishTracks);
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

    if (this.screenTrack) {
      this.screenTrack.close();
      this.screenTrack = null;
    }

    if (this.client) {
      try {
        await this.client.leave();
      } catch (err) {
        console.warn('[Agora] Leave error during cleanup', err);
      }
      this.client = null;
    }

    for (const track of this.remoteVideoTracks.values()) {
      track.stop();
    }
    this.remoteVideoTracks.clear();
    for (const track of this.remoteAudioTracks.values()) {
      track.stop();
    }
    this.remoteAudioTracks.clear();

    this._connectionState.set('disconnected');
    this._joined.set(false);
    this._cameraEnabled.set(true);
    this._microphoneEnabled.set(true);
    this._error.set(null);
    this._remoteParticipants.set([]);
    this._screenSharing.set(false);
    this._localUid.set(null);
  }

  // ── Camera controls ──

  private cameraTogglePending = false;

  async enableCamera(): Promise<void> {
    if (this._cameraEnabled()) return;
    await this.toggleCamera();
  }

  async disableCamera(): Promise<void> {
    if (!this._cameraEnabled()) return;
    await this.toggleCamera();
  }

  async toggleCamera(): Promise<void> {
    if (!this.localVideoTrack || this.cameraTogglePending) return;
    this.cameraTogglePending = true;

    const target = !this._cameraEnabled();
    try {
      await this.localVideoTrack.setEnabled(target);
      this._cameraEnabled.set(target);
    } catch (err) {
      this._error.set(this.mapDeviceError(err, 'camera'));
      console.error('[Agora] Camera toggle failed', err);
    } finally {
      this.cameraTogglePending = false;
    }
  }

  // ── Microphone controls ──

  private microphoneTogglePending = false;

  async enableMicrophone(): Promise<void> {
    if (this._microphoneEnabled()) return;
    await this.toggleMicrophone();
  }

  async disableMicrophone(): Promise<void> {
    if (!this._microphoneEnabled()) return;
    await this.toggleMicrophone();
  }

  async toggleMicrophone(): Promise<void> {
    if (!this.localAudioTrack || this.microphoneTogglePending) return;
    this.microphoneTogglePending = true;

    const target = !this._microphoneEnabled();
    try {
      await this.localAudioTrack.setEnabled(target);
      this._microphoneEnabled.set(target);
    } catch (err) {
      this._error.set(this.mapDeviceError(err, 'microphone'));
      console.error('[Agora] Microphone toggle failed', err);
    } finally {
      this.microphoneTogglePending = false;
    }
  }

  // ── Device switching ──

  async switchCamera(deviceId: string): Promise<void> {
    if (!this.localVideoTrack) {
      throw new Error('No video track to switch');
    }
    await this.localVideoTrack.setDevice(deviceId);
  }

  async switchMicrophone(deviceId: string): Promise<void> {
    if (!this.localAudioTrack) {
      throw new Error('No audio track to switch');
    }
    await this.localAudioTrack.setDevice(deviceId);
  }

  // ── Screen share (Single-stream swap) ──
  //
  // Agora Web SDK NG does NOT support publishing multiple local video tracks
  // from the same client.  When screen sharing starts, the camera track must
  // be unpublished before the screen track is published (and vice versa when
  // sharing stops).  The camera track is kept alive (not closed) during the
  // swap so it can be republished without re-creating it.

  async replaceWithScreenTrack(newTrack: ILocalVideoTrack): Promise<void> {
    if (!this.client || !this.localVideoTrack) {
      throw new Error('Cannot screen share — not connected');
    }

    if (this._screenSharing()) {
      throw new Error('Screen sharing is already active');
    }

    await this.client.unpublish(this.localVideoTrack);
    await this.client.publish(newTrack);

    this.screenTrack = newTrack;
    this._screenSharing.set(true);
  }

  async restoreCameraTrack(): Promise<void> {
    if (!this.client || !this.localVideoTrack) return;

    if (this.screenTrack) {
      try {
        await this.client.unpublish(this.screenTrack);
      } catch {
        // Track may already be closed by the browser (Stop Sharing button)
      }
      this.screenTrack.close();
      this.screenTrack = null;
    }

    await this.client.publish(this.localVideoTrack);
    this._screenSharing.set(false);
  }

  getScreenTrack(): ILocalVideoTrack | null {
    return this.screenTrack;
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
    const supported = AgoraRTC.checkSystemRequirements();
    console.log('Agora support:', supported);
    console.log('Secure Context:', window.isSecureContext);
    console.log('MediaDevices:', navigator.mediaDevices);
    console.log('getUserMedia:', navigator.mediaDevices?.getUserMedia);
    console.log('UserAgent:', navigator.userAgent);
    return supported;
  }
}
