import { InternalAxiosRequestConfig } from 'axios';
import { ApiClient } from '../ApiClient';
import { BearerTokenStrategy } from '../AuthStrategy';

export class AuthInterceptor {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  public async onRequest(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
    const networkConfig = this.client.config;
    let strategy = networkConfig.authStrategy;

    // Backward compatibility: use legacy callbacks if no strategy provided
    if (!strategy && networkConfig.getAuthToken) {
      strategy = new BearerTokenStrategy(
        networkConfig.getAuthToken,
        networkConfig.onTokenRefresh
      );
    }

    if (strategy) {
      return strategy.applyAuth(config);
    }

    return config;
  }

  public async onError(error: any): Promise<any> {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const networkConfig = this.client.config;

    // Check if we have a strategy or legacy callbacks
    let strategy = networkConfig.authStrategy;
    if (!strategy && networkConfig.getAuthToken) {
      strategy = new BearerTokenStrategy(
        networkConfig.getAuthToken,
        networkConfig.onTokenRefresh
      );
    }

    if (error.response?.status === 401 && !config._retry && strategy) {
      const retryConfig = await strategy.handleUnauthorized(error);

      if (retryConfig?.retry) {
        config._retry = true;
        // If the strategy refreshed the token, we might need to update the header
        // For BearerTokenStrategy, applyAuth fetches the new token.
        // So we just re-run the request via the client.

        // However, applyAuth modifies the config passed to it.
        // We should re-apply auth to the config before retrying?
        // Or just let the new request go through the interceptor chain again?

        // If we call client.request(config), it runs interceptors again.
        // BUT config already has headers.
        // BearerTokenStrategy.applyAuth will overwrite Authorization header if token exists.

        return this.client.client.request(config);
      }
    }

    return Promise.reject(error);
  }
}
