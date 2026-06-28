export interface SpecialistOnboarding {
    experienceYears: number;

    experienceLevel: number;

    hourlyRate: number;

    bookingPolicy: string;

    expertiseIds: string[];

    skillIds: string[];

    toolIds: string[];

    availability: AvailabilityDraft[];
}

export interface AvailabilityDraft {
    start: Date;
    end: Date;
}