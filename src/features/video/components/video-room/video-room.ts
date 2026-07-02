import {
  Component,
  ViewChild,
  ElementRef,
  inject,
  DestroyRef,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AgoraService } from '@core/services/agora.service';
import { SessionTimerService } from '@core/services/session-timer.service';
import { VideoSessionService } from '../../services/video-session.service';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/enums/user-role.enum';
import { SessionPrepPanel } from '@features/ai/components/session-prep-panel/session-prep-panel';

@Component({
  selector: 'app-video-room',
  standalone: true,
  imports: [SessionPrepPanel],
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
  private readonly videoSessionService = inject(VideoSessionService);
  private readonly authService = inject(AuthService);

  private sessionId: string;
  private isDestroyed = false;
  private _sessionStartedAt: number | null = null;
  private _sessionEndedAt: number | null = null;

  /** Appointment ID fetched from session data — used by SessionPrepPanel */
  readonly appointmentId = signal<string | null>(null);

  /**
   * For specialists: show session prep screen before joining.
   * null = loading/undecided, true = show prep, false = skip (user/non-specialist)
   */
  readonly showSessionPrep = signal<boolean>(false);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['..']);
    }
    this.sessionId = id!;

    // For specialists: load session data to get appointmentId, then show prep panel
    if (this.authService.userRole() === UserRole.Specialist) {
      this.loadSessionForPrep();
    }

    this.destroyRef.onDestroy(() => {
      this.isDestroyed = true;
      this.sessionTimerService.stop();
      this.agoraService.disconnect();
    });
  }

  /** Fetches session metadata to resolve appointmentId for the prep panel */
  private loadSessionForPrep(): void {
    this.videoSessionService.getSession(this.sessionId).subscribe({
      next: (res) => {
        if (res.data?.appointmentId) {
          this.appointmentId.set(res.data.appointmentId);
          this.showSessionPrep.set(true);
        }
      },
      error: () => {
        // If we can't load session data, fall through to normal join
        this.showSessionPrep.set(false);
      },
    });
  }

  /** Called when specialist confirms from the prep panel */
  onPrepEnterSession(): void {
    this.showSessionPrep.set(false);
  }

  /** Called when specialist clicks "back" in the prep panel */
  onPrepBack(): void {
    this.router.navigate(['..']);
  }

  async joinSession(): Promise<void> {
    if (this.isDestroyed) return;
    if (this.agoraService.joining() || this.agoraService.joined()) {
      return;
    }

    if (!this.checkBrowserSupport()) return;

    this.agoraService.clearError();
    this._sessionStartedAt = null;
    this._sessionEndedAt = null;

    try {
      const sessionRes = await firstValueFrom(
        this.videoSessionService.getSession(this.sessionId)
      );
      if (this.isDestroyed) return;

      const session = sessionRes.data;
      if (!session) {
        this.agoraService.setError('Video session not found.');
        return;
      }
      this._sessionStartedAt = this.toTimestamp(session.startedAt);
      this._sessionEndedAt = this.toTimestamp(session.endedAt);

      const tokenRes = await firstValueFrom(
        this.videoSessionService.generateToken(session.appointmentId)
      );
      if (this.isDestroyed) return;

      const token = tokenRes.data;
      if (!token) {
        this.agoraService.setError('Failed to generate Agora token.');
        return;
      }

      const startRes = await firstValueFrom(
        this.videoSessionService.startSession(this.sessionId)
      );
      if (this._sessionStartedAt === null) {
        this._sessionStartedAt = this.toTimestamp(startRes.data?.startedAt);
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

      this.agoraService.renderLocalVideo(this.localPlayer.nativeElement);
    } catch (err) {
      console.error('[VideoRoom] Join failed, rolling back', err);
      await this.agoraService.disconnect();
    }
  }

  async handleJoinClick(): Promise<void> {
    await this.joinSession();
    if (this._sessionStartedAt !== null) {
      this.sessionTimerService.start(
        this._sessionStartedAt,
        this._sessionEndedAt ?? undefined
      );
    }
  }

  toggleCamera(): void {
    this.agoraService.toggleCamera();
  }

  toggleMicrophone(): void {
    this.agoraService.toggleMicrophone();
  }

  async leaveSession(): Promise<void> {
    this.agoraService.clearError();
    this.sessionTimerService.stop();
    await this.agoraService.disconnect();

    try {
      await firstValueFrom(this.videoSessionService.endSession(this.sessionId));
    } catch (err) {
      console.error('[VideoRoom] Leave request failed', err);
    }

    this.router.navigate(['..']);
  }

  private checkBrowserSupport(): boolean {
    const supported = this.agoraService.checkBrowserSupport();
    if (!supported) {
      this.agoraService.setError(
        'Your browser does not support video calls. Please use Chrome or Edge.'
      );
    }
    return supported;
  }

  private toTimestamp(value?: string | null): number | null {
    if (!value) return null;
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }
}
