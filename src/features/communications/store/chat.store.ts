import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { ConversationService } from '../services/conversation.service';
import { MessageService } from '../services/message.service';
import { ChatSignalrService } from '../services/chat-signalr.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { ConversationDto, ConversationParticipantDto, MessageDto } from '../models/chat.model';
import { ChatFilter } from '../models/conversation.model';
import { Message } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class ChatStore {
  private readonly conversationService = inject(ConversationService);
  private readonly messageService = inject(MessageService);
  private readonly signalr = inject(ChatSignalrService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  // ── Requested Store Signals ───────────────────────────────────────────────
  readonly conversations = signal<ConversationDto[]>([]);
  readonly selectedConversation = signal<ConversationDto | null>(null);
  readonly selectedConversationDetails = signal<any | null>(null);
  readonly messages = signal<MessageDto[]>([]);
  readonly loading = signal<boolean>(false);
  readonly sending = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly connectionState = computed(() => this.signalr.connectionState());

  // ── Compatibility Loader and Error Signals ──────────────────────────────
  readonly isLoadingConversations = computed(() => this.loading());
  readonly isErrorConversations = computed(() => !!this.error());
  readonly isLoadingMessages = computed(() => this.loading());
  readonly isErrorMessages = computed(() => !!this.error());

  // ── Compatibility UI State Signals ───────────────────────────────────────────
  readonly searchQuery = signal('');
  readonly activeFilter = signal<ChatFilter>('all');
  readonly isContextPanelOpen = signal(true);
  readonly isMobileView = signal(false);
  readonly activeMobilePanel = signal<'list' | 'chat'>('list');
  readonly isSendingMessage = computed(() => this.sending());

  // ── Derived State ─────────────────────────────────────────────────────────
  readonly activeConversationId = computed(() => this.selectedConversation()?.id ?? null);

  readonly totalUnread = computed(() =>
    this.conversations().reduce((sum, c) => sum + c.unreadCount, 0)
  );

  readonly isTyping = computed(() => {
    const convId = this.activeConversationId();
    if (!convId) return false;
    const typingMap = this.signalr.typingUsers();
    const typers = typingMap.get(convId);
    return (typers?.size ?? 0) > 0;
  });

  // Map selectedConversation to legacy format for template compatibility
  readonly activeConversation = computed(() => {
    const selected = this.selectedConversation();
    if (!selected) return null;
    return this.mapToConversationPreview(selected);
  });

  // Filter conversations after mapping them to ConversationPreview for legacy layout
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

  // Expose messages mapped to compatibility format for the UI (Message interface)
  readonly uiMessages = computed<Message[]>(() => {
    const list = this.messages().map(m => this.mapToUiMessage(m));
    return [...list].sort((a, b) => {
      if (!a.createdAtUtc && b.createdAtUtc) return 1;
      if (a.createdAtUtc && !b.createdAtUtc) return -1;
      if (!a.createdAtUtc && !b.createdAtUtc) return 0;
      return a.createdAtUtc.localeCompare(b.createdAtUtc);
    });
  });

  constructor() {
    // Set up reactive reactions to SignalR events using Angular effects
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
      if (data) {
        this.handleIncomingMessageDeleted(data.messageId);
      }
    });
  }

  // ── Connection Handling Methods ──────────────────────────────────────────
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

  // ── Actions / Methods ──────────────────────────────────────────────────────
  loadConversations(pageNumber = 1, pageSize = 50): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(null);

    this.conversationService.getConversations(pageNumber, pageSize).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.conversations.set(res.data.items);
        } else {
          const errMsg = res.message || 'Failed to load conversations';
          this.error.set(errMsg);
          this.toastService.danger(errMsg);
        }
        this.loading.set(false);
      },
      error: (err) => {
        const errMsg = err.message || 'An error occurred while loading conversations';
        this.error.set(errMsg);
        this.toastService.danger(errMsg);
        this.loading.set(false);
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
      this.selectedConversation.set(existing);
      this.selectedConversationDetails.set(existing);
      this.messages.set([]);
      this.activeMobilePanel.set('chat');

      this.joinConversation(conversationId);

      this.loadMessages(conversationId);
      this.markConversationRead(conversationId);
    } else {
      this.loading.set(true);
      this.error.set(null);
      this.conversationService.getConversationById(conversationId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.selectedConversation.set(res.data);
            this.selectedConversationDetails.set(res.data);
            this.messages.set([]);
            this.activeMobilePanel.set('chat');

            this.joinConversation(conversationId);

            this.loadMessages(conversationId);
            this.markConversationRead(conversationId);
          } else {
            const errMsg = res.message || 'Conversation not found';
            this.error.set(errMsg);
            this.toastService.danger(errMsg);
          }
          this.loading.set(false);
        },
        error: (err) => {
          const errMsg = err.message || 'Failed to select conversation';
          this.error.set(errMsg);
          this.toastService.danger(errMsg);
          this.loading.set(false);
        }
      });
    }
  }

  loadMessages(conversationId?: string, pageNumber = 1, pageSize = 50): void {
    const targetId = conversationId || this.activeConversationId();
    if (!targetId) return;

    this.loading.set(true);
    this.error.set(null);

    this.messageService.getMessages(targetId, pageNumber, pageSize).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.messages.set(res.data.items);
        } else {
          const errMsg = res.message || 'Failed to load messages';
          this.error.set(errMsg);
          this.toastService.danger(errMsg);
        }
        this.loading.set(false);
      },
      error: (err) => {
        const errMsg = err.message || 'Failed to load messages';
        this.error.set(errMsg);
        this.toastService.danger(errMsg);
        this.loading.set(false);
      }
    });
  }

  sendMessage(messageText: string): void {
    const activeId = this.activeConversationId();
    if (!activeId || !messageText.trim() || this.sending()) return;

    this.sending.set(true);
    this.error.set(null);

    const optimisticId = `optimistic-${Date.now()}`;
    const cleanText = messageText.trim();

    // Optimistic update - Do not fabricate timestamps or Date.now() or copy conversation timestamps
    const optimisticMsg: MessageDto = {
      id: optimisticId,
      conversationId: activeId,
      senderId: this.authService.currentUser()?.id || 'current-user',
      senderName: this.authService.currentUser()?.fullName || 'You',
      messageText: cleanText,
      isEdited: false,
      createdAtUtc: '',
      lastModifiedUtc: '',
      status: 'sending',
      payload: { type: 'text', content: cleanText }
    };

    this.messages.update(msgs => [...msgs, optimisticMsg]);

    // Update last message in conversation preview optimistically
    this.conversations.update(convs =>
      convs.map(c => c.id === activeId
        ? { ...c, lastMessage: cleanText, lastMessageAt: '' }
        : c
      )
    );

    this.messageService.sendMessage(activeId, cleanText).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Append exactly the backend response payload on success
          const finalMsg: MessageDto = {
            ...res.data,
            status: 'read'
          };

          this.messages.update(msgs =>
            msgs.map(m => m.id === optimisticId ? finalMsg : m)
          );

          this.conversations.update(convs =>
            convs.map(c => c.id === activeId
              ? { ...c, lastMessage: finalMsg.messageText, lastMessageAt: finalMsg.createdAtUtc }
              : c
            )
          );
        } else {
          // Rollback on API error
          this.messages.update(msgs => msgs.filter(m => m.id !== optimisticId));
          const errMsg = res.message || 'Failed to send message';
          this.toastService.danger(errMsg);
        }
        this.sending.set(false);
      },
      error: (err) => {
        // Rollback on HTTP error
        this.messages.update(msgs => msgs.filter(m => m.id !== optimisticId));
        const errMsg = err.message || 'An error occurred while sending message';
        this.toastService.danger(errMsg);
        this.sending.set(false);
      }
    });
  }

  editMessage(messageId: string, messageText: string): void {
    const activeId = this.activeConversationId();
    if (!activeId || !messageText.trim()) return;

    const originalMessages = this.messages();
    const cleanText = messageText.trim();

    // Optimistic update
    this.messages.update(msgs =>
      msgs.map(m => m.id === messageId
        ? {
            ...m,
            messageText: cleanText,
            isEdited: true,
            payload: m.payload && m.payload.type === 'text' ? { ...m.payload, content: cleanText } : m.payload
          }
        : m
      )
    );

    this.messageService.editMessage(activeId, messageId, cleanText).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const updated = res.data;
          this.messages.update(msgs =>
            msgs.map(m => m.id === messageId ? updated : m)
          );
        } else {
          // Revert and load to refresh
          this.messages.set(originalMessages);
          const errMsg = res.message || 'Failed to edit message';
          this.toastService.danger(errMsg);
          this.loadMessages(activeId);
        }
      },
      error: (err) => {
        // Rollback on failure
        this.messages.set(originalMessages);
        const errMsg = err.message || 'Failed to edit message';
        this.toastService.danger(errMsg);
      }
    });
  }

  deleteMessage(messageId: string): void {
    const activeId = this.activeConversationId();
    if (!activeId) return;

    const originalMessages = this.messages();

    // Optimistically remove from UI immediately
    this.messages.update(msgs => msgs.filter(m => m.id !== messageId));

    this.messageService.deleteMessage(activeId, messageId).subscribe({
      next: () => {
        // Success - UI is already updated
      },
      error: (err) => {
        // Rollback on error
        this.messages.set(originalMessages);
        const errMsg = err.message || 'Failed to delete message';
        this.toastService.danger(errMsg);
      }
    });
  }

  refreshConversation(): void {
    const activeId = this.activeConversationId();
    if (!activeId) return;
    this.conversationService.getConversationById(activeId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.selectedConversation.set(res.data);
          this.selectedConversationDetails.set(res.data);
        }
      }
    });
  }

  // ── Additional UI Action Helpers ──────────────────────────────────────────
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
    this.activeMobilePanel.set('list');
    this.selectedConversation.set(null);
    this.selectedConversationDetails.set(null);
  }

  /** Called when a real-time message arrives from SignalR polling / fallbacks */
  handleIncomingMessage(msg: Message): void {
    const dto: MessageDto = {
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderName: msg.senderName,
      messageText: msg.messageText,
      isEdited: msg.isEdited ?? false,
      createdAtUtc: msg.createdAtUtc,
      lastModifiedUtc: msg.lastModifiedUtc ?? '',
      status: msg.status,
      payload: msg.payload
    };
    this.handleIncomingMessageDto(dto);
  }

  // ── Direct Dto Event Handlers from SignalR Service ───────────────────────
  handleIncomingMessageDto(dto: MessageDto): void {
    const activeId = this.activeConversationId();

    if (this.messages().some(m => m.id === dto.id)) {
      return;
    }

    if (dto.conversationId === activeId) {
      this.messages.update(msgs => [...msgs, dto]);
    }

    // Resolve the message text
    const messageText = dto.messageText || '';

    // Update conversation list preview and move it to top of list
    this.conversations.update(convs => {
      const targetIndex = convs.findIndex(c => c.id === dto.conversationId);
      if (targetIndex === -1) {
        // Fetch new conversation if not in current list
        this.conversationService.getConversationById(dto.conversationId).subscribe({
          next: (res) => {
            if (res.success && res.data) {
              const newConv = {
                ...res.data,
                lastMessage: messageText,
                lastMessageAt: dto.createdAtUtc,
                unreadCount: dto.conversationId === activeId ? 0 : res.data.unreadCount
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
      const updatedConv = {
        ...targetConv,
        lastMessage: messageText,
        lastMessageAt: dto.createdAtUtc,
        unreadCount: dto.conversationId === activeId ? 0 : targetConv.unreadCount + 1,
      };

      const remaining = convs.filter(c => c.id !== dto.conversationId);
      return [updatedConv, ...remaining];
    });
  }

  handleIncomingMessageEdited(dto: MessageDto): void {
    const activeId = this.activeConversationId();
    if (dto.conversationId === activeId) {
      this.messages.update(msgs =>
        msgs.map(m => m.id === dto.id ? { ...m, ...dto } : m)
      );
    }

    // Update conversation preview text
    this.conversations.update(convs =>
      convs.map(c => c.id === dto.conversationId
        ? { ...c, lastMessage: dto.messageText }
        : c
      )
    );
  }

  handleIncomingMessageDeleted(messageId: string): void {
    this.messages.update(msgs => msgs.filter(m => m.id !== messageId));
  }

  // ── Private Mappers ────────────────────────────────────────────────────────
  private mapToConversationPreview(dto: ConversationDto): any {
    const currentUserId = this.authService.currentUser()?.id;
    const other = dto.participants.find(p => p.id !== currentUserId) || dto.participants[0];

    // Support either lastMessage as string, or lastMessage as MessageDto object
    let lastMsgText = '';
    if (dto.lastMessage) {
      if (typeof dto.lastMessage === 'object') {
        lastMsgText = (dto.lastMessage as any).messageText || '';
      } else {
        lastMsgText = String(dto.lastMessage);
      }
    }

    // Support either lastMessageAt or createdAtUtc inside lastMessage
    let lastMsgAt = dto.lastMessageAt || '';
    if (!lastMsgAt && dto.lastMessage && typeof dto.lastMessage === 'object') {
      lastMsgAt = (dto.lastMessage as any).createdAtUtc || '';
    }
    if (!lastMsgAt) {
      lastMsgAt = new Date().toISOString();
    }

    return {
      id: dto.id,
      participant: other ? {
        id: other.id,
        name: other.fullName,
        avatarUrl: other.avatarUrl,
        role: other.role,
        isOnline: other.isOnline,
        lastSeenAt: other.lastSeenAt,
        bio: other.bio,
        rating: other.rating,
        reviewCount: other.reviewCount,
        specialization: other.specialization
      } : {
        id: '',
        name: 'Unknown',
        avatarUrl: null,
        role: 'user',
        isOnline: false,
        lastSeenAt: null
      },
      lastMessage: lastMsgText,
      lastMessageAt: lastMsgAt,
      unreadCount: dto.unreadCount
    };
  }

  private mapToUiMessage(dto: MessageDto): Message {
    const currentUserId = this.authService.currentUser()?.id;

    // Resolve senderName
    let senderName = dto.senderName;
    if (!senderName) {
      if (dto.senderId === currentUserId) {
        senderName = this.authService.currentUser()?.fullName || 'You';
      } else {
        const active = this.selectedConversation();
        if (active) {
          const participant = active.participants.find(p => p.id === dto.senderId);
          if (participant) {
            senderName = participant.fullName;
          }
        }
        if (!senderName) {
          for (const conv of this.conversations()) {
            const participant = conv.participants.find(p => p.id === dto.senderId);
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
      messageText: dto.messageText,
      payload: dto.payload || {
        type: 'text',
        content: dto.messageText
      },
      status: dto.status || 'read',
      createdAtUtc: dto.createdAtUtc,
      lastModifiedUtc: dto.lastModifiedUtc,
      isEdited: dto.isEdited,
      isOwn: dto.senderId === (currentUserId || 'current-user')
    };
  }
}
