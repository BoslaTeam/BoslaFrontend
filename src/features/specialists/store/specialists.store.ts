import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { LookupItem } from '../models/lookup.model';
import { Specialist } from '../models/specialist.model';
import { SpecialistDetails } from '../models/specialist-details.model';
import { Review } from '../models/review.model';
import { Availability } from '../models/availability.model';

import { SpecialistsFilters } from '../contracts/specialist-filters.contract';
import { SpecialistsRepository } from '../data-access/specialist.repository';
import { OnboardSpecialistRequest } from '../contracts/specialist-onboard.contract';

@Injectable({
  providedIn: 'root',
})
export class SpecialistsStore {
  private readonly repository = inject(SpecialistsRepository);

  // ==========================================
  // State (Signals)
  // ==========================================
  readonly specialists = signal<Specialist[]>([]);
  readonly specialist = signal<SpecialistDetails | null>(null);
  readonly reviews = signal<Review[]>([]);
  readonly availability = signal<Availability[]>([]);

  readonly expertise = signal<LookupItem[]>([]);
  readonly skills = signal<LookupItem[]>([]);
  readonly tools = signal<LookupItem[]>([]);
  readonly industries = signal<LookupItem[]>([]);

  // Status Signals
  readonly loading = signal(false);
  readonly detailsLoading = signal(false);
  readonly onboardingLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Pagination State
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalPages = signal(0);
  readonly totalCount = signal(0);

  // Filters State
  readonly filters = signal<SpecialistsFilters>({
    pageNumber: 1,
    pageSize: 10,
  });

  // ==========================================
  // Computed State
  // ==========================================
  readonly hasResults = computed(
    () => this.specialists().length > 0
  );

  readonly isEmpty = computed(
    () => !this.loading() && this.specialists().length === 0
  );

  // ==========================================
  // Filter Actions
  // ==========================================
  updateFilters(partialFilters: Partial<SpecialistsFilters>) {
    this.filters.update(current => ({
      ...current,
      ...partialFilters,
    }));

    // تلقائياً نقوم بجلب البيانات المحدثة بناءً على الفلاتر الجديدة
    this.loadSpecialists(this.filters());
  }

  resetFilters() {
    this.filters.set({
      pageNumber: 1,
      pageSize: 10,
    });
    this.loadSpecialists(this.filters());
  }

  // ==========================================
  // Load Lookups Methods
  // ==========================================
  loadExpertise() {
    this.error.set(null);
    this.repository.getExpertise().subscribe({
      next: data => this.expertise.set(data),
      error: err => this.error.set(err.message || 'Failed to load expertise'),
    });
  }

  loadSkills() {
    this.error.set(null);
    this.repository.getSkills().subscribe({
      next: data => this.skills.set(data),
      error: err => this.error.set(err.message || 'Failed to load skills'),
    });
  }

  loadTools() {
    this.error.set(null);
    this.repository.getTools().subscribe({
      next: data => this.tools.set(data),
      error: err => this.error.set(err.message || 'Failed to load tools'),
    });
  }

  loadIndustries() {
    this.error.set(null);
    this.repository.getIndustries().subscribe({
      next: data => this.industries.set(data),
      error: err => this.error.set(err.message || 'Failed to load industries'),
    });
  }

  loadLookups() {
    this.loadExpertise();
    this.loadSkills();
    this.loadTools();
    this.loadIndustries();
  }

  // ==========================================
  // Core Load Methods
  // ==========================================
  loadSpecialists(filters: SpecialistsFilters) {
    this.loading.set(true);
    this.error.set(null);

    this.repository
      .getSpecialists(filters)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: result => {
          this.specialists.set(result.items);
          this.currentPage.set(result.metadata.currentPage);
          this.pageSize.set(result.metadata.pageSize);
          this.totalPages.set(result.metadata.totalPages);
          this.totalCount.set(result.metadata.totalCount);
        },
        error: err => {
          this.error.set(err.message || 'Failed to load specialists');
        },
      });
  }

  loadSpecialist(specialistId: string) {
    this.detailsLoading.set(true);
    this.error.set(null);

    this.repository
      .getSpecialistById(specialistId)
      .pipe(
        finalize(() => {
          this.detailsLoading.set(false);
        }),
      )
      .subscribe({
        next: specialist => {
          this.specialist.set(specialist);
        },
        error: err => {
          this.error.set(err.message || 'Failed to load specialist details');
        },
      });
  }

  loadReviews(specialistId: string) {
    this.error.set(null);
    this.repository
      .getReviews(specialistId)
      .subscribe({
        next: reviews => {
          this.reviews.set(reviews);
        },
        error: err => {
          this.error.set(err.message || 'Failed to load reviews');
        },
      });
  }

  loadAvailability(specialistId: string) {
    this.error.set(null);
    this.repository
      .getAvailability(specialistId)
      .subscribe({
        next: availability => {
          this.availability.set(availability);
        },
        error: err => {
          this.error.set(err.message || 'Failed to load availability');
        },
      });
  }

  loadProfile(specialistId: string) {
    this.loadSpecialist(specialistId);
    this.loadReviews(specialistId);
    this.loadAvailability(specialistId);
  }

  // ==========================================
  // Mutate / Action Methods
  // ==========================================
  onboard(request: OnboardSpecialistRequest) {
    this.onboardingLoading.set(true);
    this.error.set(null);

    return this.repository
      .onboard(request)
      .pipe(
        finalize(() => {
          this.onboardingLoading.set(false);
        }),
      );
  }

  addExpertise(expertiseId: string) {
    return this.repository.addExpertise(expertiseId);
  }

  addSkill(skillId: string) {
    return this.repository.addSkill(skillId);
  }

  addTool(toolId: string) {
    return this.repository.addTool(toolId);
  }

  addAvailability(start: string, end: string) {
    return this.repository.addAvailability(start, end);
  }
}