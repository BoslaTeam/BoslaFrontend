import { OnboardSpecialistRequest } from '../contracts/specialist-onboard.contract';
import { ExperienceRequest } from '../contracts/specialist-experience.contract';
import { AvailabilityRequest } from '../contracts/specialist-availability.contract';

export interface SpecialistOnboardingDraft {
  basicInfo: OnboardSpecialistRequest | null;
  skills: string[];
  tools: string[];
  experiences: ExperienceRequest[];
  availabilities: AvailabilityRequest[];
}
