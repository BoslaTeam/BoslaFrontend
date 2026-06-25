import { Component, inject, computed } from '@angular/core';
import { ChatStore } from '../../store/chat.store';
import { ConversationSearch } from '../conversation-search/conversation-search';
import { ConversationFilters } from '../conversation-filters/conversation-filters';
import { ConversationItem } from '../conversation-item/conversation-item';
import { ChatFilter } from '../../models/conversation.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'chat-conversation-sidebar',
  standalone: true,
  imports: [ConversationSearch, ConversationFilters, ConversationItem, RouterLink],
  templateUrl: './conversation-sidebar.html',
  styleUrl: '../../chat.css',
  host: {
    class: 'block h-full min-h-0'
  }
})
export class ConversationSidebar {
  readonly store = inject(ChatStore);

  onSearch(query: string) {
    this.store.setSearchQuery(query);
  }

  onFilterChange(filter: ChatFilter) {
    this.store.setFilter(filter);
  }

  onSelectConversation(id: string) {
    this.store.selectConversation(id);
  }

  trackById(_: number, item: { id: string }) {
    return item.id;
  }
}
