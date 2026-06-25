import { LookupItem } from './lookup.model';

export interface SpecialistDetails {
    id: string;

    userId: string;

    email: string;

    name: string;

    title: string;

    bio: string;

    imageUrl: string;

    country: string;

    gender: string;

    preferredLanguage: string;

    experienceYears: number;

    experienceLevel: number;

    hourlyRate: number;

    introVideoUrl: string;

    isVerified: boolean;

    tools: LookupItem[];

    skills: LookupItem[];

    industries: LookupItem[];

    rating: number;

    reviewsCount: number;

    isOnline: boolean;
}