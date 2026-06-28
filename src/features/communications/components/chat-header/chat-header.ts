import { Component, inject, computed } from '@angular/core';
import { ChatStore } from '../../store/chat.store';

@Component({
  selector: 'chat-chat-header',
  standalone: true,
  imports: [],
  templateUrl: './chat-header.html',
  styleUrl: '../../chat.css',
  host: {
    class: 'block shrink-0'
  }
})
export class ChatHeader {
  readonly store = inject(ChatStore);

  readonly participant = computed(() => this.store.activeConversation()?.participant ?? null);

  readonly initials = computed(() => {
    const name = this.participant()?.name ?? '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  readonly statusText = computed(() => {
    const p = this.participant();
    if (!p) return '';
    if (p.isOnline) return 'Online';
    if (p.lastSeenAt) {
      const d = new Date(p.lastSeenAt);
      const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
      if (diffMin < 60) return `Last seen ${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `Last seen ${diffHr}h ago`;
      return `Last seen ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return 'Offline';
  });

  readonly roleBadgeClass = computed(() => {
    const role = this.participant()?.role;
    const map: Record<string, string> = {
      specialist: 'bg-bosla-primary/10 text-bosla-primary border border-bosla-primary/15',
      consultant: 'bg-bosla-blue/10 text-bosla-blue border border-bosla-blue/15',
      business: 'bg-bosla-orange/10 text-bosla-orange border border-bosla-orange/20',
      user: 'bg-bosla-grey/15 text-bosla-charcoal/70 border border-bosla-grey/20',
    };
    return map[role ?? ''] ?? 'bg-bosla-grey/15 text-bosla-charcoal/70 border border-bosla-grey/20';
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

  goBack() {
    this.store.goBackToList();
  }

  toggleContext() {
    this.store.toggleContextPanel();
  }
}
