export interface OnboardSpecialistRequest {
    experienceYears: number;
    experienceLevel: number;
    hourlyRate: number;
    bookingPolicy: string;
}

export interface StartResponse {
    specialistId: string;
    verificationStatus: number;
}

export interface UpdateProfileRequest {
    experienceYears: number;
    experienceLevel: number;
    hourlyRate: number;
    introVideoUrl?: string;
    bookingPolicy?: string;
}
