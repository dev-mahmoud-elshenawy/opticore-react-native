import React from 'react';
import { QueryClient, QueryClientProvider, QueryClientConfig } from '@tanstack/react-query';

/**
 * Configuration options for QueryProvider
 */
export interface QueryProviderConfig extends QueryClientConfig {}

/**
 * Props for QueryProvider component
 */
export interface QueryProviderProps {
  /** Child components to render within the provider */
  children: React.ReactNode;
  /** Optional custom QueryClient configuration */
  config?: QueryProviderConfig;
  /** Optional QueryClient instance (for testing or advanced use cases) */
  queryClient?: QueryClient;
}

/**
 * Default React Query configuration
 * Provides opinionated defaults for:
 * - Stale time: 5 minutes
 * - Cache time: 10 minutes
 * - Retry: 3 attempts with exponential backoff
 * - Error handling: Console warnings in development
 */
const defaultConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Consider data fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed queries 3 times
      retry: 3,
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus in production
      refetchOnWindowFocus: __DEV__ ? false : true,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Exponential backoff for mutation retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
};

/**
 * QueryProvider Component
 *
 * Wraps the application with React Query's QueryClientProvider,
 * providing configured defaults for:
 * - Cache and stale time management
 * - Automatic retry logic with exponential backoff
 * - Development tools integration
 * - Error handling strategies
 *
 * @example
 * ```tsx
 * // Basic usage with defaults
 * <QueryProvider>
 *   <App />
 * </QueryProvider>
 *
 * // With custom configuration
 * <QueryProvider
 *   config={{
 *     defaultOptions: {
 *       queries: {
 *         staleTime: 10 * 60 * 1000, // 10 minutes
 *         retry: 5,
 *       },
 *     },
 *   }}
 * >
 *   <App />
 * </QueryProvider>
 * ```
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({
  children,
  config,
  queryClient: customQueryClient,
}) => {
  // Use provided QueryClient or create a new one with merged config
  const queryClient = React.useMemo(() => {
    if (customQueryClient) {
      return customQueryClient;
    }

    // Merge default config with custom config
    const mergedConfig: QueryClientConfig = {
      ...defaultConfig,
      ...config,
      defaultOptions: {
        queries: {
          ...defaultConfig.defaultOptions?.queries,
          ...config?.defaultOptions?.queries,
        },
        mutations: {
          ...defaultConfig.defaultOptions?.mutations,
          ...config?.defaultOptions?.mutations,
        },
      },
    };

    return new QueryClient(mergedConfig);
  }, [config, customQueryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

/**
 * Hook to access the QueryClient instance
 * Re-exported for convenience
 */
export { useQueryClient } from '@tanstack/react-query';
