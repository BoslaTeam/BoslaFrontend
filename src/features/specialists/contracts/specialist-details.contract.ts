import { LookupResponse } from './lookup.contract';

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
    industries: LookupResponse[];
    rating: number;
    reviewsCount: number;
    isOnline: boolean;
}