import { Component, input, computed } from '@angular/core';
import { Message, AppointmentData } from '../../models/message.model';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'chat-appointment-card-message',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './appointment-card-message.html',
  styleUrl: '../../chat.css',
})
export class AppointmentCardMessage {
  readonly message = input.required<Message>();

  readonly appointment = computed<AppointmentData | null>(() => {
    const p = this.message().payload;
    return p.type === 'appointment' ? p.appointment : null;
  });

  readonly formattedDate = computed(() => {
    const apt = this.appointment();
    if (!apt) return '';
    return new Date(apt.date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  });

  readonly statusLabel = computed(() => {
    const map: Record<string, string> = {
      confirmed: 'Confirmed',
      pending: 'Pending',
      cancelled: 'Cancelled',
      completed: 'Completed',
    };
    return map[this.appointment()?.status ?? ''] ?? 'Unknown';
  });

  readonly statusClass = computed(() => {
    const map: Record<string, string> = {
      confirmed: 'chat-apt-status-confirmed',
      pending: 'chat-apt-status-pending',
      cancelled: 'chat-apt-status-cancelled',
      completed: 'chat-apt-status-completed',
    };
    return map[this.appointment()?.status ?? ''] ?? 'chat-apt-status-pending';
  });

  readonly sessionTypeLabel = computed(() => {
    const map: Record<string, string> = {
      online: 'Online',
      'in-person': 'In Person',
      phone: 'Phone Call',
    };
    return map[this.appointment()?.sessionType ?? ''] ?? 'Online';
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
}
