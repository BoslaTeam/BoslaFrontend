import type { PaginationMetadata } from './paginated-response.model';

export interface ApiError {
  code: string;
  description: string;
  type: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
  pagination?: PaginationMetadata;
}
