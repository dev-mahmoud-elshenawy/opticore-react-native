import React from 'react';
import { QueryClient, QueryClientProvider, QueryClientConfig } from '@tanstack/react-query';
import { createQueryClient } from '../query/createQueryClient';

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
 * QueryProvider Component
 *
 * Wraps the application with React Query's QueryClientProvider. The default
 * client comes from {@link createQueryClient}, so the OptiCore-aware defaults
 * (5-min staleTime, 10-min gcTime, **error-aware retry** that skips actionable
 * 4xx `ApiError`s, no refetch-on-focus) apply everywhere — including inside
 * `OptiCoreProvider`. Pass `config` to tweak, or `queryClient` to inject your own.
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
  // Create the client ONCE and keep it stable across re-renders. Using useMemo
  // here would rebuild the client (wiping the cache) whenever `config` is an
  // inline object literal — a common consumer pattern. A ref avoids that.
  // An injected `customQueryClient` always wins, and a new one is adopted if
  // its identity changes.
  const clientRef = React.useRef<QueryClient | null>(null);
  if (customQueryClient && clientRef.current !== customQueryClient) {
    clientRef.current = customQueryClient;
  } else if (!clientRef.current) {
    clientRef.current = createQueryClient(config);
  }
  const queryClient = clientRef.current;

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

/**
 * Hook to access the QueryClient instance
 * Re-exported for convenience
 */
export { useQueryClient } from '@tanstack/react-query';
