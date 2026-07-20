import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ChatStore } from '../../store/chat.store';
import { PresenceStore } from '../../store/presence.store';
import { UpcomingSessionCard } from '../upcoming-session-card/upcoming-session-card';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'chat-left-sidebar',
  standalone: true,
  imports: [UpcomingSessionCard, TranslatePipe],
  templateUrl: './left-sidebar.html',
  styleUrl: '../../chat.css',
  host: {
    class: 'block h-full min-h-0'
  }
})
export class LeftSidebar {
  readonly store = inject(ChatStore);
  private readonly presenceStore = inject(PresenceStore);
  private readonly router = inject(Router);

  readonly participant = computed(() => this.store.activeConversation()?.participant ?? null);
  readonly appointmentId = computed(() => this.store.activeConversation()?.appointmentId ?? null);

  // Single source of truth — reads from PresenceStore signal, same as ChatHeader.
  // Automatically updates whenever PresenceChanged or OnlineUsersSnapshot is received.
  readonly isOnline = computed(() => {
    const p = this.participant();
    return p ? this.presenceStore.isOnline(p.id) : false;
  });

  readonly initials = computed(() => {
    const name = this.participant()?.name ?? '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  openProfile() {
    const p = this.participant();
    if (p?.id) {
      this.router.navigate(['/specialists', p.id]);
    }
  }
}
