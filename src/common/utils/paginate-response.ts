// src/common/utils/paginate-response.ts
export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  perPage: number
): PaginatedResponse<T> {
  return {
    data,
    meta: {
      total,
      page,
      perPage
    }
  };
}
