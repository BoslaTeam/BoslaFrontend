import {
  Component,
  ViewChild,
  ElementRef,
  inject,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AgoraService } from '@core/services/agora.service';
import { VideoSessionService } from '../../services/video-session.service';

@Component({
  selector: 'app-video-room',
  standalone: true,
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
  private readonly videoSessionService = inject(VideoSessionService);

  private sessionId: string;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['..']);
    }
    this.sessionId = id!;

    this.destroyRef.onDestroy(() => {
      this.agoraService.disconnect();
    });
  }

  async joinSession(): Promise<void> {
    if (this.agoraService.joining() || this.agoraService.joined()) {
      return;
    }

    if (!this.checkBrowserSupport()) return;

    this.agoraService.clearError();

    try {
      const sessionRes = await firstValueFrom(
        this.videoSessionService.getSession(this.sessionId)
      );
      const session = sessionRes.data;
      if (!session) {
        this.agoraService.setError('Video session not found.');
        return;
      }

      const tokenRes = await firstValueFrom(
        this.videoSessionService.generateToken(session.appointmentId)
      );
      const token = tokenRes.data;
      if (!token) {
        this.agoraService.setError('Failed to generate Agora token.');
        return;
      }

      await firstValueFrom(
        this.videoSessionService.startSession(this.sessionId)
      );

      this.agoraService.initialize();
      await this.agoraService.join(token.appId, token.channelName, token.token, token.uid);
      await this.agoraService.createTracks();
      await this.agoraService.publish();

      console.log('[DEBUG] About to render local video');
      console.log('[DEBUG] ViewChild localPlayer:', this.localPlayer);
      console.log('[DEBUG] ViewChild nativeElement:', this.localPlayer?.nativeElement);
      console.log('[DEBUG] nativeElement isConnected:', this.localPlayer?.nativeElement?.isConnected);
      console.log('[DEBUG] nativeElement parentNode:', this.localPlayer?.nativeElement?.parentNode?.nodeName);
      this.agoraService.renderLocalVideo(this.localPlayer.nativeElement);
    } catch (err) {
      console.error('[VideoRoom] Join failed, rolling back', err);
      await this.agoraService.disconnect();
    }
  }

  async leaveSession(): Promise<void> {
    this.agoraService.clearError();
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
}
