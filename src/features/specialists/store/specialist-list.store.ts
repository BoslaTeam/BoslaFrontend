import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { LookupItem } from '../models/lookup.model';
import { Specialist } from '../models/specialist.model';

import { SpecialistsFilters } from '../contracts/specialist-filters.contract';
import { SpecialistListRepository } from '../data-access/specialist-list.repository';

@Injectable({
  providedIn: 'root',
})
export class SpecialistListStore {
  private readonly repository = inject(SpecialistListRepository);

  readonly specialists = signal<Specialist[]>([]);

  readonly expertise = signal<LookupItem[]>([]);
  readonly skills = signal<LookupItem[]>([]);
  readonly tools = signal<LookupItem[]>([]);
  readonly industries = signal<LookupItem[]>([]);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalPages = signal(0);
  readonly totalCount = signal(0);

  readonly filters = signal<SpecialistsFilters>({
    pageNumber: 1,
    pageSize: 10,
  });

  readonly hasResults = computed(() => this.specialists().length > 0);

  readonly isEmpty = computed(
    () => !this.loading() && this.specialists().length === 0,
  );

  updateFilters(partialFilters: Partial<SpecialistsFilters>) {
    this.filters.update((current) => ({
      ...current,
      ...partialFilters,
    }));

    this.loadSpecialists(this.filters());
  }

  resetFilters() {
    this.filters.set({
      pageNumber: 1,
      pageSize: 10,
    });
    this.loadSpecialists(this.filters());
  }

  loadExpertise() {
    this.error.set(null);
    this.repository.getExpertise().subscribe({
      next: (data) => this.expertise.set(data),
      error: (err) => this.error.set(err.message || 'Failed to load expertise'),
    });
  }

  loadSkills() {
    this.error.set(null);
    this.repository.getSkills().subscribe({
      next: (data) => this.skills.set(data),
      error: (err) => this.error.set(err.message || 'Failed to load skills'),
    });
  }

  loadTools() {
    this.error.set(null);
    this.repository.getTools().subscribe({
      next: (data) => this.tools.set(data),
      error: (err) => this.error.set(err.message || 'Failed to load tools'),
    });
  }

  loadIndustries() {
    this.error.set(null);
    this.repository.getIndustries().subscribe({
      next: (data) => this.industries.set(data),
      error: (err) => this.error.set(err.message || 'Failed to load industries'),
    });
  }

  loadLookups() {
    this.loadExpertise();
    this.loadSkills();
    this.loadTools();
    this.loadIndustries();
  }

  loadSpecialists(filters: SpecialistsFilters) {
    this.loading.set(true);
    this.error.set(null);

    this.repository
      .getSpecialists(filters)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result) => {
          this.specialists.set(result.items);
          this.currentPage.set(result.metadata.currentPage);
          this.pageSize.set(result.metadata.pageSize);
          this.totalPages.set(result.metadata.totalPages);
          this.totalCount.set(result.metadata.totalCount);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load specialists');
        },
      });
  }
}
