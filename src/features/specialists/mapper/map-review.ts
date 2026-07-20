import { SpecialistReviewResponse } from '../contracts/specialist-review.contract';
import { Review } from '../models/review.model';

export function mapReview(
    dto: SpecialistReviewResponse,
): Review {
    return {
        id: dto.reviewerName + dto.createdAtUtc,
        reviewerName: dto.reviewerName,
        rating: dto.rating,
        comment: dto.comment ?? '',
        createdAt: new Date(dto.createdAtUtc),
    };
}
