import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { StartResponse, UpdateProfileRequest } from '../contracts/specialist-onboard.contract';
import { ExperienceRequest } from '../contracts/specialist-experience.contract';
import { AvailabilityRequest } from '../contracts/specialist-availability.contract';
import { VerificationDetailsResponse } from '../contracts/specialist-verification.contract';
import { SpecialistDocumentResponse } from '../contracts/specialist-document.contract';
import { SpecialistsApiService } from './specialist-api.service';
import { SpecialistsMapper } from './specialists-mapper';

@Injectable({
  providedIn: 'root',
})
export class SpecialistOnboardingRepository {
  private readonly api = inject(SpecialistsApiService);

  start() {
    return this.api.start().pipe(
      map(response => response.data as StartResponse),
    );
  }

  updateProfile(request: UpdateProfileRequest) {
    return this.api.updateProfile(request).pipe(
      map(response => response.data),
    );
  }

  updateUserTitle(title: string) {
    return this.api.updateUserTitle(title);
  }

  submitForReview() {
    return this.api.submitForReview().pipe(
      map(() => void 0),
    );
  }

  getVerification() {
    return this.api.getVerification().pipe(
      map(response => response.data as VerificationDetailsResponse),
    );
  }

  uploadDocument(file: File, type: number) {
    return this.api.uploadDocument(file, type).pipe(
      map(response => response.data as string),
    );
  }

  getDocuments() {
    return this.api.getDocuments().pipe(
      map(response => response.data as SpecialistDocumentResponse[]),
    );
  }

  deleteDocument(id: string) {
    return this.api.deleteDocument(id).pipe(
      map(() => void 0),
    );
  }

  addExpertise(expertiseId: string) {
    return this.api.addExpertise(expertiseId);
  }

  addSkills(skillIds: string[]) {
    return this.api.addSkills({ skillIds });
  }

  removeSkill(id: string) {
    return this.api.removeSkill(id);
  }

  addTools(toolIds: string[]) {
    return this.api.addTools({ toolIds });
  }

  removeTool(id: string) {
    return this.api.removeTool(id);
  }

  addExperiences(experiences: ExperienceRequest[]) {
    return this.api.addExperiences({
      experiences,
    });
  }

  removeExperience(id: string) {
    return this.api.removeExperience(id);
  }

  addAvailabilities(availabilities: AvailabilityRequest[]) {
    return this.api.addAvailabilities({
      availabilities,
    });
  }

  removeAvailability(id: string) {
    return this.api.deleteAvailability(id);
  }

  getMyProfile() {
    return this.api.getMyProfile().pipe(
      map(response => response.data)
    );
  }

  getMyExperience() {
    return this.api.getMyExperience().pipe(
      map(response => response.data)
    );
  }

  getMyAvailability() {
    return this.api.getMyAvailability().pipe(
      map(response => response.data.map(SpecialistsMapper.mapAvailability))
    );
  }

  getMySkills() {
    return this.api.getMySkills().pipe(
      map(response => response.data.map(SpecialistsMapper.mapLookup))
    );
  }

  getMyTools() {
    return this.api.getMyTools().pipe(
      map(response => response.data.map(SpecialistsMapper.mapLookup))
    );
  }
}
