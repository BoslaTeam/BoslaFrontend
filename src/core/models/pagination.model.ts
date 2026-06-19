export interface PaginationRequest {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export const DEFAULT_PAGINATION_REQUEST: PaginationRequest = {
  page: 1,
  pageSize: 10,
};