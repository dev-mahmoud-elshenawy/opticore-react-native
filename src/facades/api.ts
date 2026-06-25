import { ApiClient } from '../infrastructure/network/ApiClient';
import { HttpMethod } from '../infrastructure';
import type { RequestConfig } from '../types/Api.types';
import type { ApiResponse } from '../infrastructure/network/ApiResponse';

/** Per-request options shared by every verb (everything except method/url/data). */
export type VerbConfig = Omit<RequestConfig, 'method' | 'url' | 'data'>;

/** Resolve a request to just its response body (the `.data`). */
const unwrapData = <T>(p: Promise<ApiResponse<T>>): Promise<T> => p.then((r) => r.data);

/**
 * Ergonomic facade over the {@link ApiClient} singleton.
 *
 * - Removes `.getInstance()` boilerplate.
 * - Adds verb sugar (`get/post/put/patch/delete`) over the enum-based `request()`.
 * - `request()` remains available for full control.
 *
 * `T` is caller-controlled per call (array, object, union, wrapper, primitive)
 * and defaults to `unknown` when omitted — never `any`. The generic is
 * compile-time only; the runtime shape is whatever the server returns (validate
 * with Zod at the call site if you need runtime guarantees).
 *
 * Every method resolves the singleton lazily per call, so importing this module
 * has no side effects, and `api.*` inherits `request()`'s "called before
 * initialization" guard unchanged.
 */
export const api = {
  request: <T = unknown>(config: RequestConfig): Promise<ApiResponse<T>> =>
    ApiClient.getInstance().request<T>(config),

  get: <T = unknown>(url: string, config?: VerbConfig): Promise<ApiResponse<T>> =>
    ApiClient.getInstance().request<T>({ method: HttpMethod.GET, url, ...config }),

  delete: <T = unknown>(url: string, config?: VerbConfig): Promise<ApiResponse<T>> =>
    ApiClient.getInstance().request<T>({ method: HttpMethod.DELETE, url, ...config }),

  post: <T = unknown>(url: string, data?: unknown, config?: VerbConfig): Promise<ApiResponse<T>> =>
    ApiClient.getInstance().request<T>({ method: HttpMethod.POST, url, data, ...config }),

  put: <T = unknown>(url: string, data?: unknown, config?: VerbConfig): Promise<ApiResponse<T>> =>
    ApiClient.getInstance().request<T>({ method: HttpMethod.PUT, url, data, ...config }),

  patch: <T = unknown>(url: string, data?: unknown, config?: VerbConfig): Promise<ApiResponse<T>> =>
    ApiClient.getInstance().request<T>({ method: HttpMethod.PATCH, url, data, ...config }),

  /**
   * Unwrapped variants — return the response body (`T`) directly instead of
   * `ApiResponse<T>`. Same signatures as the verbs above, minus the wrapper.
   * `api.data.get<User[]>('/users')` resolves to `User[]`. Errors propagate
   * identically (the underlying request rejects); unwrapping only touches success.
   */
  data: {
    get: <T = unknown>(url: string, config?: VerbConfig): Promise<T> =>
      unwrapData(ApiClient.getInstance().request<T>({ method: HttpMethod.GET, url, ...config })),

    delete: <T = unknown>(url: string, config?: VerbConfig): Promise<T> =>
      unwrapData(ApiClient.getInstance().request<T>({ method: HttpMethod.DELETE, url, ...config })),

    post: <T = unknown>(url: string, data?: unknown, config?: VerbConfig): Promise<T> =>
      unwrapData(ApiClient.getInstance().request<T>({ method: HttpMethod.POST, url, data, ...config })),

    put: <T = unknown>(url: string, data?: unknown, config?: VerbConfig): Promise<T> =>
      unwrapData(ApiClient.getInstance().request<T>({ method: HttpMethod.PUT, url, data, ...config })),

    patch: <T = unknown>(url: string, data?: unknown, config?: VerbConfig): Promise<T> =>
      unwrapData(ApiClient.getInstance().request<T>({ method: HttpMethod.PATCH, url, data, ...config })),
  },
} as const;
