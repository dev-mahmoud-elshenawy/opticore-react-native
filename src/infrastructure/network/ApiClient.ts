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

    // Update defaults without creating new instance (preserves interceptors)
    if (this._config.baseURL) this.client.defaults.baseURL = this._config.baseURL;
    if (this._config.timeout) this.client.defaults.timeout = this._config.timeout;
    if (this._config.headers) {
      this.client.defaults.headers.common = {
        ...this.client.defaults.headers.common,
        ...this._config.headers,
      } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }

  /**
   * Perform an HTTP request
   *
   * @param config - Request configuration with method, url, data, and headers
   * @returns Promise resolving to ApiResponse with typed data
   * @example
   * ```typescript
   * await apiClient.request({
   *   method: HttpMethod.POST,
   *   url: '/users',
   *   data: { name: 'John' },
   *   headers: { 'Content-Type': 'application/json' }
   * });
   * ```
   */
  public async request<T>(config: {
    method: HttpMethod;
    url: string;
    data?: unknown;
    headers?: Record<string, string>;
  }): Promise<ApiResponse<T>> {
    const axiosConfig: AxiosRequestConfig = { headers: config.headers };

    switch (config.method) {
      case HttpMethod.GET:
        return this.get<T>(config.url, axiosConfig);
      case HttpMethod.POST:
        return this.post<T>(config.url, config.data, axiosConfig);
      case HttpMethod.PUT:
        return this.put<T>(config.url, config.data, axiosConfig);
      case HttpMethod.DELETE:
        return this.delete<T>(config.url, axiosConfig);
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
