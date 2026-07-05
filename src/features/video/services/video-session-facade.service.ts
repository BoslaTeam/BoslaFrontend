import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AgoraService } from '@core/services/agora.service';
import { ToastService } from '@core/services/toast.service';
import { VideoSessionService } from './video-session.service';
import { VideoSessionStateService } from './video-session-state.service';

@Injectable({ providedIn: 'root' })
export class VideoSessionFacade {
  private readonly router = inject(Router);
  private readonly agoraService = inject(AgoraService);
  private readonly toastService = inject(ToastService);
  private readonly videoSessionService = inject(VideoSessionService);
  private readonly sessionStateService = inject(VideoSessionStateService);

  readonly leaving = signal(false);
  readonly finishing = signal(false);

  async leaveSession(sessionId: string): Promise<void> {
    if (this.leaving()) return;
    this.leaving.set(true);
    try {
      await this.agoraService.disconnect();
      await firstValueFrom(this.videoSessionService.leaveAsync(sessionId));
      this.sessionStateService.reset();
      this.router.navigate(['/']);
    } catch {
      this.toastService.danger('Unable to leave the session.');
    } finally {
      this.leaving.set(false);
    }
  }

  async finishConsultation(sessionId: string): Promise<void> {
    if (this.finishing()) return;
    this.finishing.set(true);
    try {
      await firstValueFrom(this.videoSessionService.finishConsultationAsync(sessionId));
      await this.agoraService.disconnect();
      this.sessionStateService.reset();
      this.router.navigate(['/']);
    } catch {
      this.toastService.danger('Unable to finish consultation.');
    } finally {
      this.finishing.set(false);
    }
  }
}
