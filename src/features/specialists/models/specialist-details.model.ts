import { SpecialistBase } from './specialist-base.model';
import { LookupItem } from './lookup.model';

export interface ExperienceItem {
    id: string;
    companyName: string;
    jobTitle: string;
    description: string;
    fromDate: string;
    toDate: string | null;
}

export interface SpecialistDetails extends SpecialistBase {
    userId: string;
    email: string;
    bio: string;
    country: string;
    gender: string;
    preferredLanguage: string;
    experienceYears: number;
    introVideoUrl: string;
    tools: LookupItem[];
    skills: LookupItem[];
    expertise: string[];
    industries: LookupItem[];
    reviewsCount: number;

    bookingPolicy: string;
    minBookingNoticeHours: number;
    maxSessionsPerDay: number;
    maxSessionsPerWeek: number;

    cancellationDeadlineHours: number;
    cancellationFeePercent: number;
    allowCancellation: boolean;
    cancellationPolicy: string;

    experiences: ExperienceItem[];
}
