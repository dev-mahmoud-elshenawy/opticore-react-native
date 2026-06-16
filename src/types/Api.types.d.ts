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
 * Generic API response body.
 *
 * The common metadata fields backends wrap their payloads in. This is the
 * *body* shape (what arrives in `ApiResponse.data`), distinct from the
 * transport-level `ApiResponse<T>`. All fields are optional so non-wrapped
 * responses remain assignable. Extend it with your data source's payload:
 *
 * @example
 * ```typescript
 * // Extend with your endpoint's payload shape:
 * interface ListResponse<T> extends ApiResult {
 *   total?: number;
 *   items?: T[];
 * }
 * ```
 *
 * @template T - Type of the wrapped payload when carried under a `data` field
 */
export interface ApiResult<T = unknown> {
  /** Outcome flag (e.g. "ok" / "error" / "success") — convention is per-backend */
  status?: string;
  /** Human-readable status/error message */
  message?: string;
  /** Machine-readable status/error code */
  code?: string;
  /** Wrapped payload, for backends that nest data under a `data` field */
  data?: T;
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
