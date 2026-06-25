import {
  Component, inject, OnInit, OnDestroy, HostListener
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatStore } from '../../store/chat.store';
import { ChatSignalrService } from '../../services/chat-signalr.service';

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

  // Route param: /chat/:id → auto-open that conversation
  private readonly conversationId = this.route.snapshot.paramMap.get('id');

  ngOnInit(): void {
    // Connect to SignalR hub
    this.store.connectSignalR();

    // Load conversation list
    this.store.loadConversations();

    // If a conversation ID is in the URL, auto-open it after loading
    if (this.conversationId) {
      setTimeout(() => {
        this.store.selectConversation(this.conversationId!);
      }, 900);
    }

    // Detect viewport size for responsive layout
    this.checkViewport();
  }

  ngOnDestroy(): void {
    // Clean up connections and leave active conversation group
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

// Re-import imports needed for template
import { ConversationSidebar } from '../../components/conversation-sidebar/conversation-sidebar';
import { ChatArea } from '../../components/chat-area/chat-area';
import { ContextPanel } from '../../components/context-panel/context-panel';
