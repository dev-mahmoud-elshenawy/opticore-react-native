/**
 * API Type Definitions
 *
 * Centralized type definitions for API requests and responses.
 * Provides type safety for network operations across the package.
 *
 * @module types/Api
 * @note For throwable API errors, use the ApiError class from infrastructure
 * @note For Axios response types, use ApiResponse from infrastructure
 */

/**
 * Pagination metadata
 */
export interface PaginationMeta {
    /** Current page number (1-indexed) */
    page: number;
    /** Number of items per page */
    pageSize: number;
    /** Total number of pages */
    totalPages: number;
    /** Total number of items across all pages */
    totalItems: number;
    /** Whether there are more pages available */
    hasMore: boolean;
}

/**
 * Paginated API response structure
 * Combines data array with pagination metadata for paginated endpoints
 *
 * @template T - Type of individual items in the response
 */
export interface PaginatedResponse<T> {
    /** Array of items for current page */
    data: T[];
    /** Pagination metadata */
    pagination: PaginationMeta;
}

/**
 * HTTP request methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * Request configuration options
 */
export interface RequestConfig {
    /** HTTP method */
    method?: HttpMethod;
    /** Request headers */
    headers?: Record<string, string>;
    /** Query parameters */
    params?: Record<string, string | number | boolean>;
    /** Request body */
    body?: unknown;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Whether to include credentials */
    withCredentials?: boolean;
    /** Response type expected */
    responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
    /** Callback for upload progress */
    onUploadProgress?: (progress: number) => void;
    /** Callback for download progress */
    onDownloadProgress?: (progress: number) => void;
}
