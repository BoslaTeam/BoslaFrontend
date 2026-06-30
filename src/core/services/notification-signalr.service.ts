import { Injectable, inject, effect, DestroyRef } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '@environments/environment';
import { NotificationService, AppNotification } from './notification.service';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

function mapNotificationType(type: string): number {
  switch (type) {
    case 'Message': return 0;
    case 'Booking': return 1;
    case 'Reminder': return 2;
    case 'SpecialistVerification': return 3;
    default: return 0;
  }
}

interface SignalRNotificationPayload {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAtUtc: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationSignalrService {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private destroyRef = inject(DestroyRef);

  private hubConnection: signalR.HubConnection | null = null;

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.connect();
      } else {
        this.disconnect();
      }
    });

    this.destroyRef.onDestroy(() => this.disconnect());
  }

  private connect(): void {
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.hubBaseUrl + '/hubs/notifications', {
        accessTokenFactory: () => this.tokenService.getAccessToken() ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveNotification', (payload: SignalRNotificationPayload) => {
      const notification: AppNotification = {
        id: payload.id,
        type: mapNotificationType(payload.type) as any,
        title: payload.title,
        message: payload.message,
        isRead: payload.isRead,
        createdAtUtc: payload.createdAtUtc,
      };
      this.notificationService.push(notification);
    });

    this.hubConnection.onreconnecting(() => {});
    this.hubConnection.onreconnected(() => {});
    this.hubConnection.onclose(() => {});

    this.hubConnection.start().catch(() => {});
  }

  private disconnect(): void {
    this.hubConnection?.stop();
    this.hubConnection = null;
  }
}
