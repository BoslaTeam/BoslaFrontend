import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '@environments/environment';
import { MessageDto } from '../models/chat.model';

export interface TypingEvent {
  conversationId: string;
  userId: string;
  userName: string;
}

interface MessageDeletedPayload {
  conversationId?: string;
  ConversationId?: string;
  messageId?: string;
  MessageId?: string;
  id?: string;
  Id?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatSignalrService {
  private hubConnection: signalR.HubConnection | null = null;
  private readonly joinedConversationIds = new Set<string>();
  private readonly pendingJoinIds = new Set<string>();

  private readonly _messageReceived = signal<MessageDto | null>(null);
  readonly messageReceived = this._messageReceived.asReadonly();

  private readonly _messageEdited = signal<MessageDto | null>(null);
  readonly messageEdited = this._messageEdited.asReadonly();

  private readonly _messageDeleted = signal<{ conversationId: string; messageId: string } | null>(null);
  readonly messageDeleted = this._messageDeleted.asReadonly();

  readonly connectionState = signal<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
  readonly typingUsers = signal<Map<string, Set<string>>>(new Map());

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
      this.rejoinJoinedConversations();
    });

    this.hubConnection.onclose(() => {
      this.connectionState.set('disconnected');
    });

    this.registerChatListeners(this.hubConnection);

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

    this.hubConnection.start()
      .then(() => {
        this.connectionState.set('connected');
        this.flushPendingJoins();
        this.rejoinJoinedConversations();
      })
      .catch((err) => {
        console.error('SignalR Hub Connection Error:', err);
        this.connectionState.set('disconnected');
      });
  }

  disconnect(): void {
    if (this.hubConnection) {
      this.unregisterChatListeners(this.hubConnection);
      this.hubConnection.stop();
      this.hubConnection = null;
      this.connectionState.set('disconnected');
      this.joinedConversationIds.clear();
      this.pendingJoinIds.clear();
    }
  }

  joinConversation(conversationId: string): void {
    if (this.joinedConversationIds.has(conversationId) || this.pendingJoinIds.has(conversationId)) {
      return;
    }

    this.pendingJoinIds.add(conversationId);

    if (this.hubConnection && this.connectionState() === 'connected') {
      this.invokeJoin(conversationId);
    }
  }

  leaveConversation(conversationId: string): void {
    this.pendingJoinIds.delete(conversationId);
    this.joinedConversationIds.delete(conversationId);

    if (this.hubConnection && this.connectionState() === 'connected') {
      this.hubConnection.invoke('LeaveConversation', conversationId)
        .catch(err => console.error('SignalR error invoking LeaveConversation:', err));
    }
  }

  sendTyping(conversationId: string): void {
    if (this.hubConnection && this.connectionState() === 'connected') {
      this.hubConnection.invoke('Typing', conversationId).catch(() => { });
    }
  }

  stopTyping(conversationId: string): void {
    if (this.hubConnection && this.connectionState() === 'connected') {
      this.hubConnection.invoke('StopTyping', conversationId).catch(() => { });
    }
  }

  markConversationRead(conversationId: string): void {
    if (this.hubConnection && this.connectionState() === 'connected') {
      this.hubConnection.invoke('MarkRead', conversationId).catch(() => { });
    }
  }

  private invokeJoin(conversationId: string): void {
    if (!this.hubConnection) return;
    if (this.joinedConversationIds.has(conversationId)) return;

    this.hubConnection.invoke('JoinConversation', conversationId)
      .then(() => {
        this.joinedConversationIds.add(conversationId);
        this.pendingJoinIds.delete(conversationId);
      })
      .catch(err => console.error('SignalR error invoking JoinConversation:', err));
  }

  private flushPendingJoins(): void {
    for (const conversationId of this.pendingJoinIds) {
      this.invokeJoin(conversationId);
    }
  }

  private rejoinJoinedConversations(): void {
    for (const conversationId of this.joinedConversationIds) {
      this.pendingJoinIds.add(conversationId);
    }
    this.joinedConversationIds.clear();

    for (const conversationId of this.pendingJoinIds) {
      this.invokeJoin(conversationId);
    }
  }

  private registerChatListeners(connection: signalR.HubConnection): void {
    this.unregisterChatListeners(connection);

    connection.on('MessageReceived', this.handleMessageReceived);
    connection.on('MessageEdited', this.handleMessageEdited);
    connection.on('MessageDeleted', this.handleMessageDeleted);
  }

  private unregisterChatListeners(connection: signalR.HubConnection): void {
    connection.off('MessageReceived', this.handleMessageReceived);
    connection.off('MessageEdited', this.handleMessageEdited);
    connection.off('MessageDeleted', this.handleMessageDeleted);
  }

  private readonly handleMessageReceived = (message: MessageDto): void => {
    this._messageReceived.set(message);
  };

  private readonly handleMessageEdited = (message: MessageDto): void => {
    this._messageEdited.set(message);
  };

  private readonly handleMessageDeleted = (data: unknown): void => {
    try {
      if (typeof data === 'string') {
        this._messageDeleted.set({ conversationId: '', messageId: data });
        return;
      }

      if (!data || typeof data !== 'object') {
        return;
      }

      const obj = data as Record<string, unknown>;
      const messageId = (obj['messageId'] ?? obj['MessageId'] ?? obj['id'] ?? obj['Id'] ?? '') as string;
      if (!messageId) {
        return;
      }

      this._messageDeleted.set({
        conversationId: (obj['conversationId'] ?? obj['ConversationId'] ?? '') as string,
        messageId
      });
    } catch {
      // Silently ignored — SignalR loses the handler if it throws
    }
  };
}
