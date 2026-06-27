import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { SpecialistsFilters } from '../contracts/specialist-filters.contract';
import { OnboardSpecialistRequest } from '../contracts/specialist-onboard.contract';
import { ExperienceRequest } from '../contracts/specialist-experience.contract';
import { AvailabilityRequest } from '../contracts/specialist-availability.contract';
import { SpecialistsApiService } from './specialist-api.service';
import { SpecialistsMapper } from './specialists-mapper';

@Injectable({
  providedIn: 'root',
})
export class SpecialistsRepository {
  private readonly api = inject(SpecialistsApiService);

  // ==========================================
  // Lookups Section
  // ==========================================

  getExpertise() {
    return this.api.getExpertise().pipe(
      map(response =>
        response.data.map(SpecialistsMapper.mapLookup)
      )
    );
  }

  getSkills() {
    return this.api.getSkills().pipe(
      map(response =>
        response.data.map(SpecialistsMapper.mapLookup)
      )
    );
  }

  getTools() {
    return this.api.getTools().pipe(
      map(response =>
        response.data.map(SpecialistsMapper.mapLookup)
      )
    );
  }

  getIndustries() {
    return this.api.getIndustries().pipe(
      map(response =>
        response.data.map(SpecialistsMapper.mapLookup)
      )
    );
  }

  // ==========================================
  // Specialists Data Section
  // ==========================================

  getSpecialists(filters: SpecialistsFilters) {
    return this.api.getSpecialists(filters).pipe(
      map(response => ({
        items: response.data.items.map(SpecialistsMapper.mapSpecialist),
        metadata: response.data.metadata,
      })),
    );
  }

  getSpecialistById(id: string) {
    return this.api.getSpecialistById(id).pipe(
      map(response =>
        SpecialistsMapper.mapSpecialistDetails(response.data)
      ),
    );
  }

  getReviews(id: string) {
    return this.api.getReviews(id).pipe(
      map(response =>
        response.data.map(SpecialistsMapper.mapReview)
      ),
    );
  }

  getAvailability(id: string) {
    return this.api.getAvailability(id).pipe(
      map(response =>
        response.data.map(SpecialistsMapper.mapAvailability)
      ),
    );
  }

  // ==========================================
  // Onboarding Actions
  // ==========================================

  onboard(request: OnboardSpecialistRequest) {
    return this.api.onboard(request).pipe(
      map(response => response.data),
    );
  }

  addExpertise(expertiseId: string) {
    return this.api.addExpertise(expertiseId);
  }

  addSkills(skillIds: string[]) {
    return this.api.addSkills({ skillIds });
  }

  addTools(toolIds: string[]) {
    return this.api.addTools({ toolIds });
  }

  addExperiences(experiences: ExperienceRequest[]) {
    return this.api.addExperiences({
      experiences,
    });
  }

  addAvailabilities(availabilities: AvailabilityRequest[]) {
    return this.api.addAvailabilities({
      availabilities,
    });
  }

  // ==========================================
  // My Profile Queries
  // ==========================================

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
