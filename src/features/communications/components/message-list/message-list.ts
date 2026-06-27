import {
  Component, inject, ElementRef, ViewChild, AfterViewChecked, AfterViewInit, computed
} from '@angular/core';
import { ChatStore } from '../../store/chat.store';
import { MessageBubble } from '../message-bubble/message-bubble';
import { AppointmentCardMessage } from '../appointment-card-message/appointment-card-message';
import { VideoInvitationMessage } from '../video-invitation-message/video-invitation-message';
import { TypingIndicator } from '../typing-indicator/typing-indicator';
import { Message } from '../../models/message.model';

interface DatedGroup {
  dateLabel: string;
  messages: Message[];
}

@Component({
  selector: 'chat-message-list',
  standalone: true,
  imports: [MessageBubble, AppointmentCardMessage, VideoInvitationMessage, TypingIndicator],
  templateUrl: './message-list.html',
  styleUrl: '../../chat.css',
  host: {
    class: 'flex-1 flex flex-col min-h-0 overflow-hidden'
  }
})
export class MessageList implements AfterViewChecked, AfterViewInit {
  readonly store = inject(ChatStore);
  private readonly elementRef = inject(ElementRef);

  @ViewChild('listEnd') listEnd!: ElementRef<HTMLDivElement>;

  private prevMessages: Message[] = [];
  private prevScrollHeight = 0;
  private prevScrollTop = 0;

  readonly messageGroups = computed<DatedGroup[]>(() => {
    const msgs = this.store.uiMessages();
    const groups: DatedGroup[] = [];
    let currentDate = '';

    for (const msg of msgs) {
      const label = this.getDateLabel(msg.createdAtUtc);
      if (label !== currentDate) {
        currentDate = label;
        groups.push({ dateLabel: label, messages: [] });
      }
      groups[groups.length - 1].messages.push(msg);
    }
    return groups;
  });

  private getScrollContainer(): HTMLDivElement | null {
    return this.elementRef.nativeElement.querySelector('.overflow-y-auto');
  }

  ngAfterViewInit() {
    const container = this.getScrollContainer();
    if (container) {
      container.addEventListener('scroll', () => {
        this.prevScrollTop = container.scrollTop;
        this.prevScrollHeight = container.scrollHeight;
      });
      this.prevScrollHeight = container.scrollHeight;
      this.prevScrollTop = container.scrollTop;
    }
  }

  ngAfterViewChecked() {
    const container = this.getScrollContainer();
    if (!container) return;

    const currentMessages = this.store.uiMessages();
    if (currentMessages.length === 0) {
      this.prevMessages = [];
      return;
    }

    const wasEmpty = this.prevMessages.length === 0;
    const addedCount = currentMessages.length - this.prevMessages.length;

    if (addedCount > 0) {
      const firstNewId = currentMessages[0]?.id;
      const firstOldId = this.prevMessages[0]?.id;
      const isPrepended = firstNewId !== firstOldId;

      if (isPrepended) {
        // Keep scroll position when older pages are loaded
        const newScrollTop = container.scrollHeight - this.prevScrollHeight + this.prevScrollTop;
        container.scrollTop = newScrollTop;
      } else {
        // Scroll to bottom when loading first time, sending a message, or receiving a new message while near bottom
        const lastMsg = currentMessages[currentMessages.length - 1];
        const isOwn = lastMsg?.isOwn;

        const threshold = 150;
        const isNearBottom = this.prevScrollHeight - this.prevScrollTop - container.clientHeight <= threshold;

        if (wasEmpty) {
          this.scrollToBottom('auto');
        } else if (isOwn || isNearBottom) {
          this.scrollToBottom('smooth');
        }
      }
    }

    this.prevMessages = [...currentMessages];
    this.prevScrollHeight = container.scrollHeight;
    this.prevScrollTop = container.scrollTop;
  }

  private scrollToBottom(behavior: ScrollBehavior = 'smooth') {
    const container = this.getScrollContainer();
    if (container) {
      try {
        container.scrollTo({
          top: container.scrollHeight,
          behavior
        });
      } catch {
        container.scrollTop = container.scrollHeight;
      }
    }
  }

  private getDateLabel(createdAtUtc: string): string {
    if (!createdAtUtc) {
      return '';
    }

    const d = new Date(createdAtUtc);
    if (isNaN(d.getTime())) {
      return '';
    }

    return this.formatDateLabel(d);
  }

  private formatDateLabel(d: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.floor((today.getTime() - msgDay.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  isTextMsg(msg: Message): boolean {
    return msg.payload.type === 'text';
  }

  isAppointmentMsg(msg: Message): boolean {
    return msg.payload.type === 'appointment';
  }

  isVideoMsg(msg: Message): boolean {
    return msg.payload.type === 'video_invitation';
  }

  trackById(_: number, item: { id: string }) {
    return item.id;
  }

  trackByLabel(_: number, group: DatedGroup) {
    return group.dateLabel || group.messages[0]?.id || 'pending';
  }
}
