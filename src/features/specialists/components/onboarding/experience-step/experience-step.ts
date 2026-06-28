import { Component, inject, output, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpecialistOnboardingStore } from '../../../store/specialist-onboarding.store';
import { ExperienceRequest } from '../../../contracts/specialist-experience.contract';
import { UiButton } from '@shared/ui/button/button';
import { UiInput } from '@shared/ui/input/input';
import { UiTextarea } from '@shared/ui/textarea/textarea';

@Component({
  selector: 'experience-step',
  standalone: true,
  imports: [ReactiveFormsModule, UiButton, UiInput, UiTextarea],
  templateUrl: './experience-step.html',
})
export class ExperienceStep {
  private readonly fb = inject(FormBuilder);
  private readonly onboardingStore = inject(SpecialistOnboardingStore);

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
    const savedExperiences = this.onboardingStore.draft().experiences;
    if (savedExperiences.length > 0) {
      savedExperiences.forEach(exp => {
        this.experiences.push(this.createExperience(exp));
      });
    }
  }

  private createExperience(exp?: ExperienceRequest) {
    return this.fb.nonNullable.group({
      jobTitle: [exp?.jobTitle || '', Validators.required],
      companyName: [exp?.companyName || '', Validators.required],
      fromDate: [exp?.fromDate || '', Validators.required],
      toDate: [exp?.toDate || ''],
      description: [exp?.description || ''],
    });
  }

  addEntry() {
    this.experiences.push(this.createExperience());
  }

  removeEntry(index: number) {
    this.experiences.removeAt(index);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const experiences: ExperienceRequest[] = (this.experiences.value as any[]).map(e => ({
      jobTitle: e.jobTitle!,
      companyName: e.companyName!,
      fromDate: e.fromDate!,
      toDate: e.toDate || null,
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
        this.errorMessage.set(
          err.error?.title ?? 'فشل في حفظ الخبرات. يرجى المحاولة مرة أخرى.'
        );
      },
    });
  }
}
