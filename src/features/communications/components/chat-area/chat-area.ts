import { Component, inject, input, output } from '@angular/core';
import { ChatStore } from '../../store/chat.store';
import { ChatHeader } from '../chat-header/chat-header';
import { MessageList } from '../message-list/message-list';
import { MessageComposer } from '../message-composer/message-composer';

@Component({
  selector: 'chat-chat-area',
  standalone: true,
  imports: [ChatHeader, MessageList, MessageComposer],
  templateUrl: './chat-area.html',
  styleUrl: '../../chat.css',
  host: {
    class: 'flex flex-col h-full min-h-0 overflow-hidden'
  }
})
export class ChatArea {
  readonly store = inject(ChatStore);

  readonly isConversationListOpen = input(false);
  readonly toggleConversationList = output<void>();

  readonly isDetailsOpen = input(false);
  readonly toggleDetailsPanel = output<void>();
}
