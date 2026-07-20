import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  OnInit,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { SpecialistAiService } from '@features/ai/services/specialist-ai.service';
import { SessionPrepDto } from '@features/ai/contracts/specialist-ai.contracts';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
@Component({
  selector: 'session-prep-panel',
  standalone: true,
  imports: [DatePipe, TranslatePipe],
  templateUrl: './session-prep-panel.html',
  styleUrl: './session-prep-panel.css',
})
export class SessionPrepPanel implements OnInit {
  /** The appointment ID to load session prep for */
  appointmentId = input.required<string>();

  /** Emitted when the specialist clicks "دخول الجلسة" */
  enterSession = output<void>();

  /** Emitted when the specialist clicks "رجوع" */
  back = output<void>();

  private readonly specialistAi = inject(SpecialistAiService);
  private readonly translationService = inject(TranslationService);

  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');
  readonly sessionPrep = signal<SessionPrepDto | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly showPastAppointments = signal(false);

  ngOnInit(): void {
    this.loadPrep();
  }

  loadPrep(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.sessionPrep.set(null);

    this.specialistAi.getSessionPrep(this.appointmentId()).subscribe({
      next: (dto) => {
        this.sessionPrep.set(dto);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  togglePastAppointments(): void {
    this.showPastAppointments.update((v) => !v);
  }

  onEnterSession(): void {
    this.enterSession.emit();
  }

  onBack(): void {
    this.back.emit();
  }
}
