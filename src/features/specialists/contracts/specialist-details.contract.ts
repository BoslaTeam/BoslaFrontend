import { LookupResponse } from './lookup.contract';
import { ExperienceResponse } from './specialist-experience.contract';

export interface SpecialistDetailsResponse {
    id: string;
    userId: string;
    email: string;
    name: string;
    title: string | null;
    bio: string | null;
    profileImageUrl: string | null;
    country: string | null;
    gender: string | null;
    preferredLanguage: string | null;
    experienceYears: number;
    experienceLevel: number;
    hourlyRate: number;
    introVideoUrl: string | null;
    verificationStatus: number;
    tools: LookupResponse[];
    skills: LookupResponse[];
    expertise: string[];
    industries: LookupResponse[];
    rating: number;
    reviewsCount: number;
    isOnline: boolean;

    bookingPolicy: string | null;
    minBookingNoticeHours: number;
    maxSessionsPerDay: number;
    maxSessionsPerWeek: number;

    cancellationDeadlineHours: number;
    cancellationFeePercent: number;
    allowCancellation: boolean;
    cancellationPolicy: string | null;

    experiences: ExperienceResponse[];
}
