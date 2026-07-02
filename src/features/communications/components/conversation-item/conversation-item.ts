import { Component, input, output, computed, inject } from '@angular/core';
import { ConversationPreview } from '../../models/conversation.model';
import { PresenceStore } from '../../store/presence.store';

@Component({
  selector: 'chat-conversation-item',
  standalone: true,
  imports: [],
  templateUrl: './conversation-item.html',
  styleUrl: '../../chat.css',
})
export class ConversationItem {
  private readonly presenceStore = inject(PresenceStore);

  readonly conversation = input.required<ConversationPreview>();
  readonly isActive = input(false);
  readonly selected = output<string>();

  readonly isOnline = computed(() =>
    this.presenceStore.isOnline(this.conversation().participant.id)
  );

  readonly initials = computed(() => {
    const name = this.conversation().participant.name;
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  readonly roleBadgeClass = computed(() => {
    const role = this.conversation().participant.role;
    const map: Record<string, string> = {
      specialist: 'bg-bosla-primary/10 text-bosla-primary border border-bosla-primary/15',
      consultant: 'bg-bosla-blue/10 text-bosla-blue border border-bosla-blue/15',
      business: 'bg-bosla-orange/10 text-bosla-orange border border-bosla-orange/20',
      user: 'bg-bosla-grey/15 text-bosla-charcoal/70 border border-bosla-grey/20',
    };
    return map[role] ?? 'bg-bosla-grey/15 text-bosla-charcoal/70 border border-bosla-grey/20';
  });

  readonly roleLabel = computed(() => {
    const role = this.conversation().participant.role;
    const map: Record<string, string> = {
      specialist: 'Specialist',
      consultant: 'Consultant',
      business: 'Business',
      user: 'User',
    };
    return map[role] ?? role;
  });

  readonly formattedTime = computed(() => {
    const lastMessageAt = this.conversation().lastMessageAt;
    if (!lastMessageAt) return '';

    const d = new Date(lastMessageAt);
    if (isNaN(d.getTime())) return '';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  onClick() {
    this.selected.emit(this.conversation().id);
  }
}
