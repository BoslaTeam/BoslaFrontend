import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpecialistsStore } from '../../../store/specialists.store';
import { SpecialistOnboardingStore } from '../../../store/specialist-onboarding.store';
import { UiMultiSelectFilter, FilterOption } from '@shared/ui/multi-select-filter/multi-select-filter';
import { UiButton } from '@shared/ui/button/button';
import { TranslationService } from '@core/services/translation.service';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'tools-step',
  standalone: true,
  imports: [FormsModule, UiMultiSelectFilter, UiButton, TranslatePipe],
  templateUrl: './tools-step.html',
})
export class ToolsStep {
  private readonly specialistsStore = inject(SpecialistsStore);
  private readonly translationService = inject(TranslationService);
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
      this.errorMessage.set(this.translationService.translate('onboarding.tools.errorSelect'));
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
          (err.error ?? err)?.title ?? this.translationService.translate('onboarding.tools.errorSave')
        );
      },
    });
  }
}
