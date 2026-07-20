import { Component, effect, inject, output, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpecialistOnboardingStore } from '../../../store/specialist-onboarding.store';
import { UiButton } from '@shared/ui/button/button';
import { UiInput } from '@shared/ui/input/input';
import { UiTextarea } from '@shared/ui/textarea/textarea';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
function calcLevel(years: number): number {
  if (years <= 2) return 0;
  if (years <= 5) return 1;
  if (years <= 9) return 2;
  return 3;
}

const LEVEL_KEYS = ['onboarding.basicInfo.levelBeginner', 'onboarding.basicInfo.levelIntermediate', 'onboarding.basicInfo.levelAdvanced', 'onboarding.basicInfo.levelExpert'];

@Component({
  selector: 'basic-info-step',
  standalone: true,
  imports: [ReactiveFormsModule, UiButton, UiInput, UiTextarea, TranslatePipe],
  templateUrl: './basic-info-step.html',
})
export class BasicInfoStep {
  private readonly fb = inject(FormBuilder);
  private readonly onboardingStore = inject(SpecialistOnboardingStore);
  private readonly translationService = inject(TranslationService);

  readonly completed = output<void>();
  readonly back = output<void>();

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly experienceLevel = signal(0);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    experienceYears: [0, [Validators.required, Validators.min(0)]],
    hourlyRate: [0, [Validators.required, Validators.min(1)]],
    bookingPolicy: ['', Validators.required],
  });

  readonly levelLabel = computed(() => this.translationService.translate(LEVEL_KEYS[this.experienceLevel()]));

  constructor() {
    effect(() => {
      const saved = this.onboardingStore.draft().basicInfo;
      if (saved && !this.form.dirty) {
        this.form.patchValue({
          title: saved.title ?? '',
          experienceYears: saved.experienceYears,
          hourlyRate: saved.hourlyRate,
          bookingPolicy: saved.bookingPolicy,
        });
        this.experienceLevel.set(calcLevel(saved.experienceYears));
      }
    });

    this.form.get('experienceYears')!.valueChanges.subscribe(v => {
      this.experienceLevel.set(calcLevel(v ?? 0));
    });
  }

  private buildRequest() {
    const raw = this.form.getRawValue();
    return {
      title: raw.title,
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

    this.onboardingStore.updateProfile(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.completed.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          (err.error ?? err)?.title ?? this.translationService.translate('onboarding.basicInfo.error')
        );
      },
    });
  }
}
