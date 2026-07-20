import { Injectable, inject, signal, DestroyRef } from '@angular/core';
import type { Signal } from '@angular/core';
import AgoraRTC from 'agora-rtc-sdk-ng';
import type { ILocalVideoTrack } from 'agora-rtc-sdk-ng';
import { AgoraService } from '@core/services/agora.service';
import { ScreenShareState } from '../models/screen-share-state.enum';

@Injectable({ providedIn: 'root' })
export class VideoScreenShareService {
  private readonly agoraService = inject(AgoraService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<ScreenShareState>(ScreenShareState.Idle);
  private readonly _error = signal<string | null>(null);
  private readonly _sharerUid = signal<number | null>(null);

  readonly state: Signal<ScreenShareState> = this._state.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();
  readonly isSharing: Signal<boolean> = this.agoraService.screenSharing;
  readonly sharerUid: Signal<number | null> = this._sharerUid.asReadonly();

  private screenTrack: ILocalVideoTrack | null = null;
  private trackEndedHandler: (() => void) | null = null;
  private _wasCameraEnabled = true;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.cleanup();
    });
  }

  async startScreenShare(): Promise<void> {
    if (this._state() !== ScreenShareState.Idle) return;
    if (this.agoraService.screenSharing()) return;
    if (!this.agoraService.joined()) return;

    this._state.set(ScreenShareState.Starting);
    this._error.set(null);

    try {
      this.checkBrowserSupport();

      const track = await AgoraRTC.createScreenVideoTrack(
        { encoderConfig: '1080p' },
        'disable',
      );

      this.screenTrack = track;

      this.trackEndedHandler = () => {
        this.stopScreenShare();
      };
      track.on('track-ended', this.trackEndedHandler);

      this._wasCameraEnabled = this.agoraService.cameraEnabled();

      await this.agoraService.replaceWithScreenTrack(track);

      this._sharerUid.set(this.agoraService.localUid());
      this._state.set(ScreenShareState.Sharing);
    } catch (err) {
      this.screenTrack = null;
      this._state.set(ScreenShareState.Idle);
      this._error.set(this.mapError(err));
    }
  }

  async stopScreenShare(): Promise<void> {
    if (this._state() !== ScreenShareState.Sharing) return;

    this._state.set(ScreenShareState.Stopping);

    try {
      await this.agoraService.restoreCameraTrack();
      this.screenTrack = null;

      this.restoreCameraState();

      this.cleanup();
      this._state.set(ScreenShareState.Idle);
    } catch {
      this._state.set(ScreenShareState.Sharing);
      this._error.set('تعذر إيقاف مشاركة الشاشة.');
    }
  }

  getScreenTrack(): ILocalVideoTrack | null {
    return this.screenTrack;
  }

  private restoreCameraState(): void {
    if (!this._wasCameraEnabled) {
      this.agoraService.disableCamera();
    }
  }

  private checkBrowserSupport(): void {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      throw new Error('UNSUPPORTED');
    }
  }

  private cleanup(): void {
    if (this.trackEndedHandler && this.screenTrack) {
      this.screenTrack.off('track-ended', this.trackEndedHandler);
    }
    if (this.screenTrack) {
      this.screenTrack.close();
    }
    this.screenTrack = null;
    this.trackEndedHandler = null;
    this._sharerUid.set(null);
  }

  private mapError(err: unknown): string {
    const msg = String(err);
    if (msg === 'UNSUPPORTED') {
      return 'المتصفح لا يدعم مشاركة الشاشة.';
    }
    if (msg.includes('NotAllowed') || msg.includes('PermissionDenied')) {
      return 'تم إلغاء مشاركة الشاشة.';
    }
    return 'تعذر بدء مشاركة الشاشة.';
  }
}
