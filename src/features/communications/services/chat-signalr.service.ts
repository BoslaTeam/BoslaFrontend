import { Injectable, signal, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '@environments/environment';
import { MessageDto } from '../models/chat.model';
import { Message } from '../models/message.model';
import { AuthService } from '@core/services/auth.service';

export interface TypingEvent {
  conversationId: string;
  userId: string;
  userName: string;
}

@Injectable({ providedIn: 'root' })
export class ChatSignalrService {
  private hubConnection: signalR.HubConnection | null = null;
  private readonly authService = inject(AuthService);

  // Expose readonly signals
  private readonly _messageReceived = signal<MessageDto | null>(null);
  readonly messageReceived = this._messageReceived.asReadonly();

  private readonly _messageEdited = signal<MessageDto | null>(null);
  readonly messageEdited = this._messageEdited.asReadonly();

  private readonly _messageDeleted = signal<{ conversationId: string; messageId: string } | null>(null);
  readonly messageDeleted = this._messageDeleted.asReadonly();

  readonly connectionState = signal<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');

  // Compatibility signals for the legacy UI references
  readonly incomingMessage = signal<Message | null>(null);
  readonly typingUsers = signal<Map<string, Set<string>>>(new Map());
  readonly onlineStatuses = signal<Map<string, boolean>>(new Map());
  readonly messageStatusUpdate = signal<{ messageId: string; status: 'delivered' | 'read' } | null>(null);

  connect(): void {
    if (this.hubConnection && this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {
      return;
    }

    const baseUrl = environment.apiBaseUrl.includes('/api/v1')
      ? environment.apiBaseUrl.replace('/api/v1', '')
      : environment.apiBaseUrl;
    const hubUrl = `${baseUrl.replace(/\/$/, '')}/hubs/chat`;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem('bosla_access_token') ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.connectionState.set('connecting');

    this.hubConnection.onreconnecting(() => {
      this.connectionState.set('reconnecting');
    });

    this.hubConnection.onreconnected(() => {
      this.connectionState.set('connected');
    });

    this.hubConnection.onclose(() => {
      this.connectionState.set('disconnected');
    });

    // Register event listeners
    this.hubConnection.on('MessageReceived', (message: MessageDto) => {
      this._messageReceived.set(message);
      // Legacy structure mapping for fallback UI logic
      this.incomingMessage.set(this.mapDtoToMessage(message));
    });

    this.hubConnection.on('MessageEdited', (message: MessageDto) => {
      this._messageEdited.set(message);
    });

    this.hubConnection.on('MessageDeleted', (data: { conversationId: string; messageId: string } | string) => {
      if (typeof data === 'string') {
        this._messageDeleted.set({ conversationId: '', messageId: data });
      } else {
        this._messageDeleted.set(data);
      }
    });

    // Typing and status events
    this.hubConnection.on('UserTyping', (event: TypingEvent) => {
      this.typingUsers.update(map => {
        const updated = new Map(map);
        if (!updated.has(event.conversationId)) {
          updated.set(event.conversationId, new Set());
        }
        updated.get(event.conversationId)!.add(event.userId);
        return updated;
      });
    });

    this.hubConnection.on('UserStoppedTyping', (event: TypingEvent) => {
      this.typingUsers.update(map => {
        const updated = new Map(map);
        updated.get(event.conversationId)?.delete(event.userId);
        return updated;
      });
    });

    this.hubConnection.on('UserOnline', (userId: string) => {
      this.onlineStatuses.update(map => {
        const updated = new Map(map);
        updated.set(userId, true);
        return updated;
      });
    });

    this.hubConnection.on('UserOffline', (userId: string) => {
      this.onlineStatuses.update(map => {
        const updated = new Map(map);
        updated.set(userId, false);
        return updated;
      });
    });

    this.hubConnection.on('MessageDelivered', (messageId: string) => {
      this.messageStatusUpdate.set({ messageId, status: 'delivered' });
    });

    this.hubConnection.on('MessageRead', (messageId: string) => {
      this.messageStatusUpdate.set({ messageId, status: 'read' });
    });

    this.hubConnection.start()
      .then(() => {
        this.connectionState.set('connected');
      })
      .catch((err) => {
        console.error('SignalR Hub Connection Error:', err);
        this.connectionState.set('disconnected');
      });
  }

  disconnect(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
      this.connectionState.set('disconnected');
    }
  }

  joinConversation(conversationId: string): void {
    if (this.hubConnection && this.connectionState() === 'connected') {
      this.hubConnection.invoke('JoinConversation', conversationId)
        .catch(err => console.error('SignalR error invoking JoinConversation:', err));
    }
  }

  leaveConversation(conversationId: string): void {
    if (this.hubConnection && this.connectionState() === 'connected') {
      this.hubConnection.invoke('LeaveConversation', conversationId)
        .catch(err => console.error('SignalR error invoking LeaveConversation:', err));
    }
  }

  sendTyping(conversationId: string): void {
    if (this.hubConnection && this.connectionState() === 'connected') {
      this.hubConnection.invoke('Typing', conversationId).catch(() => {});
    }
  }

  stopTyping(conversationId: string): void {
    if (this.hubConnection && this.connectionState() === 'connected') {
      this.hubConnection.invoke('StopTyping', conversationId).catch(() => {});
    }
  }

  markConversationRead(conversationId: string): void {
    if (this.hubConnection && this.connectionState() === 'connected') {
      this.hubConnection.invoke('MarkRead', conversationId).catch(() => {});
    }
  }

  private mapDtoToMessage(dto: MessageDto): Message {
    const currentUserId = this.authService.currentUser()?.id;
    return {
      id: dto.id,
      conversationId: dto.conversationId,
      senderId: dto.senderId,
      senderName: dto.senderName || 'User',
      messageText: dto.messageText,
      payload: dto.payload || { type: 'text', content: dto.messageText },
      status: dto.status || 'read',
      createdAtUtc: dto.createdAtUtc,
      lastModifiedUtc: dto.lastModifiedUtc,
      isEdited: dto.isEdited,
      isOwn: dto.senderId === currentUserId
    };
  }
}
