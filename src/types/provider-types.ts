import { QueryClientConfig } from '@tanstack/react-query';

/**
 * Configuration for QueryProvider
 */
export interface QueryProviderConfig {
  /** Custom QueryClient configuration */
  queryClientConfig?: QueryClientConfig;
}

/**
 * Configuration for CoreProvider
 */
export interface CoreProviderConfig {
  /** Query provider configuration */
  query?: QueryProviderConfig;
  /** Enable React Query DevTools in development (default: true) */
  enableDevTools?: boolean;
  /** Enable connectivity monitoring (default: true) */
  enableConnectivity?: boolean;
  /** Enable lifecycle management (default: true) */
  enableLifecycle?: boolean;
}
