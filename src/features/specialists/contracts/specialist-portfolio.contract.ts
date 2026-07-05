export interface PortfolioItemImageDto {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

export interface PortfolioItemDto {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string;
  workUrl: string | null;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  adminNotes: string | null;
  sortOrder: number;
  createdAtUtc: string;
  images: PortfolioItemImageDto[];
}

export interface CreatePortfolioItemRequest {
  title: string;
  description?: string;
  coverImageUrl: string;
  imageUrls: string[];
  workUrl?: string;
}

export interface UpdatePortfolioItemRequest {
  title: string;
  description?: string;
  coverImageUrl: string;
  imageUrls: string[];
  workUrl?: string;
}

export interface ReorderItem {
  id: string;
  sortOrder: number;
}

export interface ReorderPortfolioRequest {
  items: ReorderItem[];
}

export interface AdminReviewPortfolioRequest {
  adminNotes?: string;
}
