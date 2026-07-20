import { UpdateProfileRequest } from '../contracts/specialist-onboard.contract';
import { ExperienceRequest } from '../contracts/specialist-experience.contract';
import { AvailabilityRequest } from '../contracts/specialist-availability.contract';
import { SpecialistDocumentResponse } from '../contracts/specialist-document.contract';

export interface ScheduleDraft {
  days: number[];
  startTime: string;
  endTime: string;
  sessionDuration: number;
  startDate: string;
  endDate: string | null;
  enabled: boolean;
}

export interface SpecialistOnboardingDraft {
  basicInfo: (UpdateProfileRequest & { title?: string }) | null;
  skills: string[];
  tools: string[];
  experiences: ExperienceRequest[];
  availabilities: AvailabilityRequest[];
  documents: SpecialistDocumentResponse[];
  schedules: ScheduleDraft[];
}
