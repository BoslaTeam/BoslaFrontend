import { Injectable, inject, signal, computed, effect, WritableSignal, untracked } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { ConversationService } from '../services/conversation.service';
import { MessageService } from '../services/message.service';
import { ChatSignalrService } from '../services/chat-signalr.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import {
  ConversationDto,
  MessageDto,
} from '../models/chat.model';
import { PaginationMetadata } from '@core/models/paginated-response.model';
import { ChatFilter, ConversationPreview, UserRole } from '../models/conversation.model';
import { Message } from '../models/message.model';

const DELETED_MESSAGE_TEXT = 'This message was deleted';

@Injectable({ providedIn: 'root' })
export class ChatStore {
  private readonly conversationService = inject(ConversationService);
  private readonly messageService = inject(MessageService);
  private readonly signalr = inject(ChatSignalrService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  private messagesRequestId = 0;

  readonly conversations = signal<ConversationDto[]>([]);
  readonly selectedConversation = signal<ConversationDto | null>(null);
  readonly messages = signal<MessageDto[]>([]);
  readonly messagesMetadata = signal<PaginationMetadata | null>(null);

  readonly conversationsLoading = signal<boolean>(false);
  readonly messagesLoading = signal<boolean>(false);
  readonly sending = signal<boolean>(false);
  readonly editingMessageIds = signal<ReadonlySet<string>>(new Set());
  readonly deletingMessageIds = signal<ReadonlySet<string>>(new Set());
  readonly conversationsError = signal<string | null>(null);
  readonly messagesError = signal<string | null>(null);

  readonly connectionState = computed(() => this.signalr.connectionState());
  readonly isLoadingConversations = computed(() => this.conversationsLoading());
  readonly isErrorConversations = computed(() => !!this.conversationsError());
  readonly isLoadingMessages = computed(() => this.messagesLoading());
  readonly isErrorMessages = computed(() => !!this.messagesError());
  readonly isSendingMessage = computed(() => this.sending());

  readonly searchQuery = signal('');
  readonly activeFilter = signal<ChatFilter>('all');
  readonly isContextPanelOpen = signal(true);
  readonly isMobileView = signal(false);
  readonly activeMobilePanel = signal<'list' | 'chat'>('list');

  readonly activeConversationId = computed(() => this.selectedConversation()?.id ?? null);

  readonly totalUnread = computed(() =>
    this.conversations().reduce((sum, c) => sum + (c.unreadCount ?? 0), 0)
  );

  readonly isTyping = computed(() => {
    const convId = this.activeConversationId();
    if (!convId) return false;

    const currentUserId = this.authService.currentUser()?.id;
    const typers = this.signalr.typingUsers().get(convId);
    if (!typers?.size) return false;

    for (const userId of typers) {
      if (userId !== currentUserId) {
        return true;
      }
    }
    return false;
  });

  readonly activeConversation = computed(() => {
    const selected = this.selectedConversation();
    if (!selected) return null;
    return this.mapToConversationPreview(selected);
  });

  readonly filteredConversations = computed(() => {
    const list = this.conversations();
    const q = this.searchQuery().toLowerCase().trim();

    let mapped = list.map(c => this.mapToConversationPreview(c));

    if (q) {
      mapped = mapped.filter(c =>
        c.participant.name.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
      );
    }
    if (this.activeFilter() === 'unread') {
      mapped = mapped.filter(c => c.unreadCount > 0);
    }
    return mapped;
  });

  readonly uiMessages = computed<Message[]>(() => {
    const list = this.messages().map(m => this.mapToUiMessage(m));
    return this.sortMessagesAsc(list);
  });

  constructor() {
    effect(() => {
      const msg = this.signalr.messageReceived();
      if (msg) {
        this.handleIncomingMessageDto(msg);
      }
    });

    effect(() => {
      const msg = this.signalr.messageEdited();
      if (msg) {
        this.handleIncomingMessageEdited(msg);
      }
    });

    effect(() => {
      const data = this.signalr.messageDeleted();
      if (!data) return;

      untracked(() => {
        this.handleIncomingMessageDeleted(
          data.conversationId,
          data.messageId
        );
      });
    });

    effect(() => {
      if (this.signalr.connectionState() === 'connected') {
        const activeId = this.activeConversationId();
        if (activeId) {
          this.joinConversation(activeId);
        }
      }
    });
  }

  connectSignalR(): void {
    this.signalr.connect();
  }

  disconnectSignalR(): void {
    this.signalr.disconnect();
  }

  joinConversation(conversationId: string): void {
    this.signalr.joinConversation(conversationId);
  }

  leaveConversation(conversationId: string): void {
    this.signalr.leaveConversation(conversationId);
  }

  loadConversations(pageNumber = 1, pageSize = 50): void {
    if (this.conversationsLoading()) return;

    this.conversationsLoading.set(true);
    this.conversationsError.set(null);

    this.conversationService.getConversations(pageNumber, pageSize).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.conversations.set(res.data.items);
        } else {
          const errMsg = res.message || 'Failed to load conversations';
          this.conversationsError.set(errMsg);
          this.toastService.danger(errMsg);
        }
        this.conversationsLoading.set(false);
      },
      error: (err) => {
        const errMsg = err.message || 'An error occurred while loading conversations';
        this.conversationsError.set(errMsg);
        this.toastService.danger(errMsg);
        this.conversationsLoading.set(false);
      }
    });
  }

  selectConversation(conversationId: string): void {
    const previousId = this.activeConversationId();
    if (previousId && previousId !== conversationId) {
      this.leaveConversation(previousId);
    }

    const existing = this.conversations().find(c => c.id === conversationId);
    if (existing) {
      this.applyConversationSelection(existing, conversationId);
      return;
    }

    this.conversationsLoading.set(true);
    this.conversationsError.set(null);

    this.conversationService.getConversationById(conversationId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.applyConversationSelection(res.data, conversationId);
        } else {
          const errMsg = res.message || 'Conversation not found';
          this.conversationsError.set(errMsg);
          this.toastService.danger(errMsg);
        }
        this.conversationsLoading.set(false);
      },
      error: (err) => {
        const errMsg = err.message || 'Failed to select conversation';
        this.conversationsError.set(errMsg);
        this.toastService.danger(errMsg);
        this.conversationsLoading.set(false);
      }
    });
  }

  loadMessages(conversationId?: string, pageNumber = 1, pageSize = 50): void {
    const targetId = conversationId || this.activeConversationId();
    if (!targetId) return;

    const requestId = ++this.messagesRequestId;

    this.messagesLoading.set(true);
    this.messagesError.set(null);

    this.messageService.getMessages(targetId, pageNumber, pageSize).subscribe({
      next: (res) => {
        if (requestId !== this.messagesRequestId || targetId !== this.activeConversationId()) {
          return;
        }

        if (res.success && res.data) {
          this.messagesMetadata.set(res.data.metadata);
          const sortedItems = this.sortMessageDtosAsc(res.data.items);

          if (pageNumber > 1) {
            this.messages.update(existing => this.mergeMessageDtos(sortedItems, existing));
          } else {
            this.messages.set(sortedItems);
          }
        } else {
          const errMsg = res.message || 'Failed to load messages';
          this.messagesError.set(errMsg);
          this.toastService.danger(errMsg);
        }
        this.messagesLoading.set(false);
      },
      error: (err) => {
        if (requestId !== this.messagesRequestId || targetId !== this.activeConversationId()) {
          return;
        }

        const errMsg = err.message || 'Failed to load messages';
        this.messagesError.set(errMsg);
        this.toastService.danger(errMsg);
        this.messagesLoading.set(false);
      }
    });
  }

  sendMessage(messageText: string): void {
    const activeId = this.activeConversationId();
    if (!activeId || !messageText.trim() || this.sending()) return;

    this.sending.set(true);

    const optimisticId = `optimistic-${Date.now()}`;
    const cleanText = messageText.trim();
    const currentUserId = this.authService.currentUser()?.id || 'current-user';

    const optimisticMsg: MessageDto = {
      id: optimisticId,
      conversationId: activeId,
      senderId: currentUserId,
      senderName: this.authService.currentUser()?.fullName || 'You',
      messageText: cleanText,
      isEdited: false,
      createdAtUtc: '',
      lastModifiedUtc: '',
      status: 'sending',
      payload: { type: 'text', content: cleanText }
    };

    this.messages.update(msgs => this.insertMessageCreatedAtAsc(msgs, optimisticMsg));

    this.conversations.update(convs =>
      convs.map(c => c.id === activeId
        ? { ...c, lastMessage: optimisticMsg }
        : c
      )
    );

    this.messageService.sendMessage(activeId, cleanText).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const messageId = res.data;
          this.messages.update(msgs =>
            msgs.map(m => m.id === optimisticId ? { ...m, id: messageId, status: 'read' as const } : m)
          );

          this.conversations.update(convs =>
            convs.map(c => c.id === activeId
              ? { ...c, lastMessage: { ...c.lastMessage, id: messageId } as MessageDto }
              : c
            )
          );
        } else {
          this.messages.update(msgs => msgs.filter(m => m.id !== optimisticId));
          const errMsg = res.message || 'Failed to send message';
          this.toastService.danger(errMsg);
        }
        this.sending.set(false);
      },
      error: (err) => {
        this.messages.update(msgs => msgs.filter(m => m.id !== optimisticId));
        const errMsg = err.message || 'An error occurred while sending message';
        this.toastService.danger(errMsg);
        this.sending.set(false);
      }
    });
  }

  editMessage(messageId: string, messageText: string): Observable<boolean> {
    const activeId = this.activeConversationId();
    if (!activeId || !messageText.trim() || this.isEditingMessage(messageId) || !this.canModifyMessage(messageId)) return of(false);

    const originalMessages = this.messages();
    const cleanText = messageText.trim();
    this.setMessagePending(this.editingMessageIds, messageId, true);

    this.messages.update(msgs =>
      msgs.map(m => m.id === messageId
        ? {
          ...m,
          messageText: cleanText,
          isEdited: true,
          payload: m.payload && m.payload.type === 'text'
            ? { ...m.payload, content: cleanText }
            : m.payload
        }
        : m
      )
    );

    return this.messageService.editMessage(activeId, messageId, cleanText).pipe(
      map((res) => {
        if (res.success) {
          this.messages.update(msgs =>
            msgs.map(m => m.id === messageId
              ? this.toRealtimeEditedMessage(m, { ...m, messageText: cleanText, isEdited: true })
              : m
            )
          );
          return true;
        } else {
          this.messages.set(originalMessages);
          const errMsg = res.message || 'Failed to edit message';
          this.toastService.danger(errMsg);
          this.loadMessages(activeId);
          return false;
        }
      }),
      catchError((err: unknown) => {
        this.messages.set(originalMessages);
        const errMsg = this.getErrorMessage(err, 'Failed to edit message');
        this.toastService.danger(errMsg);
        return of(false);
      }),
      finalize(() => this.setMessagePending(this.editingMessageIds, messageId, false))
    );
  }

  deleteMessage(messageId: string): Observable<boolean> {
    const activeId = this.activeConversationId();
    if (!activeId || this.isDeletingMessage(messageId) || !this.canModifyMessage(messageId)) return of(false);

    this.setMessagePending(this.deletingMessageIds, messageId, true);

    return this.messageService.deleteMessage(activeId, messageId).pipe(
      map((res) => {
        if (!res || res.success) {
          const deletedMessage = res?.data ?? null;
          this.messages.update(msgs =>
            msgs.map(m => m.id === messageId ? this.toDeletedMessage(deletedMessage ?? m) : m)
          );
          this.updateDeletedConversationPreview(activeId, messageId);
          return true;
        }

        const errMsg = res.message || 'Failed to delete message';
        this.toastService.danger(errMsg);
        return false;
      }),
      catchError((err: unknown) => {
        const errMsg = this.getErrorMessage(err, 'Failed to delete message');
        this.toastService.danger(errMsg);
        return of(false);
      }),
      finalize(() => this.setMessagePending(this.deletingMessageIds, messageId, false))
    );
  }

  isEditingMessage(messageId: string): boolean {
    return this.editingMessageIds().has(messageId);
  }

  isDeletingMessage(messageId: string): boolean {
    return this.deletingMessageIds().has(messageId);
  }

  refreshConversation(): void {
    const activeId = this.activeConversationId();
    if (!activeId) return;

    this.conversationService.getConversationById(activeId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.selectedConversation.set(res.data);
        }
      }
    });
  }

  markConversationRead(conversationId: string): void {
    this.conversations.update(convs =>
      convs.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c)
    );
    this.signalr.markConversationRead(conversationId);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setFilter(filter: ChatFilter): void {
    this.activeFilter.set(filter);
  }

  toggleContextPanel(): void {
    this.isContextPanelOpen.update(v => !v);
  }

  goBackToList(): void {
    const activeId = this.activeConversationId();
    if (activeId) {
      this.leaveConversation(activeId);
    }

    this.messages.set([]);
    this.messagesMetadata.set(null);
    this.messagesError.set(null);
    this.activeMobilePanel.set('list');
    this.selectedConversation.set(null);
  }

  handleIncomingMessageDto(dto: MessageDto): void {
    const activeId = this.activeConversationId();
    const currentUserId = this.authService.currentUser()?.id;

    if (dto.conversationId === activeId) {
      this.messages.update(msgs => this.upsertActiveConversationMessage(msgs, dto, currentUserId));
    }

    const messageText = dto.messageText || '';

    this.conversations.update(convs => {
      const targetIndex = convs.findIndex(c => c.id === dto.conversationId);
      if (targetIndex === -1) {
        this.conversationService.getConversationById(dto.conversationId).subscribe({
          next: (res) => {
            if (res.success && res.data) {
              const newConv: ConversationDto = {
                ...res.data,
                lastMessage: dto,
                unreadCount: dto.conversationId === activeId ? 0 : 1,
              };
              this.conversations.update(cList => {
                if (cList.some(c => c.id === newConv.id)) return cList;
                return [newConv, ...cList];
              });
            }
          }
        });
        return convs;
      }

      const targetConv = convs[targetIndex];
      const updatedConv: ConversationDto = {
        ...targetConv,
        lastMessage: dto,
        unreadCount: dto.conversationId === activeId ? 0 : (targetConv.unreadCount ?? 0) + 1,
      };

      const remaining = convs.filter(c => c.id !== dto.conversationId);
      return [updatedConv, ...remaining];
    });
  }

  handleIncomingMessageEdited(dto: MessageDto): void {
    const activeId = this.activeConversationId();
    if (dto.conversationId === activeId) {
      this.messages.update(msgs =>
        msgs.map(m => m.id === dto.id ? this.toRealtimeEditedMessage(m, dto) : m)
      );
    }

    this.updateEditedConversationPreview(dto);
  }

  handleIncomingMessageDeleted(
    conversationId: string,
    messageId: string
  ): void {

    const activeId = this.activeConversationId();

    if (conversationId && activeId !== conversationId) {
      return;
    }

    const targetConversationId =
      conversationId || activeId;

    if (!targetConversationId) {
      return;
    }

    this.messages.update(messages =>
      messages.map(m =>
        m.id === messageId
          ? this.toDeletedMessage(m)
          : m
      )
    );

    this.updateDeletedConversationPreview(
      targetConversationId,
      messageId
    );
  }

  private applyConversationSelection(conversation: ConversationDto, conversationId: string): void {
    this.selectedConversation.set(conversation);
    this.messages.set([]);
    this.messagesMetadata.set(null);
    this.messagesError.set(null);
    this.activeMobilePanel.set('chat');
    this.joinConversation(conversationId);
    this.loadMessages(conversationId);
    this.markConversationRead(conversationId);
  }

  private upsertActiveConversationMessage(
    msgs: MessageDto[],
    dto: MessageDto,
    currentUserId: string | undefined
  ): MessageDto[] {
    const existingIndex = msgs.findIndex(m => m.id === dto.id);
    if (existingIndex >= 0) {
      return msgs;
    }

    if (dto.senderId === currentUserId) {
      const optimisticIndex = msgs.findIndex(m => m.id.startsWith('optimistic-'));
      if (optimisticIndex >= 0) {
        return this.sortMessageDtosAsc(msgs.map((m, index) => index === optimisticIndex ? dto : m));
      }
    }

    return this.insertMessageCreatedAtAsc(msgs, dto);
  }

  private replaceOptimisticMessage(
    msgs: MessageDto[],
    optimisticId: string,
    finalMsg: MessageDto
  ): MessageDto[] {
    const withoutOptimistic = msgs.filter(m => m.id !== optimisticId);
    const existingIndex = withoutOptimistic.findIndex(m => m.id === finalMsg.id);

    if (existingIndex >= 0) {
      return withoutOptimistic.map(m => m.id === finalMsg.id ? finalMsg : m);
    }

    return this.insertMessageCreatedAtAsc(withoutOptimistic, finalMsg);
  }

  private insertMessageCreatedAtAsc(items: MessageDto[], message: MessageDto): MessageDto[] {
    if (items.some(item => item.id === message.id)) {
      return items;
    }

    const next = items.slice();
    const messageCreatedAt = message.createdAtUtc || '';
    const insertIndex = next.findIndex(item => {
      if (!messageCreatedAt) return false;
      if (!item.createdAtUtc) return true;
      return messageCreatedAt.localeCompare(item.createdAtUtc) < 0;
    });

    if (insertIndex === -1) {
      next.splice(next.length, 0, message);
      return next;
    }

    next.splice(insertIndex, 0, message);
    return next;
  }

  private sortMessageDtosAsc(items: MessageDto[]): MessageDto[] {
    return items.slice().sort((a, b) => {
      if (!a.createdAtUtc && b.createdAtUtc) return 1;
      if (a.createdAtUtc && !b.createdAtUtc) return -1;
      if (!a.createdAtUtc && !b.createdAtUtc) return 0;
      return a.createdAtUtc.localeCompare(b.createdAtUtc);
    });
  }

  private sortMessagesAsc(items: Message[]): Message[] {
    return items.slice().sort((a, b) => {
      if (!a.createdAtUtc && b.createdAtUtc) return 1;
      if (a.createdAtUtc && !b.createdAtUtc) return -1;
      if (!a.createdAtUtc && !b.createdAtUtc) return 0;
      return a.createdAtUtc.localeCompare(b.createdAtUtc);
    });
  }

  private mergeMessageDtos(incoming: MessageDto[], existing: MessageDto[]): MessageDto[] {
    const merged = new Map<string, MessageDto>();

    for (const message of incoming) {
      merged.set(message.id, message);
    }
    for (const message of existing) {
      if (!merged.has(message.id)) {
        merged.set(message.id, message);
      }
    }

    return this.sortMessageDtosAsc(Array.from(merged.values()));
  }

  private mapToConversationPreview(dto: ConversationDto): ConversationPreview {
    const currentUserId = this.authService.currentUser()?.id;
    const other = dto.participants.find(p => p.userId !== currentUserId) || dto.participants[0];

    const lastMsgText = dto.lastMessage?.messageText ?? '';
    const lastMsgAt = dto.lastMessage?.createdAtUtc ?? '';

    const defaultParticipant = {
      id: '',
      name: 'Unknown',
      avatarUrl: null,
      role: 'user' as const,
      isOnline: false,
      lastSeenAt: null,
    };

    return {
      id: dto.id,
      participant: other ? {
        id: other.userId,
        name: other.fullName,
        avatarUrl: other.profilePictureUrl,
        role: this.toUserRole(other.role),
        isOnline: false,
        lastSeenAt: null,
      } : defaultParticipant,
      lastMessage: lastMsgText,
      lastMessageAt: lastMsgAt,
      unreadCount: dto.unreadCount ?? 0,
      appointmentId: dto.appointmentId,
    };
  }

  private mapToUiMessage(dto: MessageDto): Message {
    const currentUserId = this.authService.currentUser()?.id;
    const messageText = dto.isDeleted ? DELETED_MESSAGE_TEXT : dto.messageText;

    let senderName = dto.senderName;
    if (!senderName) {
      if (dto.senderId === currentUserId) {
        senderName = this.authService.currentUser()?.fullName || 'You';
      } else {
        const active = this.selectedConversation();
        if (active) {
          const participant = active.participants.find(p => p.userId === dto.senderId);
          if (participant) {
            senderName = participant.fullName;
          }
        }
        if (!senderName) {
          for (const conv of this.conversations()) {
            const participant = conv.participants.find(p => p.userId === dto.senderId);
            if (participant) {
              senderName = participant.fullName;
              break;
            }
          }
        }
      }
    }
    if (!senderName) {
      senderName = 'Unknown';
    }

    return {
      id: dto.id,
      conversationId: dto.conversationId,
      senderId: dto.senderId,
      senderName,
      messageText,
      payload: dto.isDeleted ? {
        type: 'text',
        content: DELETED_MESSAGE_TEXT
      } : dto.payload || {
        type: 'text',
        content: messageText
      },
      status: dto.status || 'read',
      createdAtUtc: dto.createdAtUtc,
      lastModifiedUtc: dto.lastModifiedUtc,
      isEdited: dto.isEdited,
      isDeleted: dto.isDeleted,
      isOwn: dto.senderId === currentUserId
    };
  }

  private toDeletedMessage(message: MessageDto): MessageDto {
    return {
      ...message,
      messageText: DELETED_MESSAGE_TEXT,
      isDeleted: true,
      payload: {
        type: 'text',
        content: DELETED_MESSAGE_TEXT
      }
    };
  }

  private toRealtimeEditedMessage(current: MessageDto, incoming: MessageDto): MessageDto {
    const messageText = incoming.messageText ?? current.messageText;

    return {
      ...current,
      messageText,
      isEdited: incoming.isEdited ?? true,
      lastModifiedUtc: incoming.lastModifiedUtc || current.lastModifiedUtc,
      payload: current.payload && current.payload.type === 'text'
        ? { ...current.payload, content: messageText }
        : current.payload
    };
  }

  private canModifyMessage(messageId: string): boolean {
    const currentUserId = this.authService.currentUser()?.id;
    const message = this.messages().find(m => m.id === messageId);
    return !!message && !!currentUserId && message.senderId === currentUserId && !message.isDeleted;
  }

  private updateDeletedConversationPreview(conversationId: string, messageId: string): void {
    const wasLatest = this.messages().at(-1)?.id === messageId;
    if (!wasLatest) return;

    this.conversations.update(convs =>
      convs.map(c => c.id === conversationId
        ? { ...c, lastMessage: c.lastMessage ? { ...c.lastMessage, isDeleted: true } : null }
        : c)
    );
  }

  private updateEditedConversationPreview(message: MessageDto): void {
    const latestMessage = this.messages().at(-1);
    if (latestMessage?.id !== message.id) return;

    this.conversations.update(convs =>
      convs.map(c => c.id === message.conversationId ? { ...c, lastMessage: message } : c)
    );
  }

  private setMessagePending(
    target: WritableSignal<ReadonlySet<string>>,
    messageId: string,
    pending: boolean
  ): void {
    target.update(ids => {
      const next = new Set(ids);
      if (pending) {
        next.add(messageId);
      } else {
        next.delete(messageId);
      }
      return next;
    });
  }

  private toUserRole(role: number): UserRole {
    return role === 1 ? 'specialist' : 'user';
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
