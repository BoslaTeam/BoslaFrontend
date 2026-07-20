import { Component, effect, inject, output, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpecialistOnboardingStore } from '../../../store/specialist-onboarding.store';
import { ExperienceRequest } from '../../../contracts/specialist-experience.contract';
import { UiButton } from '@shared/ui/button/button';
import { UiInput } from '@shared/ui/input/input';
import { UiTextarea } from '@shared/ui/textarea/textarea';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
@Component({
  selector: 'experience-step',
  standalone: true,
  imports: [ReactiveFormsModule, UiButton, UiInput, UiTextarea, TranslatePipe],
  templateUrl: './experience-step.html',
})
export class ExperienceStep {
  private readonly fb = inject(FormBuilder);
  private readonly onboardingStore = inject(SpecialistOnboardingStore);
  private readonly translationService = inject(TranslationService);

  readonly completed = output<void>();
  readonly back = output<void>();

  readonly isSaving = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    experiences: this.fb.array<ReturnType<typeof this.createExperience>>([]),
  });

  get experiences(): FormArray {
    return this.form.get('experiences') as FormArray;
  }

  constructor() {
    effect(() => {
      const savedExperiences = this.onboardingStore.draft().experiences;
      if (savedExperiences.length > 0 && this.experiences.length === 0) {
        savedExperiences.forEach(exp => {
          this.experiences.push(this.createExperience(exp));
        });
        this.isCurrent.set(savedExperiences.map(e => !e.toDate));
      }
    });
  }

  readonly isCurrent = signal<boolean[]>([]);

  private createExperience(exp?: ExperienceRequest) {
    const toDateValue = exp?.toDate || '';
    const isCurrent = !exp?.toDate && !!exp?.fromDate;

    return this.fb.nonNullable.group({
      jobTitle: [exp?.jobTitle || '', Validators.required],
      companyName: [exp?.companyName || '', Validators.required],
      fromDate: [exp?.fromDate || '', Validators.required],
      toDate: [{ value: toDateValue, disabled: isCurrent }],
      description: [exp?.description || ''],
    });
  }

  addEntry() {
    this.experiences.push(this.createExperience());
    this.isCurrent.update(arr => [...arr, false]);
  }

  toggleCurrent(index: number) {
    const current = this.isCurrent();
    const newVal = !current[index];
    this.isCurrent.update(arr => {
      const next = [...arr];
      next[index] = newVal;
      return next;
    });

    const group = this.experiences.at(index);
    const toDateControl = group.get('toDate');
    if (newVal) {
      toDateControl?.disable();
      toDateControl?.setValue('');
    } else {
      toDateControl?.enable();
    }
  }

  removeEntry(index: number) {
    this.experiences.removeAt(index);
    this.isCurrent.update(arr => arr.filter((_, i) => i !== index));
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const experiences: ExperienceRequest[] = (this.experiences.value as any[]).map((e, i) => ({
      jobTitle: e.jobTitle!,
      companyName: e.companyName!,
      fromDate: e.fromDate!,
      toDate: this.isCurrent()[i] ? null : (e.toDate || null),
      description: e.description || null,
    }));

    this.onboardingStore.updateExperiences(experiences);
    this.onboardingStore.saveExperiences().subscribe({
      next: () => {
        this.isSaving.set(false);
        this.completed.emit();
      },
      error: (err) => {
        this.isSaving.set(false);
        const apiError = err.error ?? err;
        this.errorMessage.set(
          apiError?.title ?? this.translationService.translate('onboarding.experience.errorSave')
        );
      },
    });
  }
}
