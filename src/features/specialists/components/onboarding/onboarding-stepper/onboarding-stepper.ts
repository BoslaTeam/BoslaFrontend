import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'onboarding-stepper',
  standalone: true,
  templateUrl: './onboarding-stepper.html',
})
export class OnboardingStepper {
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
      title: this.titles()[i] || `خطوة ${i + 1}`,
      icon: this.icons()[i] || '',
    }))
  );
}
