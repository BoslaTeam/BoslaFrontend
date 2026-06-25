import { Component, inject } from '@angular/core';
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
    class: 'block h-full min-h-0'
  }
})
export class ChatArea {
  readonly store = inject(ChatStore);
}
