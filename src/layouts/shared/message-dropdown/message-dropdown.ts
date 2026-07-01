import { Component, inject, input, output, HostListener, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConversationService } from '@features/communications/services/conversation.service';
import { ConversationDto } from '@features/communications/models/chat.model';
import { NavigationService } from '@core/navigation/navigation.service';

@Component({
  selector: 'app-message-dropdown',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './message-dropdown.html',
  styleUrl: './message-dropdown.css',
})
export class MessageDropdown implements OnInit {
  readonly isOpen = input(false);
  readonly close = output<void>();

  private conversationService = inject(ConversationService);
  private navigationService = inject(NavigationService);

  conversations: ConversationDto[] = [];
  readonly chatRoute = this.navigationService.chatRoute;

  ngOnInit() {
    this.conversationService.getConversations(1, 5).subscribe({
      next: (res) => {
        this.conversations = res.data?.items ?? [];
      },
    });
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('app-message-dropdown') && !target.closest('[data-msg-toggle]')) {
      this.close.emit();
    }
  }

  getOtherName(conv: ConversationDto): string {
    return conv.participants?.[0]?.fullName ?? 'محادثة';
  }

  getOtherAvatar(conv: ConversationDto): string | null {
    return conv.participants?.[0]?.profilePictureUrl ?? null;
  }
}
