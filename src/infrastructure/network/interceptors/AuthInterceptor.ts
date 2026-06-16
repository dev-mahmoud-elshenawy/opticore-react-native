import { InternalAxiosRequestConfig } from 'axios';
import { ApiClient } from '../ApiClient';
import { AuthRetryResult, BearerTokenStrategy } from '../AuthStrategy';

export class AuthInterceptor {
  private client: ApiClient;

  // Shared in-flight refresh so concurrent 401s collapse into ONE refresh call
  // instead of each firing its own (token-refresh stampede).
  private refreshPromise: Promise<AuthRetryResult | null> | null = null;

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

  public async onError(error: unknown): Promise<unknown> {
    const axiosError = error as { config?: InternalAxiosRequestConfig & { _retry?: boolean }; response?: { status?: number } };
    const config = axiosError.config;
    const networkConfig = this.client.config;

    // Check if we have a strategy or legacy callbacks
    let strategy = networkConfig.authStrategy;
    if (!strategy && networkConfig.getAuthToken) {
      strategy = new BearerTokenStrategy(
        networkConfig.getAuthToken,
        networkConfig.onTokenRefresh
      );
    }

    if (axiosError.response?.status === 401 && config && !config._retry && strategy) {
      // Collapse concurrent 401s onto a single refresh. The first caller starts
      // it; the rest await the same promise. Cleared on settle so a later 401
      // (e.g. token expired again) triggers a fresh refresh.
      if (!this.refreshPromise) {
        const activeStrategy = strategy;
        this.refreshPromise = Promise.resolve(activeStrategy.handleUnauthorized(error)).finally(
          () => {
            this.refreshPromise = null;
          },
        );
      }

      const retryConfig = await this.refreshPromise;

      if (retryConfig?.retry) {
        config._retry = true;
        // Re-run through the client so applyAuth re-attaches the refreshed token.
        return this.client.client.request(config);
      }
    }

    return Promise.reject(error);
  }
}
