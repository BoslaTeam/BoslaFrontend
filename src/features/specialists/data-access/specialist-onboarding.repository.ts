import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { OnboardSpecialistRequest } from '../contracts/specialist-onboard.contract';
import { ExperienceRequest } from '../contracts/specialist-experience.contract';
import { AvailabilityRequest } from '../contracts/specialist-availability.contract';
import { SpecialistsApiService } from './specialist-api.service';
import { SpecialistsMapper } from './specialists-mapper';

@Injectable({
  providedIn: 'root',
})
export class SpecialistOnboardingRepository {
  private readonly api = inject(SpecialistsApiService);

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
