import { SpecialistReviewResponse } from '../contracts/specialist-review.contract';
import { Review } from '../models/review.model';

export function mapReview(
    dto: SpecialistReviewResponse,
): Review {
    return {
        id: dto.id,

        userId: dto.userId,

        userName: dto.reviewerName,

        rating: dto.rating,

        comment: dto.comment ?? '',

        createdAt: new Date(dto.createdOnUtc),
    };
}