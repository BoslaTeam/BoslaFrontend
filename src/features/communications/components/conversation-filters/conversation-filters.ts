import { Component, input, output } from '@angular/core';
import { ChatFilter } from '../../models/conversation.model';

@Component({
  selector: 'chat-conversation-filters',
  standalone: true,
  imports: [],
  template: `
    <div class="flex gap-1.5 mt-3" role="tablist" aria-label="Conversation filters">
      <button
        id="filter-all"
        role="tab"
        [class]="activeFilter() === 'all'
          ? 'px-4 py-1.5 rounded-full text-xs font-semibold font-inter transition-all cursor-pointer bg-bosla-primary/10 border border-bosla-primary/20 text-bosla-primary'
          : 'px-4 py-1.5 rounded-full text-xs font-semibold font-inter transition-all cursor-pointer text-bosla-grey/90 hover:bg-bosla-primary/5 hover:text-bosla-primary border border-transparent'"
        [attr.aria-selected]="activeFilter() === 'all'"
        (click)="filterChange.emit('all')"
      >
        All
      </button>
      <button
        id="filter-unread"
        role="tab"
        [class]="activeFilter() === 'unread'
          ? 'px-4 py-1.5 rounded-full text-xs font-semibold font-inter transition-all cursor-pointer bg-bosla-primary/10 border border-bosla-primary/20 text-bosla-primary flex items-center gap-1.5'
          : 'px-4 py-1.5 rounded-full text-xs font-semibold font-inter transition-all cursor-pointer text-bosla-grey/90 hover:bg-bosla-primary/5 hover:text-bosla-primary border border-transparent flex items-center gap-1.5'"
        [attr.aria-selected]="activeFilter() === 'unread'"
        (click)="filterChange.emit('unread')"
      >
        Unread
        @if (unreadTotal() > 0) {
          <span class="min-w-[1.25rem] h-5 rounded-full bg-bosla-orange text-white text-[10px] font-bold flex items-center justify-center px-1.5">{{ unreadTotal() > 99 ? '99+' : unreadTotal() }}</span>
        }
      </button>
    </div>
  `,
  styleUrl: '../../chat.css',
})
export class ConversationFilters {
  readonly activeFilter = input<ChatFilter>('all');
  readonly unreadTotal = input(0);
  readonly filterChange = output<ChatFilter>();
}
