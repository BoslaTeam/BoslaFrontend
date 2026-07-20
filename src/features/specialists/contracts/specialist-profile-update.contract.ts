export interface UpdateSpecialistRequest {
  experienceYears: number;
  experienceLevel: number;
  hourlyRate: number;
  introVideoUrl: string | null;
  bookingPolicy: string | null;
  title: string | null;
  bio: string | null;
  gender: string | null;
  preferredLanguage: string | null;
  country: string | null;
}

export interface UpdateBookingPolicyRequest {
  bookingPolicy: string;
  minBookingNoticeHours: number;
  maxSessionsPerDay: number;
  maxSessionsPerWeek: number;
}

export interface UpdateCancellationPolicyRequest {
  cancellationNoticeHours: number;
  allowCancellation: boolean;
  cancellationPolicy: string | null;
}

export interface UpdateExperienceRequest {
  companyName: string;
  jobTitle: string;
  description: string;
  fromDate: string;
  toDate: string | null;
}
