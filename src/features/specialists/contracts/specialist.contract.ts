export interface SpecialistResponse {
    id: string;
    name: string;
    title: string | null;
    profileImageUrl: string | null;
    hourlyRate: number;
    experienceLevel: number;
    verificationStatus: number;
    rating: number;
    isOnline: boolean;
}