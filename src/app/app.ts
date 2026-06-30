import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiToast } from "@shared/ui/toast/toast";
import { UiGlobalLoader } from "@shared/ui/global-loader/global-loader";
import { NotificationSignalrService } from '@core/services/notification-signalr.service';
import { FaviconBadgeService } from '@core/services/favicon-badge.service';
import { NotificationToast } from '@features/notifications/components/notification-toast/notification-toast';

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
}
