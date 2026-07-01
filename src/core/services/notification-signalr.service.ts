import { Injectable, inject, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '@environments/environment';
import { AppNotification, NotificationService } from './notification.service';

interface SignalRNotificationDto {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAtUtc: string;
  appointmentId?: string;
  appointmentStatus?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationSignalrService {
  private hubConnection: signalR.HubConnection | null = null;
  private notificationService = inject(NotificationService);

  readonly connectionState = signal<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');

  init(): void {
    if (this.hubConnection) return;

    const baseUrl = environment.apiBaseUrl.includes('/api/v1')
      ? environment.apiBaseUrl.replace('/api/v1', '')
      : environment.apiBaseUrl;
    const hubUrl = `${baseUrl.replace(/\/$/, '')}/hubs/notifications`;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem('bosla_access_token') ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.connectionState.set('connecting');

    this.hubConnection.onreconnecting(() => this.connectionState.set('reconnecting'));
    this.hubConnection.onreconnected(() => this.connectionState.set('connected'));
    this.hubConnection.onclose(() => {
      this.connectionState.set('disconnected');
      this.hubConnection = null;
    });

    this.hubConnection.on('ReceiveNotification', (dto: SignalRNotificationDto) => {
      const notification: AppNotification = {
        id: dto.id,
        type: parseInt(dto.type, 10) || 1,
        title: dto.title,
        message: dto.message,
        isRead: dto.isRead,
        createdAtUtc: dto.createdAtUtc,
        appointmentId: dto.appointmentId,
        appointmentStatus: dto.appointmentStatus,
      };
      this.notificationService.push(notification);
    });

    this.hubConnection
      .start()
      .then(() => this.connectionState.set('connected'))
      .catch((err) => {
        console.error('Notification SignalR connection error:', err);
        this.connectionState.set('disconnected');
      });
  }

  disconnect(): void {
    this.hubConnection?.stop();
    this.hubConnection = null;
    this.connectionState.set('disconnected');
  }
}
