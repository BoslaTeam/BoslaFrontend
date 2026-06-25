export interface SpecialistOnboardRequest {
  yearsOfExperience: number;
  hourlyRate: number;
  bookingPolicy: string;
}

export interface SpecialistOnboardResponse {
  message: string;
  isSuccess: boolean;
}

export interface SpecialistProfileResponse {
  id: string;
  userId: string;
  yearsOfExperience: number;
  hourlyRate: number;
  bookingPolicy: string;
  cancellationPolicy: string;
}

export interface AvailabilityResponse {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface AddAvailabilityRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ExperienceDto {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface AddExperienceRequestDTO {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface UpdateExperienceRequest {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface AddExpertiseRequest {
  expertiseId: string;
}

export interface AddSkillRequest {
  skillName: string;
}

export interface UpdateCancellationPolicyRequest {
  cancellationPolicy: string;
}

export interface UpdateBookingPolicyRequest {
  bookingPolicy: string;
}
