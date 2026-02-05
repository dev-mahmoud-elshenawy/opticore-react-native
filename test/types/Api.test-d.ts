import { expectType } from 'tsd';
import type { ApiResponse, ApiError, PaginatedResponse, RequestConfig } from '../../src/types/Api.types';

// Test ApiResponse
const response: ApiResponse<string> = {
    data: 'test',
    status: 200,
    success: true
};
expectType<string | undefined>(response.data);
expectType<number>(response.status);
expectType<boolean>(response.success);

// Test ApiError
const error: ApiError = {
    status: 404,
    message: 'Not found'
};
expectType<number>(error.status);
expectType<string>(error.message);

// Test PaginatedResponse
const paginated: PaginatedResponse<string> = {
    data: ['test'],
    status: 200,
    success: true,
    pagination: {
        page: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 1,
        hasMore: false
    }
};
expectType<string[]>(paginated.data);
expectType<number>(paginated.pagination.totalItems);
