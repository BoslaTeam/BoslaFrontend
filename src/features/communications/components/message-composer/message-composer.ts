import {
  Component, inject, ElementRef, ViewChild, HostListener, signal, DestroyRef, computed
} from '@angular/core';
import { ChatStore } from '../../store/chat.store';
import { ChatSignalrService } from '../../services/chat-signalr.service';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/enums/user-role.enum';
import { AiSmartReply } from '@features/ai/components/ai-smart-reply/ai-smart-reply';
import { EmojiPickerComponent } from '@shared/components/emoji-picker/emoji-picker.component';

@Component({
  selector: 'chat-message-composer',
  standalone: true,
  imports: [AiSmartReply, EmojiPickerComponent],
  templateUrl: './message-composer.html',
  styleUrl: '../../chat.css',
  host: {
    class: 'block shrink-0'
  }
})
export class MessageComposer {
  readonly store = inject(ChatStore);
  readonly signalr = inject(ChatSignalrService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('textarea') textareaRef!: ElementRef<HTMLTextAreaElement>;

  readonly message = signal('');
  private typingTimeout: ReturnType<typeof setTimeout> | null = null;
  private isCurrentlyTyping = false;

  /** True when the current user has the Specialist role → show AI smart reply button */
  readonly isSpecialist = computed(() =>
    this.authService.roles().includes(UserRole.Specialist)
  );

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
      this.textareaRef.nativeElement.value = '';
      this.textareaRef.nativeElement.style.height = 'auto';
      this.textareaRef.nativeElement.focus();
    }
  }

  /** Called when the user picks an AI suggestion chip */
  fillFromReply(text: string): void {
    this.message.set(text);
    this.handleTypingSignal(!!text);
    setTimeout(() => {
      this.autoResize();
      this.textareaRef?.nativeElement?.focus();
    });
  }

  /**
   * Insert the emoji at the current caret position inside the textarea,
   * then restore focus so the user can keep typing immediately.
   *
   * Strategy:
   *  1. Read selectionStart / selectionEnd from the live DOM element.
   *  2. Splice the emoji string into the correct position in the current text.
   *  3. Update both the signal (for Angular binding) and the DOM value
   *     so the textarea reflects the change without losing caret info.
   *  4. Programmatically restore the caret to right after the inserted emoji.
   *  5. Re-run autoResize in case the text wrapped to a new line.
   */
  insertEmoji(emoji: string): void {
    const el = this.textareaRef?.nativeElement;
    if (!el) return;

    const start = el.selectionStart ?? el.value.length;
    const end   = el.selectionEnd   ?? el.value.length;
    const current = this.message();

    const before = current.slice(0, start);
    const after  = current.slice(end);
    const next   = before + emoji + after;

    // Update signal (keeps Angular state in sync)
    this.message.set(next);

    // Update DOM value directly — needed because Angular's one-way binding
    // (via [value]="message()") only pushes on the next CD cycle, but we
    // need selectionStart to be set *synchronously* before focus is restored.
    el.value = next;

    // Place the caret right after the inserted emoji
    const newCaret = start + emoji.length;
    el.setSelectionRange(newCaret, newCaret);

    // Return focus to the textarea so the user can keep typing
    el.focus();

    this.autoResize();
    this.handleTypingSignal(!!next);
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
