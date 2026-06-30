import {
  Component, inject, OnInit, OnDestroy, HostListener, effect, signal, untracked
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatStore } from '../../store/chat.store';
import { ChatSignalrService } from '../../services/chat-signalr.service';
import { LeftSidebar } from '../../components/left-sidebar/left-sidebar';
import { ChatArea } from '../../components/chat-area/chat-area';
import { ConversationSidebar } from '../../components/conversation-sidebar/conversation-sidebar';

@Component({
  selector: 'app-messaging-page',
  standalone: true,
  imports: [LeftSidebar, ChatArea, ConversationSidebar],
  templateUrl: './messaging-page.html',
  styleUrl: './messaging-page.css',
})
export class MessagingPage implements OnInit, OnDestroy {
  readonly store = inject(ChatStore);
  readonly signalrService = inject(ChatSignalrService);
  private readonly route = inject(ActivatedRoute);

  private readonly conversationId = this.route.snapshot.paramMap.get('id');
  private routeConversationOpened = false;

  readonly showConversationSidebar = signal(true);

  constructor() {
    effect(() => {
      const id = this.conversationId;
      if (!id || this.routeConversationOpened) return;
      if (this.store.isLoadingConversations()) return;

      this.store.selectConversation(id);
      this.routeConversationOpened = true;
    });

    this.showConversationSidebar.set(window.innerWidth >= 768);
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

  toggleConversationSidebar() {
    this.showConversationSidebar.update(v => !v);
  }

  private checkViewport() {
    this.store.isMobileView.set(window.innerWidth < 768);
  }
}
