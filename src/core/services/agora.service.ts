import { Injectable, signal } from '@angular/core';
import type { Signal } from '@angular/core';
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  IAgoraRTCRemoteUser,
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

  // Remote participant tracking
  private remoteVideoTracks = new Map<number, IRemoteVideoTrack>();
  private remoteAudioTracks = new Map<number, IRemoteAudioTrack>();

  // Private writable signals
  private readonly _connectionState = signal<AgoraConnectionState>('disconnected');
  private readonly _joined = signal(false);
  private readonly _joining = signal(false);
  private readonly _cameraEnabled = signal(true);
  private readonly _microphoneEnabled = signal(true);
  private readonly _error = signal<string | null>(null);
  private readonly _remoteParticipants = signal<RemoteParticipant[]>([]);

  // Public read-only signals
  readonly connectionState: Signal<AgoraConnectionState> = this._connectionState.asReadonly();
  readonly joined: Signal<boolean> = this._joined.asReadonly();
  readonly joining: Signal<boolean> = this._joining.asReadonly();
  readonly cameraEnabled: Signal<boolean> = this._cameraEnabled.asReadonly();
  readonly microphoneEnabled: Signal<boolean> = this._microphoneEnabled.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();
  readonly remoteParticipants: Signal<RemoteParticipant[]> = this._remoteParticipants.asReadonly();

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
    console.log('[AGORA-DEBUG] initialize() called, client exists =', !!this.client);
    if (this.client) {
      console.log('[AGORA-DEBUG] initialize() — returning early (client already exists)');
      return;
    }
    this.client = AgoraRTC.createClient(AGORA_CONFIG);
    console.log('[AGORA-DEBUG] initialize() — client created, now registering event handlers');
    this.registerRemoteEventHandlers();
    console.log('[Agora] Client Created');
  }

  async join(appId: string, channel: string, token: string, uid: number): Promise<void> {
    console.log('[AGORA-DEBUG] join() START', { appId: appId?.slice(0, 8) + '...', channel, uid });
    if (!this.client) {
      console.error('[AGORA-DEBUG] join() FAILED — client is null');
      throw new Error('Agora client not initialized. Call initialize() first.');
    }
    this._joining.set(true);
    this._error.set(null);
    this._connectionState.set('connecting');

    try {
      await this.client.join(appId, channel, token, uid);
      console.log('[AGORA-DEBUG] join() SUCCESS', { channel, uid });
      this._connectionState.set('connected');
      console.log('[Agora] Joined Channel', channel);
    } catch (err) {
      console.error('[AGORA-DEBUG] join() ERROR', err);
      const message = this.mapJoinError(err);
      this._error.set(message);
      this._connectionState.set('disconnected');
      this._joining.set(false);
      throw err;
    }
  }

  async createTracks(): Promise<void> {
    console.log('[AGORA-DEBUG] createTracks() START');
    try {
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      console.log('[AGORA-DEBUG] createTracks() — microphone track created OK');
      console.log('[Agora] Created Microphone Track');
    } catch (err) {
      console.error('[AGORA-DEBUG] createTracks() — microphone FAILED', err);
      const message = this.mapDeviceError(err, 'microphone');
      this._error.set(message);
      throw err;
    }

    try {
      this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
      console.log('[AGORA-DEBUG] createTracks() — camera track created OK');
      console.log('[Agora] Created Camera Track');
    } catch (err) {
      console.error('[AGORA-DEBUG] createTracks() — camera FAILED', err);
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
    console.log('[AGORA-DEBUG] publish() START', {
      clientExists: !!this.client,
      hasAudio: !!this.localAudioTrack,
      hasVideo: !!this.localVideoTrack,
    });
    if (!this.client || !this.localAudioTrack || !this.localVideoTrack) {
      console.error('[AGORA-DEBUG] publish() FAILED — prerequisites missing');
      throw new Error('Client or tracks not ready');
    }

    try {
      await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
      console.log('[AGORA-DEBUG] publish() SUCCESS');
      console.log('[Agora] Published Audio');
      console.log('[Agora] Published Video');
      this._joined.set(true);
      this._joining.set(false);
    } catch (err) {
      console.error('[AGORA-DEBUG] publish() ERROR', err);
      const message = 'Failed to publish tracks. Please try again.';
      this._error.set(message);
      throw err;
    }
  }

  renderLocalVideo(element: HTMLElement): void {
    console.log('[AGORA-DEBUG] renderLocalVideo()', { hasLocalVideoTrack: !!this.localVideoTrack });
    if (this.localVideoTrack) {
      this.localVideoTrack.play(element);
      console.log('[AGORA-DEBUG] renderLocalVideo() — play() called OK');
    }
  }

  // ── Remote participants ──

  private registerRemoteEventHandlers(): void {
    if (!this.client) {
      console.warn('[AGORA-DEBUG] registerRemoteEventHandlers() — client is null, skipping');
      return;
    }

    console.log('[AGORA-DEBUG] registerRemoteEventHandlers() — registering user-published handler');

    this.client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
      const now = performance.now();
      console.log(`[AGORA-DEBUG] *** user-published EVENT FIRED *** uid=${user.uid} mediaType=${mediaType} time=${now.toFixed(1)}ms`);
      await this.handleUserPublished(user, mediaType);
    });

    this.client.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
      console.log(`[AGORA-DEBUG] user-unpublished EVENT uid=${user.uid} mediaType=${mediaType}`);
      this.handleUserUnpublished(user, mediaType);
    });

    this.client.on('user-left', (user: IAgoraRTCRemoteUser) => {
      console.log(`[AGORA-DEBUG] user-left EVENT uid=${user.uid}`);
      this.handleUserLeft(user);
    });

    console.log('[AGORA-DEBUG] registerRemoteEventHandlers() — handlers registered OK');
  }

  private async handleUserPublished(user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio'): Promise<void> {
    const uid = user.uid as number;
    const ts = performance.now();

    console.log(`[AGORA-DEBUG] handleUserPublished() ENTER uid=${uid} mediaType=${mediaType} client=${!!this.client} time=${ts.toFixed(1)}ms`);

    if (!this.client) {
      console.warn(`[AGORA-DEBUG] handleUserPublished() EXIT EARLY — client is null uid=${uid}`);
      return;
    }

    console.log(`[AGORA-DEBUG] handleUserPublished() about to call subscribe(uid=${uid}, mediaType=${mediaType}) time=${performance.now().toFixed(1)}ms`);
    try {
      await this.client.subscribe(user, mediaType);
      console.log(`[AGORA-DEBUG] handleUserPublished() subscribe SUCCEEDED uid=${uid} mediaType=${mediaType} time=${performance.now().toFixed(1)}ms`);
    } catch (err) {
      console.error(`[AGORA-DEBUG] handleUserPublished() subscribe FAILED uid=${uid} mediaType=${mediaType}`, err);
      return;
    }

    console.log(`[AGORA-DEBUG] handleUserPublished() subscribe OK, checking tracks for uid=${uid} mediaType=${mediaType}`, {
      hasVideoTrack: !!user.videoTrack,
      hasAudioTrack: !!user.audioTrack,
      videoTrackType: user.videoTrack?.constructor?.name,
      audioTrackType: user.audioTrack?.constructor?.name,
    });

    if (mediaType === 'video') {
      const videoTrack = user.videoTrack as IRemoteVideoTrack;
      if (videoTrack) {
        console.log(`[AGORA-DEBUG] handleUserPublished() video track EXISTS for uid=${uid}, storing in remoteVideoTracks map`);
        this.remoteVideoTracks.set(uid, videoTrack);
        const containerId = `remote-video-${uid}`;
        console.log(`[Agora] Remote user joined`);

        console.log(`[AGORA-DEBUG] handleUserPublished() about to UPDATE _remoteParticipants signal for uid=${uid} time=${performance.now().toFixed(1)}ms`);
        this._remoteParticipants.update(list => {
          const existing = list.find(p => p.uid === uid);
          if (existing) {
            console.log(`[AGORA-DEBUG] _remoteParticipants.update() — existing entry found for uid=${uid}, updating hasVideo`);
            return list.map(p => p.uid === uid ? { ...p, hasVideo: true } : p);
          }
          console.log(`[AGORA-DEBUG] _remoteParticipants.update() — NEW entry for uid=${uid}, list BEFORE:`, JSON.stringify(list));
          const newList = [...list, { uid, hasVideo: true, hasAudio: false, containerId }];
          console.log(`[AGORA-DEBUG] _remoteParticipants.update() — list AFTER:`, JSON.stringify(newList));
          return newList;
        });
        console.log(`[AGORA-DEBUG] handleUserPublished() — _remoteParticipants signal updated for uid=${uid} time=${performance.now().toFixed(1)}ms`);

        console.log(`[AGORA-DEBUG] handleUserPublished() — scheduling rAF for uid=${uid} containerId=${containerId} time=${performance.now().toFixed(1)}ms`);
        requestAnimationFrame(() => {
          const rafTime = performance.now();
          console.log(`[AGORA-DEBUG] rAF CALLBACK FIRED for uid=${uid} containerId=${containerId} time=${rafTime.toFixed(1)}ms (delta from signal update: ${(rafTime - ts).toFixed(1)}ms)`);
          const container = document.getElementById(containerId);
          console.log(`[AGORA-DEBUG] rAF callback — document.getElementById('${containerId}') result:`, container ? 'FOUND' : 'NULL');
          if (container) {
            console.log(`[AGORA-DEBUG] rAF callback — calling videoTrack.play() for uid=${uid}`);
            try {
              videoTrack.play(container);
              console.log(`[AGORA-DEBUG] rAF callback — videoTrack.play() completed OK for uid=${uid}`);
            } catch (err) {
              console.error(`[AGORA-DEBUG] rAF callback — videoTrack.play() THREW for uid=${uid}`, err);
            }
          } else {
            console.warn(`[AGORA-DEBUG] rAF callback — container NULL for uid=${uid} containerId=${containerId}. DOM NOT READY after rAF.`);
          }
        });
      } else {
        console.warn(`[AGORA-DEBUG] handleUserPublished() — user.videoTrack is NULL after subscribe for uid=${uid}`);
      }
    } else {
      const audioTrack = user.audioTrack as IRemoteAudioTrack;
      if (audioTrack) {
        console.log(`[AGORA-DEBUG] handleUserPublished() audio track EXISTS for uid=${uid}, storing in remoteAudioTracks map`);
        this.remoteAudioTracks.set(uid, audioTrack);
        console.log(`[AGORA-DEBUG] handleUserPublished() about to call audioTrack.play() for uid=${uid}`);
        try {
          audioTrack.play();
          console.log(`[AGORA-DEBUG] handleUserPublished() — audioTrack.play() completed OK for uid=${uid}`);
        } catch (err) {
          console.error(`[AGORA-DEBUG] handleUserPublished() — audioTrack.play() THREW for uid=${uid}`, err);
        }
        console.log(`[Agora] Remote audio subscribed`);

        console.log(`[AGORA-DEBUG] handleUserPublished() about to UPDATE _remoteParticipants signal for uid=${uid} (audio) time=${performance.now().toFixed(1)}ms`);
        this._remoteParticipants.update(list => {
          const existing = list.find(p => p.uid === uid);
          if (existing) {
            console.log(`[AGORA-DEBUG] _remoteParticipants.update(audio) — existing entry found for uid=${uid}, updating hasAudio`);
            return list.map(p => p.uid === uid ? { ...p, hasAudio: true } : p);
          }
          console.log(`[AGORA-DEBUG] _remoteParticipants.update(audio) — NEW entry for uid=${uid}, creating`);
          return [...list, { uid, hasVideo: false, hasAudio: true, containerId: `remote-video-${uid}` }];
        });
        console.log(`[AGORA-DEBUG] handleUserPublished() — _remoteParticipants signal updated for uid=${uid} (audio) time=${performance.now().toFixed(1)}ms`);
      } else {
        console.warn(`[AGORA-DEBUG] handleUserPublished() — user.audioTrack is NULL after subscribe for uid=${uid}`);
      }
    }

    console.log(`[AGORA-DEBUG] handleUserPublished() EXIT uid=${uid} mediaType=${mediaType} time=${performance.now().toFixed(1)}ms`);
  }

  private handleUserUnpublished(user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio'): void {
    const uid = user.uid as number;
    console.log(`[AGORA-DEBUG] handleUserUnpublished() uid=${uid} mediaType=${mediaType}`);

    if (mediaType === 'video') {
      this.remoteVideoTracks.delete(uid);
      this._remoteParticipants.update(list =>
        list.map(p => p.uid === uid ? { ...p, hasVideo: false } : p).filter(p => p.hasVideo || p.hasAudio)
      );
    } else {
      this.remoteAudioTracks.delete(uid);
      this._remoteParticipants.update(list =>
        list.map(p => p.uid === uid ? { ...p, hasAudio: false } : p).filter(p => p.hasVideo || p.hasAudio)
      );
    }
  }

  private handleUserLeft(user: IAgoraRTCRemoteUser): void {
    const uid = user.uid as number;
    console.log(`[AGORA-DEBUG] handleUserLeft() uid=${uid}`);
    this.remoteVideoTracks.delete(uid);
    this.remoteAudioTracks.delete(uid);
    this._remoteParticipants.update(list => list.filter(p => p.uid !== uid));
  }

  async disconnect(): Promise<void> {
    console.log('[AGORA-DEBUG] disconnect() START');
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

    console.log('[AGORA-DEBUG] disconnect() COMPLETE');
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
