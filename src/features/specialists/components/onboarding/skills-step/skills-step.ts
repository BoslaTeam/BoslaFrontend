import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpecialistsStore } from '../../../store/specialists.store';
import { SpecialistOnboardingStore } from '../../../store/specialist-onboarding.store';
import { UiMultiSelectFilter, FilterOption } from '@shared/ui/multi-select-filter/multi-select-filter';
import { UiButton } from '@shared/ui/button/button';

@Component({
  selector: 'skills-step',
  standalone: true,
  imports: [FormsModule, UiMultiSelectFilter, UiButton],
  templateUrl: './skills-step.html',
})
export class SkillsStep {
  private readonly specialistsStore = inject(SpecialistsStore);
  readonly onboardingStore = inject(SpecialistOnboardingStore);

  readonly completed = output<void>();
  readonly back = output<void>();

  readonly isSaving = signal(false);
  readonly errorMessage = signal('');

  readonly skillOptions = signal<FilterOption[]>([]);

  constructor() {
    this.skillOptions.set(
      this.specialistsStore.skills().map(s => ({ value: s.id, label: s.name }))
    );
  }

  onSelectionChange(values: string[]) {
    this.onboardingStore.updateSkills(values);
    this.errorMessage.set('');
  }

  onSubmit() {
    const selectedIds = this.onboardingStore.draft().skills;
    if (selectedIds.length === 0) {
      this.errorMessage.set('يرجى اختيار مهارة واحدة على الأقل');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    this.onboardingStore.saveSkills().subscribe({
      next: () => {
        this.isSaving.set(false);
        this.completed.emit();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          err.error?.title ?? 'فشل في حفظ المهارات. يرجى المحاولة مرة أخرى.'
        );
      },
    });
  }
}
