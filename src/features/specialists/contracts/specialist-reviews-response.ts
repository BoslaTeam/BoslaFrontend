import { SpecialistReviewResponse } from './specialist-review.contract';

export interface ReviewsMetadata {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SpecialistReviewsResponse {
  averageRating: number;
  totalReviews: number;
  reviews: {
  items: SpecialistReviewResponse[];
  metadata: ReviewsMetadata;
};
}
