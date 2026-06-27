import {
  Component, inject, ElementRef, ViewChild, HostListener, signal, DestroyRef
} from '@angular/core';
import { ChatStore } from '../../store/chat.store';
import { ChatSignalrService } from '../../services/chat-signalr.service';

@Component({
  selector: 'chat-message-composer',
  standalone: true,
  imports: [],
  templateUrl: './message-composer.html',
  styleUrl: '../../chat.css',
  host: {
    class: 'block shrink-0'
  }
})
export class MessageComposer {
  readonly store = inject(ChatStore);
  readonly signalr = inject(ChatSignalrService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('textarea') textareaRef!: ElementRef<HTMLTextAreaElement>;

  readonly message = signal('');
  private typingTimeout: ReturnType<typeof setTimeout> | null = null;
  private isCurrentlyTyping = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
      this.stopTypingSignal();
    });
  }

  onInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.message.set(value);
    this.autoResize();
    this.handleTypingSignal(!!value);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  send() {
    const text = this.message().trim();
    if (!text || this.store.isSendingMessage()) return;

    this.store.sendMessage(text);
    this.message.set('');
    this.stopTypingSignal();

    if (this.textareaRef?.nativeElement) {
      this.textareaRef.nativeElement.style.height = 'auto';
      this.textareaRef.nativeElement.focus();
    }
  }

  private autoResize() {
    const el = this.textareaRef?.nativeElement;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }

  private handleTypingSignal(isTyping: boolean) {
    const convId = this.store.activeConversationId();
    if (!convId) return;

    if (isTyping && !this.isCurrentlyTyping) {
      this.isCurrentlyTyping = true;
      this.signalr.sendTyping(convId);
    }

    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    if (isTyping) {
      this.typingTimeout = setTimeout(() => this.stopTypingSignal(), 2000);
    } else {
      this.stopTypingSignal();
    }
  }

  private stopTypingSignal() {
    if (!this.isCurrentlyTyping) return;
    this.isCurrentlyTyping = false;
    const convId = this.store.activeConversationId();
    if (convId) this.signalr.stopTyping(convId);
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
  }
}
