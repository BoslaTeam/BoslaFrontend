import { Component, inject, signal, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiToast } from "@shared/ui/toast/toast";
import { UiGlobalLoader } from "@shared/ui/global-loader/global-loader";
import { NotificationSignalrService } from '@core/services/notification-signalr.service';
import { FaviconBadgeService } from '@core/services/favicon-badge.service';
import { NotificationToast } from '@features/notifications/components/notification-toast/notification-toast';
import { NotificationsService } from '@features/notifications/services/notifications.service';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UiToast, UiGlobalLoader, NotificationToast],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('BoslaFrontend');
  private _signalr = inject(NotificationSignalrService);
  private _favicon = inject(FaviconBadgeService);
  private _notifHttp = inject(NotificationsService);
  private _notifState = inject(NotificationService);
  private _auth = inject(AuthService);

  constructor() {
    effect(() => {
      if (this._auth.isAuthenticated()) {
        this._notifHttp.getNotifications().subscribe();
      }
    });

    effect(() => {
      const push = this._notifState.livePush();
      if (push) {
        this.playNotifSound();
      }
    });
  }

  private playNotifSound(): void {
    try {
      const ctx = new AudioContext();
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
