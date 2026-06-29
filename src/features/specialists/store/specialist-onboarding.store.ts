import { inject, Injectable, signal } from '@angular/core';
import { finalize, forkJoin, map, Observable, tap } from 'rxjs';

import { ExperienceRequest } from '../contracts/specialist-experience.contract';
import { AvailabilityRequest } from '../contracts/specialist-availability.contract';
import { OnboardSpecialistRequest } from '../contracts/specialist-onboard.contract';
import { SpecialistOnboardingDraft } from '../models/specialist-onboarding-draft.model';
import { SpecialistOnboardingRepository } from '../data-access/specialist-onboarding.repository';

const EMPTY_DRAFT: SpecialistOnboardingDraft = {
  basicInfo: null,
  skills: [],
  tools: [],
  experiences: [],
  availabilities: [],
};

@Injectable({
  providedIn: 'root',
})
export class SpecialistOnboardingStore {
  private readonly repository = inject(SpecialistOnboardingRepository);

  readonly currentStep = signal(0);
  readonly totalSteps = signal(5);

  readonly onboardingLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly draft = signal<SpecialistOnboardingDraft>({ ...EMPTY_DRAFT });

  nextStep() {
    if (this.currentStep() < this.totalSteps() - 1) {
      this.currentStep.update((v) => v + 1);
    }
  }

  previousStep() {
    if (this.currentStep() > 0) {
      this.currentStep.update((v) => v - 1);
    }
  }

  goToStep(step: number) {
    if (step >= 0 && step < this.totalSteps()) {
      this.currentStep.set(step);
    }
  }

  updateBasicInfo(info: OnboardSpecialistRequest) {
    this.draft.update((d) => ({ ...d, basicInfo: info }));
  }

  updateSkills(skillIds: string[]) {
    this.draft.update((d) => ({ ...d, skills: skillIds }));
  }

  updateTools(toolIds: string[]) {
    this.draft.update((d) => ({ ...d, tools: toolIds }));
  }

  updateExperiences(experiences: ExperienceRequest[]) {
    this.draft.update((d) => ({ ...d, experiences }));
  }

  updateAvailabilities(availabilities: AvailabilityRequest[]) {
    this.draft.update((d) => ({ ...d, availabilities }));
  }

  clearDraft() {
    this.draft.set({ ...EMPTY_DRAFT });
  }

  reset() {
    this.currentStep.set(0);
    this.clearDraft();
    this.error.set(null);
    this.onboardingLoading.set(false);
  }

  onboard() {
    this.onboardingLoading.set(true);
    this.error.set(null);

    const request = this.draft().basicInfo!;

    return this.repository.onboard(request).pipe(
      finalize(() => this.onboardingLoading.set(false)),
    );
  }

  saveSkills() {
    this.error.set(null);
    return this.repository.addSkills(this.draft().skills);
  }

  saveTools() {
    this.error.set(null);
    return this.repository.addTools(this.draft().tools);
  }

  saveExperiences() {
    this.error.set(null);
    return this.repository.addExperiences(this.draft().experiences);
  }

  saveAvailabilities() {
    this.error.set(null);
    return this.repository.addAvailabilities(this.draft().availabilities);
  }

  initDraft(): Observable<void> {
    this.error.set(null);
    this.onboardingLoading.set(true);

    return forkJoin({
      profile: this.repository.getMyProfile(),
      skills: this.repository.getMySkills(),
      tools: this.repository.getMyTools(),
      experiences: this.repository.getMyExperience(),
      availabilities: this.repository.getMyAvailability(),
    }).pipe(
      tap(({ profile, skills, tools, experiences, availabilities }) => {
        this.draft.set({
          basicInfo: {
            experienceYears: profile.experienceYears,
            experienceLevel: profile.experienceLevel,
            hourlyRate: profile.hourlyRate,
            bookingPolicy: '',
          },
          skills: skills.map((s) => s.id),
          tools: tools.map((t) => t.id),
          experiences: experiences.map((e) => ({
            jobTitle: e.jobTitle,
            companyName: e.companyName,
            fromDate: e.fromDate,
            toDate: e.toDate,
            description: e.description,
          })),
          availabilities: availabilities.map((a) => ({
            start: a.start instanceof Date ? a.start.toISOString() : a.start,
            end: a.end instanceof Date ? a.end.toISOString() : a.end,
          })),
        });
      }),
      finalize(() => this.onboardingLoading.set(false)),
      map(() => void 0),
    );
  }
}
