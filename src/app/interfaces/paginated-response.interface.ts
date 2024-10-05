export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  limit: number;
  offset: number;
  total_items: number;
  number_of_items: number;
  total_pages: number;
}
