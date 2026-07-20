import { Component, input, computed } from '@angular/core';
import { Message, VideoSessionData } from '../../models/message.model';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'chat-video-invitation-message',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './video-invitation-message.html',
  styleUrl: '../../chat.css',
})
export class VideoInvitationMessage {
  readonly message = input.required<Message>();

  readonly session = computed<VideoSessionData | null>(() => {
    const p = this.message().payload;
    return p.type === 'video_invitation' ? p.session : null;
  });

  readonly formattedDate = computed(() => {
    const s = this.session();
    if (!s) return '';
    return new Date(s.date).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric'
    });
  });

  readonly formattedTime = computed(() => {
    const utc = this.message().createdAtUtc;
    if (!utc) return '';
    const d = new Date(utc);
    if (isNaN(d.getTime())) return '';
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return this.message().isEdited ? `${timeStr} Edited` : timeStr;
  });

  readonly initials = computed(() => {
    const name = this.message().senderName;
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  onJoin() {
    const url = this.session()?.joinUrl;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }
}
