import { SpecialistReviewResponse } from '../contracts/specialist-review.contract';
import { Review } from '../models/review.model';

export function mapReview(
    dto: SpecialistReviewResponse,
): Review {
    return {
        reviewerName: dto.reviewerName,

        rating: dto.rating,

        comment: dto.comment ?? '',

        createdAt: new Date(dto.createdAtUtc),
    };
}