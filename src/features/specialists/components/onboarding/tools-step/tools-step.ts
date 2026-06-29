import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpecialistsStore } from '../../../store/specialists.store';
import { SpecialistOnboardingStore } from '../../../store/specialist-onboarding.store';
import { UiMultiSelectFilter, FilterOption } from '@shared/ui/multi-select-filter/multi-select-filter';
import { UiButton } from '@shared/ui/button/button';

@Component({
  selector: 'tools-step',
  standalone: true,
  imports: [FormsModule, UiMultiSelectFilter, UiButton],
  templateUrl: './tools-step.html',
})
export class ToolsStep {
  private readonly specialistsStore = inject(SpecialistsStore);
  readonly onboardingStore = inject(SpecialistOnboardingStore);

  readonly completed = output<void>();
  readonly back = output<void>();

  readonly isSaving = signal(false);
  readonly errorMessage = signal('');

  readonly toolOptions = signal<FilterOption[]>([]);

  constructor() {
    this.toolOptions.set(
      this.specialistsStore.tools().map(t => ({ value: t.id, label: t.name }))
    );
  }

  onSelectionChange(values: string[]) {
    this.onboardingStore.updateTools(values);
    this.errorMessage.set('');
  }

  onSubmit() {
    const selectedIds = this.onboardingStore.draft().tools;
    if (selectedIds.length === 0) {
      this.errorMessage.set('يرجى اختيار أداة واحدة على الأقل');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    this.onboardingStore.saveTools().subscribe({
      next: () => {
        this.isSaving.set(false);
        this.completed.emit();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          err.error?.title ?? 'فشل في حفظ الأدوات. يرجى المحاولة مرة أخرى.'
        );
      },
    });
  }
}
