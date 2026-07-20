import { Component, inject } from '@angular/core';
import { ChatStore } from '../../store/chat.store';
import { ConversationSearch } from '../conversation-search/conversation-search';
import { ConversationItem } from '../conversation-item/conversation-item';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'chat-conversation-sidebar',
  standalone: true,
  imports: [ConversationSearch, ConversationItem, RouterLink, TranslatePipe],
  templateUrl: './conversation-sidebar.html',
  styleUrl: '../../chat.css',
  host: {
    class: 'flex flex-col h-full min-h-0'
  }
})
export class ConversationSidebar {
  readonly store = inject(ChatStore);

  onSearch(query: string) {
    this.store.setSearchQuery(query);
  }

  onSelectConversation(id: string) {
    this.store.selectConversation(id);
  }

  trackById(_: number, item: { id: string }) {
    return item.id;
  }
}
