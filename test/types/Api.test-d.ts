import { expectType } from 'tsd';
import type {
  PaginatedResponse,
  PaginationMeta,
  RequestConfig,
  HttpMethod,
} from '../../src/types/Api.types';

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
// Test RequestConfig
const config: RequestConfig = {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
};
expectType<HttpMethod | undefined>(config.method);
expectType<Record<string, string> | undefined>(config.headers);
expectType<number | undefined>(config.timeout);

// Test HttpMethod
const method: HttpMethod = 'POST';
expectType<HttpMethod>(method);
