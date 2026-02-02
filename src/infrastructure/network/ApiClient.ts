import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { NetworkConfig } from './NetworkConfig';
import { ApiResponse } from './ApiResponse';
import { AuthInterceptor } from './interceptors/AuthInterceptor';
import { LoggingInterceptor } from './interceptors/LoggingInterceptor';
import { ErrorInterceptor } from './interceptors/ErrorInterceptor';

/**
 * Singleton API Client wrapper around Axios
 */
export class ApiClient {
    private static instance: ApiClient;
    public client: AxiosInstance;
    private _config: NetworkConfig = {};

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

    private setupInterceptors(): void {
        const authInterceptor = new AuthInterceptor(this);
        const loggingInterceptor = new LoggingInterceptor();
        const errorInterceptor = new ErrorInterceptor();

        this.client.interceptors.request.use(
            (config) => authInterceptor.onRequest(config),
            (error) => Promise.reject(error)
        );
        this.client.interceptors.request.use(
            (config) => loggingInterceptor.onRequest(config),
            (error) => Promise.reject(error)
        );

        this.client.interceptors.response.use(
            (response) => loggingInterceptor.onResponse(response),
            (error) => {
                // Chain error handling: Logging -> Auth (Refresh) -> Error Classification
                return loggingInterceptor.onError(error)
                    .catch(e => authInterceptor.onError(e))
                    .catch(e => errorInterceptor.onError(e));
            }
        );
    }

    public configure(config: NetworkConfig): void {
        this._config = { ...this._config, ...config };

        // Update defaults without creating new instance (preserves interceptors)
        if (this._config.baseURL) this.client.defaults.baseURL = this._config.baseURL;
        if (this._config.timeout) this.client.defaults.timeout = this._config.timeout;
        if (this._config.headers) {
            this.client.defaults.headers.common = {
                ...this.client.defaults.headers.common,
                ...this._config.headers
            } as any;
        }
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.client.get<T>(url, config);
        return {
            data: response.data,
            status: response.status,
            headers: response.headers,
            config: response.config,
        };
    }

    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.client.post<T>(url, data, config);
        return {
            data: response.data,
            status: response.status,
            headers: response.headers,
            config: response.config,
        };
    }

    public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.client.put<T>(url, data, config);
        return {
            data: response.data,
            status: response.status,
            headers: response.headers,
            config: response.config,
        };
    }

    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.client.delete<T>(url, config);
        return {
            data: response.data,
            status: response.status,
            headers: response.headers,
            config: response.config,
        };
    }

    public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.client.patch<T>(url, data, config);
        return {
            data: response.data,
            status: response.status,
            headers: response.headers,
            config: response.config,
        };
    }
}
