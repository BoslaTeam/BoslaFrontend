export interface SpecialistReviewResponse {
    id: string;
    userId: string;
    reviewerName: string;
    rating: number;
    comment: string | null;
    createdOnUtc: string;
}