import { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

export interface AuthRetryResult {
    retry: boolean;
    tokenRefreshed?: boolean;
}

export interface AuthStrategy {
    /**
     * Apply authentication to the request config (e.g. add headers)
     */
    applyAuth(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;

    /**
     * Handle 401 Unauthorized errors
     * Return configuration for retry if handled, or null to propagate error
     */
    handleUnauthorized(error: unknown): Promise<AuthRetryResult | null>;
}

export class NoAuthStrategy implements AuthStrategy {
    applyAuth(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
        return config;
    }

    async handleUnauthorized(): Promise<AuthRetryResult | null> {
        return null;
    }
}

export class ApiKeyStrategy implements AuthStrategy {
    constructor(private headerName: string, private apiKey: string) { }

    applyAuth(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
        if (!config.headers) {
            config.headers = new AxiosHeaders();
        }
        config.headers[this.headerName] = this.apiKey;
        return config;
    }

    async handleUnauthorized(): Promise<AuthRetryResult | null> {
        return null;
    }
}

export class BearerTokenStrategy implements AuthStrategy {
    constructor(private getToken: () => Promise<string | null>, private onRefresh?: () => Promise<string | null>) { }

    async applyAuth(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
        const token = await this.getToken();
        if (token) {
            if (!config.headers) {
                config.headers = {} as any;
            }
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    }

    async handleUnauthorized(error: unknown): Promise<AuthRetryResult | null> {
        // Basic check for 401
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401 && this.onRefresh) {
            try {
                const newToken = await this.onRefresh();
                if (newToken) {
                    return { retry: true, tokenRefreshed: true };
                }
            } catch (_e) {
                // Refresh failed
                return null;
            }
        }
        return null;
    }
}
