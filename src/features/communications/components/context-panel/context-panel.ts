import { Component, inject, computed } from '@angular/core';
import { ChatStore } from '../../store/chat.store';
import { UpcomingSessionCard } from '../upcoming-session-card/upcoming-session-card';

@Component({
  selector: 'chat-context-panel',
  standalone: true,
  imports: [UpcomingSessionCard],
  templateUrl: './context-panel.html',
  styleUrl: '../../chat.css',
  host: {
    class: 'block h-full min-h-0'
  }
})
export class ContextPanel {
  readonly store = inject(ChatStore);

  readonly participant = computed(() => this.store.activeConversation()?.participant ?? null);
  readonly appointmentId = computed(() => this.store.activeConversation()?.appointmentId ?? null);

  readonly initials = computed(() => {
    const name = this.participant()?.name ?? '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  readonly roleBadgeClass = computed(() => {
    const role = this.participant()?.role;
    const map: Record<string, string> = {
      specialist: 'chat-role-specialist',
      consultant: 'chat-role-consultant',
      business: 'chat-role-business',
      user: 'chat-role-user',
    };
    return map[role ?? ''] ?? 'chat-role-user';
  });

  readonly roleLabel = computed(() => {
    const role = this.participant()?.role;
    const map: Record<string, string> = {
      specialist: 'Specialist',
      consultant: 'Consultant',
      business: 'Business',
      user: 'User',
    };
    return map[role ?? ''] ?? 'User';
  });

  readonly stars = computed(() => {
    const rating = this.participant()?.rating ?? 0;
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating) ? 'full' : 'empty');
  });
}
