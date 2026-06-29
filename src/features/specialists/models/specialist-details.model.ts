import { SpecialistBase } from './specialist-base.model';
import { LookupItem } from './lookup.model';

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

    industries: LookupItem[];

    reviewsCount: number;
}
