import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SpecialistsFilters } from '@features/specialists/contracts/specialist-filters.contract';
import { LookupItem } from '@features/specialists/models/lookup.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'specialist-filters',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './specialist-filters.html',
  styleUrl: './specialist-filters.css',
})
export class SpecialistsFiltersComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  @Input() expertise: LookupItem[] = [];
  @Input() skills: LookupItem[] = [];
  @Input() tools: LookupItem[] = [];

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
    this.applyFilters();
  }
}
