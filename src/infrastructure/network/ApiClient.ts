import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { NetworkConfig } from './NetworkConfig';
import { ApiResponse } from './ApiResponse';
import { HttpMethod } from './HttpMethod';
import { AuthInterceptor } from './interceptors/AuthInterceptor';
import { LoggingInterceptor } from './interceptors/LoggingInterceptor';
import { ErrorInterceptor } from './interceptors/ErrorInterceptor';
import { Interceptor, InterceptorId } from './Interceptor';
import type { RequestConfig } from '../../types/Api.types';

/**
 * ApiClient - Singleton HTTP client for making API requests
 *
 * Provides a configured Axios instance with built-in:
 * - Authentication (automatic token injection and refresh)
 * - Request/response logging
 * - Standardized error handling
 *
 * @example
 * ```typescript
 * const apiClient = ApiClient.getInstance();
 * apiClient.configure({
 *   baseURL: 'https://api.example.com',
 *   timeout: 10000,
 * });
 *
 * const response = await apiClient.get<User>('/users/123');
 * ```
 */
export class ApiClient {
  private static instance: ApiClient;
  public client: AxiosInstance;
  private _config: NetworkConfig = {};

  // Becomes true after the first configure() call (which CoreSetup.init performs).
  // Guards against firing requests before the client is set up — see request().
  private _initialized = false;

  // Track interceptors for removal
  private interceptors = new Map<InterceptorId, { type: 'request' | 'response'; axiosId: number }>();
  private nextInterceptorId = 1;

  private constructor() {
    this.client = axios.create();
    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public get config(): NetworkConfig {
    return this._config;
  }

  /**
   * Whether {@link configure} has run (i.e. the client is ready for requests).
   * Lets imperative call sites guard gracefully instead of catching the
   * "called before initialization" error thrown by {@link request}.
   */
  public isInitialized(): boolean {
    return this._initialized;
  }

  /**
   * Add a custom request interceptor
   * 
   * @param interceptor - Interceptor with onRequest/onError methods
   * @returns InterceptorId for removal
   */
  public addRequestInterceptor(interceptor: Interceptor): InterceptorId {
    const onFulfilled = interceptor.onRequest
      ? (config: InternalAxiosRequestConfig) => interceptor.onRequest!(config) as InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>
      : undefined;

    const onRejected = interceptor.onError
      ? (error: unknown) => interceptor.onError!(error)
      : undefined;

    const axiosId = this.client.interceptors.request.use(onFulfilled, onRejected);
    const id = this.nextInterceptorId++;

    this.interceptors.set(id, { type: 'request', axiosId });
    return id;
  }

  /**
   * Add a custom response interceptor
   * 
   * @param interceptor - Interceptor with onResponse/onError methods
   * @returns InterceptorId for removal
   */
  public addResponseInterceptor(interceptor: Interceptor): InterceptorId {
    const onFulfilled = interceptor.onResponse
      ? (response: AxiosResponse) => interceptor.onResponse!(response)
      : undefined;

    const onRejected = interceptor.onError
      ? (error: unknown) => interceptor.onError!(error)
      : undefined;

    const axiosId = this.client.interceptors.response.use(onFulfilled, onRejected);
    const id = this.nextInterceptorId++;

    this.interceptors.set(id, { type: 'response', axiosId });
    return id;
  }

  /**
   * Remove a registered interceptor
   * 
   * @param id - InterceptorId returned from addRequestInterceptor/addResponseInterceptor
   * @returns true if removed, false if not found
   */
  public removeInterceptor(id: InterceptorId): boolean {
    const info = this.interceptors.get(id);
    if (!info) return false;

    if (info.type === 'request') {
      this.client.interceptors.request.eject(info.axiosId);
    } else {
      this.client.interceptors.response.eject(info.axiosId);
    }

    this.interceptors.delete(id);
    return true;
  }

  private setupInterceptors(): void {
    const authInterceptor = new AuthInterceptor(this);
    const loggingInterceptor = new LoggingInterceptor();
    const errorInterceptor = new ErrorInterceptor();

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => authInterceptor.onRequest(config),
      (error: unknown) => Promise.reject(error)
    );
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => loggingInterceptor.onRequest(config),
      (error: unknown) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => loggingInterceptor.onResponse(response),
      (error: unknown) => {
        // Chain error handling: Logging -> Auth (Refresh) -> Error Classification
        return loggingInterceptor
          .onError(error)
          .catch((e: unknown) => authInterceptor.onError(e))
          .catch((e: unknown) => errorInterceptor.onError(e));
      }
    );
  }

  /**
   * Configure the API client with base settings
   *
   * @param config - Network configuration including baseURL, timeout, headers, auth callbacks
   * @example
   * ```typescript
   * apiClient.configure({
   *   baseURL: 'https://api.example.com',
   *   timeout: 10000,
   *   headers: { 'X-App-Version': '1.0.0' },
   *   getAuthToken: async () => await storage.get('auth_token'),
   * });
   * ```
   */
  public configure(config: NetworkConfig): void {
    this._config = { ...this._config, ...config };
    this._initialized = true;

    // Update defaults without creating new instance (preserves interceptors).
    // Use `!== undefined` so legitimate values like `timeout: 0` ("no timeout")
    // and `baseURL: ''` are honored instead of dropped by a truthiness check.
    if (this._config.baseURL !== undefined) this.client.defaults.baseURL = this._config.baseURL;
    if (this._config.timeout !== undefined) this.client.defaults.timeout = this._config.timeout;
    if (this._config.headers) {
      this.client.defaults.headers.common = {
        ...this.client.defaults.headers.common,
        ...this._config.headers,
      } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }

  /**
   * Set/replace a single default header applied to every subsequent request.
   * Preserves interceptors and other defaults. Use for dynamic global headers
   * (e.g. `Accept-Language` after a locale change).
   */
  public setHeader(name: string, value: string): void {
    this.client.defaults.headers.common[name] = value;
  }

  /** Merge several default headers at once (see {@link setHeader}). */
  public setHeaders(headers: Record<string, string>): void {
    this.client.defaults.headers.common = {
      ...this.client.defaults.headers.common,
      ...headers,
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  /** Remove a previously-set default header. */
  public removeHeader(name: string): void {
    delete this.client.defaults.headers.common[name];
  }

  /**
   * Perform an HTTP request
   *
   * @param config - Request configuration with method, url, data, and headers
   * @returns Promise resolving to ApiResponse with typed data
   * @example
   * ```typescript
   * const controller = new AbortController();
   * await apiClient.request({
   *   method: HttpMethod.POST,
   *   url: '/users',
   *   data: { name: 'John' },
   *   headers: { 'Content-Type': 'application/json' },
   *   signal: controller.signal, // controller.abort() cancels (e.g. on unmount)
   * });
   * ```
   */
  public async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    // Fail fast instead of silently sending a request with no baseURL/auth.
    // configure() runs via CoreSetup.init(), which OptiCoreProvider calls
    // synchronously before children render — so this only fires for genuinely
    // premature (pre-init) calls.
    if (!this._initialized) {
      throw new Error(
        'ApiClient.request() was called before initialization. Wrap your app in ' +
          '<OptiCoreProvider> (recommended), or call CoreSetup.getInstance().init(config) ' +
          'or ApiClient.getInstance().configure(config) before making requests.',
      );
    }

    const axiosConfig: AxiosRequestConfig = { headers: config.headers };
    if (config.signal) axiosConfig.signal = config.signal;
    if (config.params !== undefined) axiosConfig.params = config.params;

    switch (config.method) {
      case HttpMethod.GET:
        return this.get<T>(config.url, axiosConfig);
      case HttpMethod.POST:
        return this.post<T>(config.url, config.data, axiosConfig);
      case HttpMethod.PUT:
        return this.put<T>(config.url, config.data, axiosConfig);
      case HttpMethod.DELETE:
        // Forward `data` so DELETE-with-body endpoints work (Axios supports it).
        return this.delete<T>(config.url, { ...axiosConfig, data: config.data });
      case HttpMethod.PATCH:
        return this.patch<T>(config.url, config.data, axiosConfig);
      default:
        throw new Error(`Unsupported HTTP method: ${config.method}`);
    }
  }

  /**
   * Perform a GET request
   *
   * @param url - Request URL (relative to baseURL if configured)
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to ApiResponse with typed data
   * @throws ApiError on request failure
   */
  private async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<T>(url, config);
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, unknown>,
      config: response.config,
    };
  }

  /**
   * Perform a POST request
   *
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to ApiResponse with typed data
   */
  private async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, unknown>,
      config: response.config,
    };
  }

  /**
   * Perform a PUT request
   *
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to ApiResponse with typed data
   */
  private async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, unknown>,
      config: response.config,
    };
  }

  /**
   * Perform a DELETE request
   *
   * @param url - Request URL
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to ApiResponse with typed data
   */
  private async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<T>(url, config);
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, unknown>,
      config: response.config,
    };
  }

  /**
   * Perform a PATCH request
   *
   * @param url - Request URL
   * @param data - Request body data (partial update)
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to ApiResponse with typed data
   */
  private async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, unknown>,
      config: response.config,
    };
  }
}

export { HttpMethod };
