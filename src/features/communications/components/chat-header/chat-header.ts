import { Component, inject, computed, input, output } from '@angular/core';
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

  readonly isOpen = input(false);
  readonly togglePanel = output<void>();

  readonly participant = computed(() => this.store.activeConversation()?.participant ?? null);

  readonly initials = computed(() => {
    const name = this.participant()?.name ?? '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  goBack() {
    this.store.goBackToList();
  }

  onTogglePanel() {
    this.togglePanel.emit();
  }
}
