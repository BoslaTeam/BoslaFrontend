export interface SpecialistProfileResponse {
  specialistId: string;
  userId: string;
  email: string;
  name: string;
  title: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  country: string;
  gender: string;
  preferredLanguage: string;
  experienceYears: number;
  experienceLevel: number;
  hourlyRate: number;
  introVideoUrl: string | null;
  verificationStatus: number;
  bookingPolicy: string;
  minBookingNoticeHours: number;
  maxSessionsPerDay: number;
  maxSessionsPerWeek: number;
  cancellationDeadlineHours: number;
  cancellationFeePercent: number;
}