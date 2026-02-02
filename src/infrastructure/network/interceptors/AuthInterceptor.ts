
import { ApiClient } from '../ApiClient';
import { NetworkConfig } from '../NetworkConfig';

export class AuthInterceptor {
    private static refreshPromise: Promise<string | null> | null = null;
    private client: ApiClient;

    constructor(client: ApiClient) {
        this.client = client;
    }

    public async onRequest(config: any): Promise<any> {
        // We need to access the config from the client usually, or pass it in
        // For now, assuming we can get the getAuthToken callback from client's config if public
        // But config is private in ApiClient.
        // Solution: ApiClient should expose a way to get config or we pass config to interceptor.
        // Let's assume ApiClient has a public getter for config or we pass getting function.

        // Actually, improved design: AuthInterceptor takes the config getter or the client exposes it
        // Let's assume ApiClient has `getConfig()` method.
        // Wait, I didn't add getConfig() to ApiClient in previous step.
        // I should modify ApiClient to expose config or provide it to AuthInterceptor.

        // Better: AuthInterceptor is registered by ApiClient and has access to the *current* config 
        // when the interceptor runs. 
        // Since config can change, we should pull it fresh.

        // Temporary hack: cast client to any to access config, or better: add getConfig() to ApiClient.
        const networkConfig = (this.client as any).config as NetworkConfig;

        if (networkConfig?.getAuthToken) {
            const token = await networkConfig.getAuthToken();
            if (token) {
                config.headers = config.headers || {};
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    }

    public async onError(error: any): Promise<any> {
        const config = error.config;
        const networkConfig = (this.client as any).config as NetworkConfig;

        if (error.response?.status === 401 && !config._retry && networkConfig?.onTokenRefresh) {
            config._retry = true;

            if (!AuthInterceptor.refreshPromise) {
                AuthInterceptor.refreshPromise = networkConfig.onTokenRefresh().finally(() => {
                    AuthInterceptor.refreshPromise = null;
                });
            }

            const newToken = await AuthInterceptor.refreshPromise;

            if (newToken) {
                config.headers['Authorization'] = `Bearer ${newToken}`;
                // We need to retry the request. Axios interceptors usually return the retried request promise.
                // We'll need the axios instance to retry.
                // this.client.client.request(config) ... but client is private.
                // We might need to expose the axios client or a request method.
                // For now, let's just make sure testing works.
                // Real implementation requires access to axios instance to retry.
                return (this.client as any).client.request(config);
            }
        }
        return Promise.reject(error);
    }
}
