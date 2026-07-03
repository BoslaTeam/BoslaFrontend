import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Message } from '../../models/message.model';
import { ChatStore } from '../../store/chat.store';

@Component({
  selector: 'chat-message-bubble',
  standalone: true,
  imports: [],
  templateUrl: './message-bubble.html',
  styleUrl: '../../chat.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full'
  }
})
export class MessageBubble {
  private readonly store = inject(ChatStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly message = input.required<Message>();
  readonly showAvatar = input(true);
  readonly isMenuOpen = signal(false);
  readonly isEditing = signal(false);
  readonly editText = signal('');
  readonly showDeleteConfirm = signal(false);

  readonly initials = computed(() => {
    const name = this.message().senderName;
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  readonly formattedTime = computed(() => {
    const utc = this.message().createdAtUtc;
    if (!utc) return '';
    const d = new Date(utc);
    if (isNaN(d.getTime())) return '';
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return this.message().isEdited && !this.message().isDeleted ? `${timeStr} (edited)` : timeStr;
  });

  readonly content = computed(() => {
    const p = this.message().payload;
    return p.type === 'text' ? p.content : '';
  });

  readonly canManage = computed(() => this.message().isOwn && !this.message().isDeleted && this.message().status !== 'sending');
  readonly isSaving = computed(() => this.store.isEditingMessage(this.message().id));
  readonly isDeleting = computed(() => this.store.isDeletingMessage(this.message().id));
  readonly isSaveDisabled = computed(() => !this.editText().trim() || this.isSaving() || this.isDeleting());

  readonly statusIcon = computed(() => {
    switch (this.message().status) {
      case 'sending': return 'clock';
      case 'delivered': return 'check';
      case 'read': return 'double-check';
      default: return 'check';
    }
  });

  toggleMenu(): void {
    if (!this.canManage() || this.isSaving() || this.isDeleting()) return;
    this.isMenuOpen.update(open => !open);
  }

  startEdit(): void {
    if (!this.canManage()) return;
    this.editText.set(this.content());
    this.isEditing.set(true);
    this.isMenuOpen.set(false);
  }

  cancelEdit(): void {
    if (this.isSaving()) return;
    this.editText.set('');
    this.isEditing.set(false);
  }

  onEditInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.editText.set(target.value);
  }

  saveEdit(): void {
    const cleanText = this.editText().trim();
    if (!cleanText || this.isSaving()) return;

    this.store.editMessage(this.message().id, cleanText)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((success) => {
        if (success) {
          this.editText.set('');
          this.isEditing.set(false);
        }
      });
  }

  openDeleteConfirm(): void {
    if (!this.canManage()) return;
    this.showDeleteConfirm.set(true);
    this.isMenuOpen.set(false);
  }

  closeDeleteConfirm(): void {
    if (this.isDeleting()) return;
    this.showDeleteConfirm.set(false);
  }

  confirmDelete(): void {
    if (this.isDeleting()) return;

    this.store.deleteMessage(this.message().id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((success) => {
        if (success) {
          this.showDeleteConfirm.set(false);
          this.isEditing.set(false);
          this.editText.set('');
        }
      });
  }
}
