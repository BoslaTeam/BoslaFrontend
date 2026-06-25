export interface ReviewItem {
  reviewerName: string;
  rating: number;
  comment: string;
  createdAtUtc: string;
}

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
    items: ReviewItem[];
    metadata: ReviewsMetadata;
  };
}