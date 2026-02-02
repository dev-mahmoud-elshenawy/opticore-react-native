import { InternalAxiosRequestConfig } from 'axios';
import { ApiClient } from '../ApiClient';
import { NetworkConfig } from '../NetworkConfig';

export class AuthInterceptor {
    private static refreshPromise: Promise<string | null> | null = null;
    private client: ApiClient;

    constructor(client: ApiClient) {
        this.client = client;
    }

    public async onRequest(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
        const networkConfig = this.client.config;

        if (networkConfig?.getAuthToken) {
            const token = await networkConfig.getAuthToken();
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    }

    public async onError(error: any): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
        const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean }; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
        const networkConfig = this.client.config;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-optional-chaining
        if (error.response?.status === 401 && !config._retry && networkConfig?.onTokenRefresh) {
            config._retry = true;

            if (!AuthInterceptor.refreshPromise) {
                AuthInterceptor.refreshPromise = networkConfig.onTokenRefresh().finally(() => {
                    AuthInterceptor.refreshPromise = null;
                });
            }

            const newToken = await AuthInterceptor.refreshPromise;

            if (newToken && config.headers) {
                config.headers.Authorization = `Bearer ${newToken}`;
                // Retry request
                return this.client.client.request(config);
            }
        }
        return Promise.reject(error);
    }
}
