import {
  Component,
  ViewChild,
  ElementRef,
  inject,
  DestroyRef,
  ChangeDetectionStrategy,
  effect,
  signal,
  computed,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AgoraService } from '@core/services/agora.service';
import { SessionTimerService } from '@core/services/session-timer.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { AppointmentExpiryService } from '@core/services/appointment-expiry.service';
import { UserRole } from '@core/enums/user-role.enum';
import { VideoSessionService } from '../../services/video-session.service';
import { VideoSignalrService } from '../../services/video-signalr.service';
import { VideoSessionDto } from '../../models/video-session.model';
import { VideoNetworkQualityService } from '../../services/video-network-quality.service';
import { VideoDeviceService } from '../../services/video-device.service';
import { NetworkQualityBadge } from '../network-quality-badge/network-quality-badge';
import { ConnectionStatusBadge } from '../connection-status-badge/connection-status-badge';
import { CameraSelector } from '../camera-selector/camera-selector';
import { MicrophoneSelector } from '../microphone-selector/microphone-selector';
import { SpeakerSelector } from '../speaker-selector/speaker-selector';
import { MicrophoneLevelIndicator } from '../microphone-level-indicator/microphone-level-indicator';
import { SpeakerTestButton } from '../speaker-test-button/speaker-test-button';
import { VideoScreenShareService } from '../../services/video-screen-share.service';
import { ScreenShareButton } from '../screen-share-button/screen-share-button';
import { ScreenShareIndicator } from '../screen-share-indicator/screen-share-indicator';
import { VideoRecordingTimerService } from '../../services/video-recording-timer.service';
import { RecordingButton } from '../recording-button/recording-button';
import { RecordingIndicator } from '../recording-indicator/recording-indicator';
import { VideoSessionStateService } from '../../services/video-session-state.service';
import { VideoSessionFacade } from '../../services/video-session-facade.service';
import { AppointmentService } from '@features/appointments/services/appointments.service';
import { UiModal } from '@shared/ui/modal/modal';

@Component({
  selector: 'app-video-room',
  standalone: true,
  imports: [RouterLink, UiModal, ConnectionStatusBadge, NetworkQualityBadge, CameraSelector, MicrophoneSelector, SpeakerSelector, MicrophoneLevelIndicator, SpeakerTestButton, ScreenShareButton, ScreenShareIndicator, RecordingButton, RecordingIndicator],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-room.html',
  styleUrl: './video-room.css',
})
export class VideoRoom {
  @ViewChild('localPlayer', { static: true }) localPlayer!: ElementRef<HTMLDivElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly agoraService = inject(AgoraService);
  readonly sessionTimerService = inject(SessionTimerService);
  readonly networkQualityService = inject(VideoNetworkQualityService);
  readonly videoDeviceService = inject(VideoDeviceService);
  readonly screenShareService = inject(VideoScreenShareService);
  readonly recordingTimerService = inject(VideoRecordingTimerService);
  private readonly videoSessionService = inject(VideoSessionService);
  private readonly videoSignalrService = inject(VideoSignalrService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  readonly expiryService = inject(AppointmentExpiryService);
  readonly sessionStateService = inject(VideoSessionStateService);
  readonly sessionFacade = inject(VideoSessionFacade);
  private readonly appointmentService = inject(AppointmentService);

  public sessionId: string;
  private isDestroyed = false;
  private _sessionStartedAt: number | null = null;
  private _sessionEndedAt: number | null = null;
  private _appointmentId: string | null = null;
  private _waitingCancelled = false;
  private _joinFlowInProgress = false;

  get isSpecialist(): boolean {
    return this.authService.userRole() === UserRole.Specialist;
  }

  readonly isWaitingForSpecialist = signal(false);
  readonly isSessionEnded = signal(false);
  readonly signalrFailed = signal(false);
  readonly isRejoining = signal(false);
  readonly currentYear = new Date().getFullYear();
  readonly userRole = this.authService.userRole;
  readonly isSpecialist = computed(() => this.userRole() === UserRole.Specialist);

  readonly leaveDialogOpen = signal(false);
  readonly finishDialogOpen = signal(false);

  /** Mobile accordion: device settings panel open/closed state */
  readonly deviceSettingsOpen = signal(false);
  toggleDeviceSettings() { this.deviceSettingsOpen.update(v => !v); }

  /** Effect: swap local preview between screen and camera tracks */
  private readonly _screenShareEffect = effect(() => {
    const state = this.screenShareService.state();
    const joined = this.agoraService.joined();
    if (!joined) return;

    if (state === 'Sharing') {
      Promise.resolve().then(() => {
        const screenTrack = this.screenShareService.getScreenTrack();
        if (screenTrack && this.localPlayer) {
          screenTrack.play(this.localPlayer.nativeElement);
        }
      });
    } else if (state === 'Idle') {
      Promise.resolve().then(() => {
        if (this.localPlayer) {
          this.agoraService.renderLocalVideo(this.localPlayer.nativeElement);
        }
      });
    }
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['..']);
    }
    this.sessionId = id!;

    this.videoDeviceService.enumerateDevices();
    this.loadSessionState();

    effect(() => {
      const payload = this.videoSignalrService.sessionStarted();
      if (!payload) return;

      const ts = this.toTimestamp(payload.startedAtUtc);
      if (ts === null) return;

      this._sessionStartedAt = ts;
      this.sessionTimerService.start(ts, this._sessionEndedAt ?? undefined);

      if (this.isWaitingForSpecialist()) {
        this.isWaitingForSpecialist.set(false);
        this.continueJoinFlow();
      }
    });

    effect(() => {
      const payload = this.videoSignalrService.sessionEnded();
      if (!payload) return;

      this._sessionEndedAt = this.toTimestamp(payload.endedAtUtc);
      this.sessionTimerService.stop();
      this.recordingTimerService.stop();
      this.sessionStateService.setSessionCompleted();
      this.isSessionEnded.set(true);
      this.isWaitingForSpecialist.set(false);

      if (this.agoraService.joined()) {
        this.networkQualityService.stop();
        this.agoraService.disconnect();
      }

      // Auto-navigate home after 3 seconds so user sees the ended state briefly
      setTimeout(() => {
        if (!this.isDestroyed) {
          this.router.navigate(['..']);
        }
      }, 3000);
    });

    effect(() => {
      if (this.expiryService.isExpired()) {
        this.toastService.warning('انتهت مدة الجلسة تلقائياً.');
        this.sessionTimerService.stop();
        this.recordingTimerService.stop();
        this.isSessionEnded.set(true);

        if (this.agoraService.joined()) {
          this.networkQualityService.stop();
          this.agoraService.disconnect();
        }

        setTimeout(() => {
          if (!this.isDestroyed) {
            this.router.navigate(['..']);
          }
        }, 3000);
      }
    });

    effect(() => {
      const payload = this.videoSignalrService.recordingStarted();
      if (!payload) return;
      this.recordingTimerService.start(payload.startedAtUtc);
    });

    effect(() => {
      const payload = this.videoSignalrService.recordingStopped();
      if (!payload) return;
      this.recordingTimerService.stop();
    });

    effect(() => {
      const state = this.videoSignalrService.connectionState();
      if (!this.isWaitingForSpecialist()) return;

      if (state === 'disconnected' && !this._waitingCancelled) {
        this.signalrFailed.set(true);
      }

      if (state === 'connected') {
        this.signalrFailed.set(false);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.isDestroyed = true;
      this.networkQualityService.stop();
      this.videoSignalrService.disconnect();
      this.sessionTimerService.stop();
      this.agoraService.disconnect();
      this.sessionStateService.reset();
    });
  }

  async handleJoinClick(): Promise<void> {
    if (this.isDestroyed) return;
    if (this.isSessionEnded()) return;
    if (this.agoraService.joining() || this.agoraService.joined()) return;
    if (!this.checkBrowserSupport()) return;

    this.agoraService.clearError();
    this._sessionStartedAt = null;
    this._sessionEndedAt = null;
    this._appointmentId = null;
    this.isSessionEnded.set(false);
    this.isWaitingForSpecialist.set(false);
    this.signalrFailed.set(false);
    this._waitingCancelled = false;

    const session = await this.loadVideoSession();
    if (!session || this.isDestroyed) return;

    this._appointmentId = session.appointmentId;
    this.sessionStateService.reset();
    await this.initStateFromSession(session);

    if (session.recording?.isRecording && session.recording.startedAtUtc) {
      this.recordingTimerService.start(session.recording.startedAtUtc);
    }

    if (session.appointmentEndTime) {
      this.expiryService.start(session.appointmentEndTime);
    }

    if (!await this.connectSignalr()) return;

    const canContinue = await this.ensureSessionStarted(session);
    if (!canContinue) return;

    if (this._sessionStartedAt !== null) {
      this.sessionTimerService.start(this._sessionStartedAt, this._sessionEndedAt ?? undefined);
    }

    await this.continueJoinFlow();
  }

  retryJoin(): void {
    this._waitingCancelled = false;
    this.signalrFailed.set(false);
    this.agoraService.clearError();
    this.handleJoinClick();
  }

  private async loadSessionState(): Promise<void> {
    try {
      const sessionRes = await firstValueFrom(
        this.videoSessionService.getSession(this.sessionId)
      );
      if (this.isDestroyed) return;

      const session = sessionRes.data;
      if (!session) return;

      await this.initStateFromSession(session);
    } catch {
      // Session load failed — canJoin stays false, user can retry via handleJoinClick
    }
  }

  private async initStateFromSession(session: VideoSessionDto): Promise<void> {
    let startMs = this.toTimestamp(session.appointmentStart);
    let endMs = this.toTimestamp(session.appointmentEnd);

    if (startMs === null || endMs === null) {
      try {
        const aptRes = await firstValueFrom(
          this.appointmentService.getById(session.appointmentId)
        );
        if (this.isDestroyed) return;
        if (aptRes.data) {
          startMs = this.toTimestamp(aptRes.data.start);
          endMs = this.toTimestamp(aptRes.data.end);
        }
      } catch {
        return;
      }
    }

    if (startMs !== null && endMs !== null) {
      this.sessionStateService.init(startMs, endMs);
    }
  }

  private async loadVideoSession(): Promise<VideoSessionDto | null> {
    try {
      const sessionRes = await firstValueFrom(
        this.videoSessionService.getSession(this.sessionId)
      );
      if (this.isDestroyed) return null;

      const session = sessionRes.data;
      if (!session) {
        this.agoraService.setError('Video session not found.');
        return null;
      }

      this._sessionStartedAt = this.toTimestamp(session.startedAt);
      this._sessionEndedAt = this.toTimestamp(session.endedAt);
      return session;
    } catch (err) {
      console.error('[VideoRoom] Load session failed', err);
      this.agoraService.setError('Failed to load video session.');
      return null;
    }
  }

  private async connectSignalr(): Promise<boolean> {
    await this.videoSignalrService.connect(this.sessionId);
    if (this.isDestroyed) return false;

    if (this.videoSignalrService.connectionState() !== 'connected') {
      this.signalrFailed.set(true);
      this.agoraService.setError('تعذر الاتصال بخادم الجلسة.');
      return false;
    }

    return true;
  }

  private async ensureSessionStarted(session: VideoSessionDto): Promise<boolean> {
    if (session.status === 'Ended') {
      this.isSessionEnded.set(true);
      return false;
    }

    if (session.status === 'Active') {
      this.isRejoining.set(true);
      return true;
    }

    const role = this.authService.userRole();
    if (role !== UserRole.Specialist) {
      this.isWaitingForSpecialist.set(true);
      this._waitingCancelled = false;
      return false;
    }

    try {
      const startRes = await firstValueFrom(
        this.videoSessionService.startSession(this.sessionId)
      );
      if (this.isDestroyed) return false;

      this._sessionStartedAt = this.toTimestamp(startRes.data?.startedAt);
      return true;
    } catch (err) {
      console.error('[VideoRoom] Start session failed', err);
      this.agoraService.setError('Failed to start the session. Please try again.');
      return false;
    }
  }

  private async continueJoinFlow(): Promise<void> {
    if (this._joinFlowInProgress) return;
    if (this.agoraService.joining() || this.agoraService.joined()) return;
    if (this.isDestroyed || !this._appointmentId) return;

    this._joinFlowInProgress = true;
    this.sessionStateService.setSessionConnecting();

    try {
      const tokenRes = await firstValueFrom(
        this.videoSessionService.generateToken(this._appointmentId)
      );
      if (this.isDestroyed) return;

      const token = tokenRes.data;
      if (!token) {
        this.agoraService.setError('Failed to generate Agora token.');
        return;
      }

      if (this.isDestroyed) return;

      this.agoraService.initialize();
      await this.agoraService.join(token.appId, token.channelName, token.token, token.uid);
      if (this.isDestroyed) {
        await this.agoraService.disconnect();
        return;
      }

      await this.agoraService.createTracks();
      if (this.isDestroyed) {
        await this.agoraService.disconnect();
        return;
      }

      await this.agoraService.publish();
      if (this.isDestroyed) {
        await this.agoraService.disconnect();
        return;
      }

      this.sessionStateService.setSessionConnected();
      this.networkQualityService.start();
      this.videoDeviceService.refreshPermissions();
      this.videoDeviceService.enumerateDevices();
      this.agoraService.renderLocalVideo(this.localPlayer.nativeElement);
    } catch (err) {
      console.error('[VideoRoom] Join failed, rolling back', err);
      await this.agoraService.disconnect();
    } finally {
      this._joinFlowInProgress = false;
    }
  }

  toggleCamera(): void {
    this.agoraService.toggleCamera();
  }

  toggleMicrophone(): void {
    this.agoraService.toggleMicrophone();
  }

  readonly showLeaveConfirm = signal(false);
  readonly showFinishConfirm = signal(false);

  confirmLeave(): void {
    this.showLeaveConfirm.set(true);
  }

  cancelLeave(): void {
    this.showLeaveConfirm.set(false);
  }

  async leaveSession(): Promise<void> {
    this.showLeaveConfirm.set(false);
    this.agoraService.clearError();
    this.networkQualityService.stop();
    this.sessionTimerService.stop();
    await this.agoraService.disconnect();

    try {
      await firstValueFrom(this.videoSessionService.leaveSession(this.sessionId));
    } catch (err) {
      console.error('[VideoRoom] Leave request failed', err);
    }

    this.router.navigate(['..']);
  }

  confirmFinish(): void {
    this.showFinishConfirm.set(true);
  }

  cancelFinish(): void {
    this.showFinishConfirm.set(false);
  }

  async finishConsultation(): Promise<void> {
    this.showFinishConfirm.set(false);
    this.agoraService.clearError();
    this.networkQualityService.stop();
    this.sessionTimerService.stop();
    await this.agoraService.disconnect();

    try {
      await firstValueFrom(this.videoSessionService.finishConsultation(this.sessionId));
    } catch (err) {
      console.error('[VideoRoom] Finish consultation request failed', err);
      this.toastService.danger('فشل في إنهاء الاستشارة.');
      return;
    }

    this.router.navigate(['..']);
  }

  private checkBrowserSupport(): boolean {
    const supported = this.agoraService.checkBrowserSupport();
    if (!supported) {
      if (!window.isSecureContext) {
        this.agoraService.setError(
          'Video calls require a secure HTTPS connection.'
        );
      } else {
        this.agoraService.setError(
          'Your browser does not support the required WebRTC APIs.'
        );
      }
    }
    return supported;
  }

  private toTimestamp(value?: string | null): number | null {
    if (!value) return null;
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }
}
