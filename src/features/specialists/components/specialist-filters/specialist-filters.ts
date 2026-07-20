import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';

import { SpecialistsFilters } from '@features/specialists/contracts/specialist-filters.contract';
import { LookupItem } from '@features/specialists/models/lookup.model';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'specialist-filters',
  imports: [ReactiveFormsModule, CommonModule, TranslatePipe],
  templateUrl: './specialist-filters.html',
})
export class SpecialistsFiltersComponent implements OnChanges {
  private readonly fb = inject(NonNullableFormBuilder);

  @Input() expertise: LookupItem[] = [];
  @Input() skills: LookupItem[] = [];
  @Input() tools: LookupItem[] = [];

  @Input() filters: Partial<SpecialistsFilters> | null = null;

  @Output() filtersChanged = new EventEmitter<Partial<SpecialistsFilters>>();

  readonly form = this.fb.group({
    searchTerm: [''],
    experienceLevel: [null as number | null],
    expertiseId: [''],
    skillId: [''],
    toolId: [''],
    minHourlyRate: [null as number | null],
    maxHourlyRate: [null as number | null],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters']?.currentValue) {
      this.form.patchValue(
        {
          searchTerm: this.filters?.searchTerm ?? '',
          experienceLevel: this.filters?.experienceLevel ?? null,
          expertiseId: this.filters?.expertiseId ?? '',
          skillId: this.filters?.skillId ?? '',
          toolId: this.filters?.toolId ?? '',
          minHourlyRate: this.filters?.minHourlyRate ?? null,
          maxHourlyRate: this.filters?.maxHourlyRate ?? null,
        },
        {
          emitEvent: false,
        }
      );
    }
  }

  applyFilters() {
    const rawValues = this.form.getRawValue();

    this.filtersChanged.emit({
      searchTerm: rawValues.searchTerm || undefined,
      experienceLevel: rawValues.experienceLevel ?? undefined,
      expertiseId: rawValues.expertiseId || undefined,
      skillId: rawValues.skillId || undefined,
      toolId: rawValues.toolId || undefined,
      minHourlyRate: rawValues.minHourlyRate ?? undefined,
      maxHourlyRate: rawValues.maxHourlyRate ?? undefined,
      pageNumber: 1,
    });
  }

  resetFilters() {
    this.form.reset();

    this.filtersChanged.emit({
      pageNumber: 1,
      searchTerm: undefined,
      experienceLevel: undefined,
      expertiseId: undefined,
      skillId: undefined,
      toolId: undefined,
      minHourlyRate: undefined,
      maxHourlyRate: undefined,
    });
  }
}