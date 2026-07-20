import {
  Component,
  inject,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { SpecialistAiService } from '@features/ai/services/specialist-ai.service';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/enums/user-role.enum';

@Component({
  selector: 'ai-smart-reply',
  standalone: true,
  templateUrl: './ai-smart-reply.html',
  host: {
    style: 'display: contents;'
  }
})
export class AiSmartReply {
  /** The active conversation ID */
  conversationId = input.required<string>();

  /** Emitted when the user selects one of the AI suggestions */
  replySelected = output<string>();

  private readonly specialistAi = inject(SpecialistAiService);
  private readonly authService = inject(AuthService);

  readonly isSpecialist = computed(() =>
    this.authService.currentUser()?.roles?.includes(UserRole.Specialist) ?? false
  );

  readonly suggestions = signal<string[]>([]);
  readonly isLoading = signal(false);
  readonly isVisible = signal(false);
  readonly hasError = signal(false);

  toggleSuggestions(): void {
    if (this.isVisible()) {
      this.isVisible.set(false);
      return;
    }

    // Show existing suggestions if already loaded
    if (this.suggestions().length > 0) {
      this.isVisible.set(true);
      return;
    }

    this.loadSuggestions();
  }

  loadSuggestions(): void {
    const convId = this.conversationId();
    if (!convId) return;

    this.isLoading.set(true);
    this.hasError.set(false);
    this.isVisible.set(true);
    this.suggestions.set([]);

    this.specialistAi.getSmartReplies(convId).subscribe({
      next: (res) => {
        this.suggestions.set(res.replies ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
        this.isVisible.set(false);
      },
    });
  }

  selectReply(reply: string): void {
    this.replySelected.emit(reply);
    this.isVisible.set(false);
    this.suggestions.set([]);
  }

  dismiss(): void {
    this.isVisible.set(false);
  }
}
