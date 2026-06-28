import { expectType } from 'tsd';
import { HttpMethod } from '../../src/types/Api.types';
import type { PaginatedResponse, PaginationMeta, RequestConfig } from '../../src/types/Api.types';

// Test PaginatedResponse (simplified structure without status/success)
const paginated: PaginatedResponse<string> = {
  data: ['test'],
  pagination: {
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 1,
    hasMore: false,
  },
};
expectType<string[]>(paginated.data);
expectType<PaginationMeta>(paginated.pagination);
expectType<number>(paginated.pagination.totalItems);
expectType<boolean>(paginated.pagination.hasMore);

// Test PaginationMeta
const meta: PaginationMeta = {
  page: 1,
  pageSize: 10,
  totalPages: 1,
  totalItems: 1,
  hasMore: false,
};
expectType<number>(meta.page);
expectType<number>(meta.pageSize);
expectType<number>(meta.totalPages);
expectType<number>(meta.totalItems);
expectType<boolean>(meta.hasMore);

// Test RequestConfig
const config: RequestConfig = {
  method: HttpMethod.GET,
  url: '/articles',
  headers: { 'Content-Type': 'application/json' },
  params: { category: 'tech', pageSize: 20 },
};
expectType<HttpMethod>(config.method);
expectType<string>(config.url);
expectType<Record<string, string> | undefined>(config.headers);

// Test HttpMethod (single canonical enum)
const method: HttpMethod = HttpMethod.POST;
expectType<HttpMethod>(method);
