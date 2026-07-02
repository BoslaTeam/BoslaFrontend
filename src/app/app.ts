import { Component, inject, signal, effect, NgZone } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiToast } from "@shared/ui/toast/toast";
import { UiGlobalLoader } from "@shared/ui/global-loader/global-loader";
import { NotificationSignalrService } from '@core/services/notification-signalr.service';
import { FaviconBadgeService } from '@core/services/favicon-badge.service';
import { NotificationToast } from '@features/notifications/components/notification-toast/notification-toast';
import { NotificationsService } from '@features/notifications/services/notifications.service';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/services/auth.service';
import { AiChatWidget } from '@features/ai/components/ai-chat-widget/ai-chat-widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UiToast, UiGlobalLoader, NotificationToast, AiChatWidget],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('BoslaFrontend');
  private _signalr = inject(NotificationSignalrService);
  private _favicon = inject(FaviconBadgeService);
  private _notifHttp = inject(NotificationsService);
  private _notifState = inject(NotificationService);
  private _auth = inject(AuthService);
  private _zone = inject(NgZone);

  private _audioCtx: AudioContext | null = null;

  constructor() {
    effect(() => {
      if (this._auth.isAuthenticated()) {
        this._signalr.init();
        this._notifHttp.getNotifications().subscribe({ error: () => {} });
        this._auth.refreshSpecialistStatus();
      }
    });

    effect(() => {
      const push = this._notifState.livePush();
      if (push) {
        this.playNotifSound();
      }
    });

    this.unlockAudioOnInteraction();
  }

  private unlockAudioOnInteraction(): void {
    this._zone.runOutsideAngular(() => {
      const handler = () => {
        if (!this._audioCtx) {
          this._audioCtx = new AudioContext();
        }
        if (this._audioCtx.state === 'suspended') {
          this._audioCtx.resume();
        }
        document.removeEventListener('click', handler);
        document.removeEventListener('keydown', handler);
      };
      document.addEventListener('click', handler);
      document.addEventListener('keydown', handler);
    });
  }

  private playNotifSound(): void {
    try {
      if (!this._audioCtx) {
        this._audioCtx = new AudioContext();
      }
      const ctx = this._audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      /* audio not supported */
    }
  }
}
