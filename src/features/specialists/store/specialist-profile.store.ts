import { inject, Injectable, signal } from '@angular/core';

import { LookupItem } from '../models/lookup.model';
import { SpecialistProfile } from '../models/specialist-profile.model';
import { Availability } from '../models/availability.model';
import { Experience } from '../models/experience.model';

import { SpecialistsRepository } from '../data-access/specialist.repository';

@Injectable({
  providedIn: 'root',
})
export class SpecialistProfileStore {
  private readonly repository = inject(SpecialistsRepository);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly myProfile = signal<SpecialistProfile | null>(null);
  readonly mySkills = signal<LookupItem[]>([]);
  readonly myTools = signal<LookupItem[]>([]);
  readonly myExperiences = signal<Experience[]>([]);
  readonly myAvailability = signal<Availability[]>([]);

  loadMyProfile() {
    this.error.set(null);
    this.repository.getMyProfile().subscribe({
      next: (profile) => this.myProfile.set(profile),
      error: (err) =>
        this.error.set(err.message ?? 'Failed to load profile'),
    });
  }

  loadMySkills() {
    this.error.set(null);
    this.repository.getMySkills().subscribe({
      next: (data) => this.mySkills.set(data),
      error: (err) =>
        this.error.set(err.message ?? 'Failed to load skills'),
    });
  }

  loadMyTools() {
    this.error.set(null);
    this.repository.getMyTools().subscribe({
      next: (data) => this.myTools.set(data),
      error: (err) =>
        this.error.set(err.message ?? 'Failed to load tools'),
    });
  }

  loadMyExperiences() {
    this.error.set(null);
    this.repository.getMyExperience().subscribe({
      next: (data) => this.myExperiences.set(data),
      error: (err) =>
        this.error.set(err.message ?? 'Failed to load experiences'),
    });
  }

  loadMyAvailability() {
    this.error.set(null);
    this.repository.getMyAvailability().subscribe({
      next: (data) => this.myAvailability.set(data),
      error: (err) =>
        this.error.set(err.message ?? 'Failed to load availability'),
    });
  }

  loadMyData() {
    this.loadMyProfile();
    this.loadMySkills();
    this.loadMyTools();
    this.loadMyExperiences();
    this.loadMyAvailability();
  }
}
