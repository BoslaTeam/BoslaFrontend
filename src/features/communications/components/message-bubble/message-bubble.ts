import { Component, input, computed } from '@angular/core';
import { Message } from '../../models/message.model';

@Component({
  selector: 'chat-message-bubble',
  standalone: true,
  imports: [],
  templateUrl: './message-bubble.html',
  styleUrl: '../../chat.css',
})
export class MessageBubble {
  readonly message = input.required<Message>();
  readonly showAvatar = input(true);

  readonly initials = computed(() => {
    // For incoming messages, derive from conversationId (in real app, from participant name)
    return 'SP';
  });

  readonly formattedTime = computed(() => {
    const utc = this.message().createdAtUtc;
    if (!utc) return '';
    const d = new Date(utc);
    if (isNaN(d.getTime())) return '';
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return this.message().isEdited ? `${timeStr} Edited` : timeStr;
  });

  readonly content = computed(() => {
    const p = this.message().payload;
    return p.type === 'text' ? p.content : '';
  });

  readonly statusIcon = computed(() => {
    switch (this.message().status) {
      case 'sending': return 'clock';
      case 'delivered': return 'check';
      case 'read': return 'double-check';
      default: return 'check';
    }
  });
}
