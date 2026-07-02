import { Injectable, signal } from '@angular/core';
import type { Signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '@environments/environment';

export interface SessionStartedPayload {
  sessionId: string;
  startedAtUtc: string;
}

export interface SessionEndedPayload {
  sessionId: string;
  endedAtUtc: string;
}

export interface RecordingStartedPayload {
  sessionId: string;
  startedAtUtc: string;
}

export interface RecordingStoppedPayload {
  sessionId: string;
  recordingUrl: string;
}

export type VideoSignalrConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

@Injectable({ providedIn: 'root' })
export class VideoSignalrService {
  private hubConnection: signalR.HubConnection | null = null;
  private _sessionId: string | null = null;

  private readonly _sessionStarted = signal<SessionStartedPayload | null>(null);
  private readonly _sessionEnded = signal<SessionEndedPayload | null>(null);
  private readonly _recordingStarted = signal<RecordingStartedPayload | null>(null);
  private readonly _recordingStopped = signal<RecordingStoppedPayload | null>(null);
  private readonly _connectionState = signal<VideoSignalrConnectionState>('disconnected');

  readonly sessionStarted: Signal<SessionStartedPayload | null> = this._sessionStarted.asReadonly();
  readonly sessionEnded: Signal<SessionEndedPayload | null> = this._sessionEnded.asReadonly();
  readonly recordingStarted: Signal<RecordingStartedPayload | null> = this._recordingStarted.asReadonly();
  readonly recordingStopped: Signal<RecordingStoppedPayload | null> = this._recordingStopped.asReadonly();
  readonly connectionState: Signal<VideoSignalrConnectionState> = this._connectionState.asReadonly();

  async connect(sessionId: string): Promise<void> {
    if (this._connectionState() === 'connecting') return;

    if (this.hubConnection) {
      await this.disconnect();
    }

    this._sessionId = sessionId;

    const baseUrl = environment.hubBaseUrl.replace(/\/$/, '');
    const hubUrl = `${baseUrl}/hubs/video`;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem('bosla_access_token') ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this._connectionState.set('connecting');

    this.hubConnection.onreconnecting(() => this._connectionState.set('reconnecting'));

    this.hubConnection.onreconnected(async () => {
      this._connectionState.set('connected');
      if (this._sessionId && this.hubConnection) {
        try {
          await this.hubConnection.invoke('JoinSession', this._sessionId);
        } catch {
          console.warn('[VideoSignalrService] Re-join session after reconnect failed');
        }
      }
    });

    this.hubConnection.onclose(() => {
      this._connectionState.set('disconnected');
      this.hubConnection = null;
    });

    this.hubConnection.on('SessionStarted', (payload: SessionStartedPayload) => {
      this._sessionStarted.set(payload);
    });

    this.hubConnection.on('SessionEnded', (payload: SessionEndedPayload) => {
      this._sessionEnded.set(payload);
    });

    this.hubConnection.on('RecordingStarted', (payload: RecordingStartedPayload) => {
      this._recordingStarted.set(payload);
    });

    this.hubConnection.on('RecordingStopped', (payload: RecordingStoppedPayload) => {
      this._recordingStopped.set(payload);
    });

    try {
      await this.hubConnection.start();
      this._connectionState.set('connected');
      await this.hubConnection.invoke('JoinSession', sessionId);
    } catch (err) {
      console.error('[VideoSignalrService] Connection or join failed', err);
      this._connectionState.set('disconnected');
      await this.hubConnection?.stop();
      this.hubConnection = null;
    }
  }

  async disconnect(): Promise<void> {
    this._sessionId = null;
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
    }
    this._connectionState.set('disconnected');
    this._sessionStarted.set(null);
    this._sessionEnded.set(null);
    this._recordingStarted.set(null);
    this._recordingStopped.set(null);
  }
}
