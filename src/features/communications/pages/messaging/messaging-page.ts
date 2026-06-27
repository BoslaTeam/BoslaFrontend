import {
  Component, inject, OnInit, OnDestroy, HostListener, effect
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatStore } from '../../store/chat.store';
import { ChatSignalrService } from '../../services/chat-signalr.service';
import { ConversationSidebar } from '../../components/conversation-sidebar/conversation-sidebar';
import { ChatArea } from '../../components/chat-area/chat-area';
import { ContextPanel } from '../../components/context-panel/context-panel';

@Component({
  selector: 'app-messaging-page',
  standalone: true,
  imports: [ConversationSidebar, ChatArea, ContextPanel],
  templateUrl: './messaging-page.html',
  styleUrl: './messaging-page.css',
})
export class MessagingPage implements OnInit, OnDestroy {
  readonly store = inject(ChatStore);
  readonly signalrService = inject(ChatSignalrService);
  private readonly route = inject(ActivatedRoute);

  private readonly conversationId = this.route.snapshot.paramMap.get('id');
  private routeConversationOpened = false;

  constructor() {
    effect(() => {
      const id = this.conversationId;
      if (!id || this.routeConversationOpened) return;
      if (this.store.isLoadingConversations()) return;

      this.store.selectConversation(id);
      this.routeConversationOpened = true;
    });
  }

  ngOnInit(): void {
    this.store.connectSignalR();
    this.store.loadConversations();
    this.checkViewport();
  }

  ngOnDestroy(): void {
    const activeId = this.store.activeConversationId();
    if (activeId) {
      this.store.leaveConversation(activeId);
    }
    this.store.disconnectSignalR();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkViewport();
  }

  private checkViewport() {
    this.store.isMobileView.set(window.innerWidth < 768);
  }
}
