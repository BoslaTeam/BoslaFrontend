import { Component, input, computed, inject } from '@angular/core';
import { TranslationService } from '@core/services/translation.service';

@Component({
  selector: 'onboarding-stepper',
  standalone: true,
  templateUrl: './onboarding-stepper.html',
})
export class OnboardingStepper {
  private readonly translationService = inject(TranslationService);

  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');

  readonly currentStep = input.required<number>();
  readonly totalSteps = input.required<number>();
  readonly titles = input<string[]>([]);
  readonly icons = input<string[]>([]);

  readonly progressPercent = computed(() =>
    ((this.currentStep() + 1) / this.totalSteps()) * 100
  );

  readonly steps = computed(() =>
    Array.from({ length: this.totalSteps() }, (_, i) => ({
      index: i,
      isActive: i === this.currentStep(),
      isCompleted: i < this.currentStep(),
      isPending: i > this.currentStep(),
      title: this.titles()[i] || `${this.translationService.translate('onboarding.step.singular')} ${i + 1}`,
      icon: this.icons()[i] || '',
    }))
  );
}
