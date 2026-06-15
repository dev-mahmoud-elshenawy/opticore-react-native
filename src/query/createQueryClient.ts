import { QueryClient, type QueryClientConfig } from '@tanstack/react-query';
import { RenderError } from '../error/RenderError';

/** Default time a query stays fresh before refetching (5 minutes). */
const DEFAULT_STALE_TIME = 5 * 60 * 1000;
/** Default retry attempts for transient (non-actionable) failures. */
const DEFAULT_MAX_RETRIES = 2;

/**
 * Create a React Query client pre-wired with OptiCore-aware defaults.
 *
 * The retry policy is error-aware: OptiCore surfaces failures as `RenderError`
 * (e.g. `ApiError`). Client errors (4xx) are `isActionable` — the user must fix
 * something, so retrying wastes requests; everything else is retried a couple
 * of times.
 *
 * All defaults are overridable: pass a standard `QueryClientConfig` and your
 * values are merged on top (yours win), so any app can customize freely.
 *
 * @example
 * ```typescript
 * // defaults:
 * export const queryClient = createQueryClient();
 *
 * // override only what you need:
 * export const queryClient = createQueryClient({
 *   defaultOptions: { queries: { staleTime: 0 } },
 * });
 * ```
 */
export function createQueryClient(overrides?: QueryClientConfig): QueryClient {
  return new QueryClient({
    ...overrides,
    defaultOptions: {
      ...overrides?.defaultOptions,
      queries: {
        staleTime: DEFAULT_STALE_TIME,
        retry: (failureCount, error) => {
          if (error instanceof RenderError && error.isActionable) return false;
          return failureCount < DEFAULT_MAX_RETRIES;
        },
        ...overrides?.defaultOptions?.queries,
      },
      mutations: {
        ...overrides?.defaultOptions?.mutations,
      },
    },
  });
}
