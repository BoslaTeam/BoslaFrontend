import { ApiResponse } from "@core/models/api-response.model";

export interface OnboardSpecialistRequest {
    experienceYears: number;
    experienceLevel: number;
    hourlyRate: number;
    bookingPolicy: string;
}

export interface OnboardSpecialistResponse {
    specialistId: string;
    verificationStatus: number;
    token: {
        accessToken: string;
        refreshToken: string;
    };
}