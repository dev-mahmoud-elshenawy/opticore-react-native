import { ApiClient } from '../infrastructure/network/ApiClient';
import { HttpMethod } from '../infrastructure';
import type { RequestConfig } from '../types/Api.types';
import type { Interceptor, InterceptorId } from '../infrastructure/network/Interceptor';

/** Per-request options shared by every verb (everything except method/url/data). */
export type VerbConfig = Omit<RequestConfig, 'method' | 'url' | 'data'>;

/** One HTTP call → the response body (`T`). */
const send = <T>(config: RequestConfig): Promise<T> =>
  ApiClient.getInstance()
    .request<T>(config)
    .then((response) => response.data);

/**
 * The HTTP API for app code. Verbs return the response **body** (`T`) directly —
 * no `.getInstance()`, no `HttpMethod` enum, no `ApiResponse` wrapper.
 *
 * ```ts
 * const users = await api.get<User[]>('/users');
 * await api.post<Created>('/users', body);
 * api.setHeader('Accept-Language', 'ar');   // dynamic global header
 * const id = api.onRequest({ onRequest: (c) => c }); // custom interceptor
 * ```
 *
 * Every call goes through the fully-configured client (baseURL, default headers,
 * auth token injection + 401 refresh, interceptors, retry, `ApiError`). `T` is
 * per-call and defaults to `unknown`. Resolves the singleton lazily, so importing
 * this module is side-effect-free.
 */
export const api = {
  // --- requests (return the body) ---
  get: <T = unknown>(url: string, config?: VerbConfig): Promise<T> =>
    send<T>({ method: HttpMethod.GET, url, ...config }),

  delete: <T = unknown>(url: string, config?: VerbConfig): Promise<T> =>
    send<T>({ method: HttpMethod.DELETE, url, ...config }),

  post: <T = unknown>(url: string, data?: unknown, config?: VerbConfig): Promise<T> =>
    send<T>({ method: HttpMethod.POST, url, data, ...config }),

  put: <T = unknown>(url: string, data?: unknown, config?: VerbConfig): Promise<T> =>
    send<T>({ method: HttpMethod.PUT, url, data, ...config }),

  patch: <T = unknown>(url: string, data?: unknown, config?: VerbConfig): Promise<T> =>
    send<T>({ method: HttpMethod.PATCH, url, data, ...config }),

  // --- dynamic global headers ---
  setHeader: (name: string, value: string): void => ApiClient.getInstance().setHeader(name, value),
  setHeaders: (headers: Record<string, string>): void =>
    ApiClient.getInstance().setHeaders(headers),
  removeHeader: (name: string): void => ApiClient.getInstance().removeHeader(name),

  // --- interceptors (advanced) ---
  onRequest: (interceptor: Interceptor): InterceptorId =>
    ApiClient.getInstance().addRequestInterceptor(interceptor),
  onResponse: (interceptor: Interceptor): InterceptorId =>
    ApiClient.getInstance().addResponseInterceptor(interceptor),
  removeInterceptor: (id: InterceptorId): boolean => ApiClient.getInstance().removeInterceptor(id),

  // --- readiness ---
  isReady: (): boolean => ApiClient.getInstance().isInitialized(),
} as const;
