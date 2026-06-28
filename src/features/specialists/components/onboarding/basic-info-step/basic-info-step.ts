import { Component, inject, output, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpecialistOnboardingStore } from '../../../store/specialist-onboarding.store';
import { AuthService } from '@core/services/auth.service';
import { OnboardSpecialistResponse } from '../../../contracts/specialist-onboard.contract';
import { UiButton } from '@shared/ui/button/button';
import { UiInput } from '@shared/ui/input/input';
import { UiTextarea } from '@shared/ui/textarea/textarea';

function calcLevel(years: number): number {
  if (years <= 2) return 0;
  if (years <= 5) return 1;
  if (years <= 9) return 2;
  return 3;
}

const LEVEL_LABELS = ['مبتدئ', 'متوسط', 'متقدم', 'خبير'];

@Component({
  selector: 'basic-info-step',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    UiButton,
    UiInput,
    UiTextarea,
  ],
  templateUrl: './basic-info-step.html',
})
export class BasicInfoStep {
  private readonly fb = inject(FormBuilder);
  private readonly onboardingStore = inject(SpecialistOnboardingStore);
  private readonly authService = inject(AuthService);

  readonly completed = output<void>();
  readonly back = output<void>();

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly experienceLevel = signal(0);

  readonly form = this.fb.nonNullable.group({
    experienceYears: [0, [Validators.required, Validators.min(0)]],
    hourlyRate: [0, [Validators.required, Validators.min(1)]],
    bookingPolicy: ['', Validators.required],
  });

  readonly levelLabel = computed(() => LEVEL_LABELS[this.experienceLevel()]);

  constructor() {
    this.form.get('experienceYears')!.valueChanges.subscribe(v => {
      this.experienceLevel.set(calcLevel(v ?? 0));
    });
  }

  private buildRequest() {
    const raw = this.form.getRawValue();
    return {
      experienceYears: raw.experienceYears,
      experienceLevel: this.experienceLevel(),
      hourlyRate: raw.hourlyRate,
      bookingPolicy: raw.bookingPolicy,
    };
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const payload = this.buildRequest();
    this.onboardingStore.updateBasicInfo(payload);
    this.onboardingStore.onboard().subscribe({
      next: (response: OnboardSpecialistResponse) => {
        this.authService.setSession(response.token.accessToken, response.token.refreshToken);

        this.onboardingStore.initDraft().subscribe({
          next: () => {
            this.isLoading.set(false);
            this.completed.emit();
          },
          error: () => {
            this.isLoading.set(false);
            this.completed.emit();
          },
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.title ?? 'حدث خطأ أثناء الانضمام. يرجى المحاولة مرة أخرى.'
        );
      },
    });
  }
}
