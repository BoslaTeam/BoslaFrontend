import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { UpdateProfileRequest } from '../contracts/specialist-onboard.contract';
import { ExperienceRequest } from '../contracts/specialist-experience.contract';
import { AvailabilityRequest } from '../contracts/specialist-availability.contract';
import { SpecialistDocumentResponse } from '../contracts/specialist-document.contract';
import { SpecialistOnboardingDraft } from '../models/specialist-onboarding-draft.model';
import { SpecialistOnboardingRepository } from '../data-access/specialist-onboarding.repository';

const EMPTY_DRAFT: SpecialistOnboardingDraft = {
  basicInfo: null,
  skills: [],
  tools: [],
  experiences: [],
  availabilities: [],
  documents: [],
};

@Injectable({
  providedIn: 'root',
})
export class SpecialistOnboardingStore {
  private readonly repository = inject(SpecialistOnboardingRepository);
  private readonly authService = inject(AuthService);

  readonly currentStep = signal(0);
  readonly totalSteps = signal(7);

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

  updateBasicInfo(info: UpdateProfileRequest & { title?: string }) {
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

  updateDocuments(documents: SpecialistDocumentResponse[]) {
    this.draft.update((d) => ({ ...d, documents }));
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

  startSpecialist() {
    this.onboardingLoading.set(true);
    this.error.set(null);

    return this.repository.start().pipe(
      switchMap(() => this.authService.refreshSpecialistStatusAsync()),
      finalize(() => this.onboardingLoading.set(false)),
    );
  }

  updateProfile(request: UpdateProfileRequest & { title?: string }) {
    this.error.set(null);
    const { title, ...profileRequest } = request;
    const profile$ = this.repository.updateProfile(profileRequest);
    if (title) {
      return profile$.pipe(
        switchMap(() => this.repository.updateUserTitle(title)),
        map(() => void 0),
      );
    }
    return profile$.pipe(map(() => void 0));
  }

  submitForReview() {
    this.onboardingLoading.set(true);
    this.error.set(null);

    return this.repository.submitForReview().pipe(
      switchMap(() => this.authService.refreshSpecialistStatusAsync()),
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

  saveExperiences(): Observable<void> {
    this.error.set(null);
    this.onboardingLoading.set(true);

    return this.repository.getMyExperience().pipe(
      switchMap((existing) => {
        const deleteOps = existing.map((e) =>
          this.repository.removeExperience((e as any).id),
        );
        return deleteOps.length > 0 ? forkJoin(deleteOps) : of([]);
      }),
      switchMap(() => this.repository.addExperiences(this.draft().experiences)),
      finalize(() => this.onboardingLoading.set(false)),
      map(() => void 0),
    );
  }

  saveAvailabilities(): Observable<void> {
    this.error.set(null);
    this.onboardingLoading.set(true);

    return this.repository.getMyAvailability().pipe(
      switchMap((existing) => {
        const deleteOps = existing.map((a) =>
          this.repository.removeAvailability(a.id),
        );
        return deleteOps.length > 0 ? forkJoin(deleteOps) : of([]);
      }),
      switchMap(() => this.repository.addAvailabilities(this.draft().availabilities)),
      finalize(() => this.onboardingLoading.set(false)),
      map(() => void 0),
    );
  }

  uploadDocument(file: File, type: number) {
    this.error.set(null);
    return this.repository.uploadDocument(file, type).pipe(
      switchMap(() => this.loadDocuments()),
    );
  }

  loadDocuments() {
    return this.repository.getDocuments().pipe(
      tap((documents) => this.updateDocuments(documents)),
    );
  }

  deleteDocument(id: string) {
    this.error.set(null);
    return this.repository.deleteDocument(id).pipe(
      switchMap(() => this.loadDocuments()),
    );
  }

  initDraft(): Observable<void> {
    this.error.set(null);
    this.onboardingLoading.set(true);

    return this.repository.getMyProfile().pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return this.repository.start().pipe(
            switchMap(() => this.authService.refreshSpecialistStatusAsync()),
            map(() => null),
          );
        }
        throw err;
      }),
      switchMap((profile) =>
        forkJoin({
          profile: of(profile),
          skills: this.repository.getMySkills(),
          tools: this.repository.getMyTools(),
          experiences: this.repository.getMyExperience(),
          availabilities: this.repository.getMyAvailability(),
          documents: this.repository.getDocuments().pipe(
            catchError((err: HttpErrorResponse) => {
              if (err.status === 404) return of([]);
              throw err;
            }),
          ),
        }),
      ),
      tap(({ profile, skills, tools, experiences, availabilities, documents }) => {
        this.draft.set({
          basicInfo: profile
            ? {
                experienceYears: profile.experienceYears,
                experienceLevel: profile.experienceLevel,
                hourlyRate: profile.hourlyRate,
                bookingPolicy: (profile as any).bookingPolicy ?? '',
              }
            : null,
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
          documents,
        });
      }),
      catchError(() => {
        this.draft.set({ ...EMPTY_DRAFT });
        return of(void 0);
      }),
      finalize(() => this.onboardingLoading.set(false)),
      map(() => void 0),
    );
  }
}
