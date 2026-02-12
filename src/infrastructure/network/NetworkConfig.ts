import { AuthStrategy } from './AuthStrategy';

export interface NetworkConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;

  /**
   * Callback to get the current authentication token
   */
  getAuthToken?: () => Promise<string | null>;

  /**
   * Callback to refresh the authentication token when 401 occurs
   * Should return the new token
   */
  onTokenRefresh?: () => Promise<string | null>;

  /**
   * Custom authentication strategy
   * If provided, overrides getAuthToken/onTokenRefresh behavior
   */
  authStrategy?: AuthStrategy;
}
