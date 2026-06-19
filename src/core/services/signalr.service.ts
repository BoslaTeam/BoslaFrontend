import { Injectable, inject, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { API_CONFIG } from '../config/api.config';
import { TokenService } from './token.service';

export type SignalRConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

/**
 * Owns the SignalR hub connection lifecycle only.
 * Feature-specific event handlers (chat messages, notifications) are registered
 * by `features/chat` and `features/notifications` via `getConnection()`.
 */
@Injectable({ providedIn: 'root' })
export class SignalrService {
  private readonly tokenService = inject(TokenService);
  private hubConnection: signalR.HubConnection | null = null;

  readonly connectionState = signal<SignalRConnectionState>('disconnected');

  connect(hubPath = '/hubs/app'): void {
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_CONFIG.baseUrl}${hubPath}`, {
        accessTokenFactory: () => this.tokenService.getAccessToken() ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.onreconnecting(() => this.connectionState.set('reconnecting'));
    this.hubConnection.onreconnected(() => this.connectionState.set('connected'));
    this.hubConnection.onclose(() => this.connectionState.set('disconnected'));

    this.connectionState.set('connecting');
    this.hubConnection
      .start()
      .then(() => this.connectionState.set('connected'))
      .catch(() => this.connectionState.set('disconnected'));
  }

  disconnect(): void {
    this.hubConnection?.stop();
    this.hubConnection = null;
    this.connectionState.set('disconnected');
  }

  getConnection(): signalR.HubConnection | null {
    return this.hubConnection;
  }
}