export interface SpecialistReviewResponse {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string | null;
    createdOnUtc: string;
}