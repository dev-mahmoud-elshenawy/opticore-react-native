import { QueryClient, type QueryClientConfig } from '@tanstack/react-query';
import { RenderError } from '../error/RenderError';
import { ApiError } from '../infrastructure/network/ApiError';

/** Default time a query stays fresh before refetching (5 minutes). */
const DEFAULT_STALE_TIME = 5 * 60 * 1000;
/** Default time unused/inactive data stays cached before garbage collection (10 minutes). */
const DEFAULT_GC_TIME = 10 * 60 * 1000;
/** Default retry attempts for transient (non-actionable) failures. */
const DEFAULT_MAX_RETRIES = 2;
/** Ceiling for both exponential backoff and any honored `Retry-After` delay. */
const MAX_BACKOFF_MS = 30000;

/**
 * Whether a failure is safe to retry. `ApiError` already classifies this
 * precisely (transient network/408/429/5xx vs. actionable 4xx); a plain
 * `RenderError` falls back to its `isActionable` flag; anything else (a
 * non-RenderError thrown from a queryFn) is retried up to the count limit.
 */
const isRetryable = (error: unknown): boolean => {
  if (error instanceof ApiError) return error.isRetryable;
  if (error instanceof RenderError) return !error.isActionable;
  return true;
};

/**
 * Exponential backoff capped at 30s, unless the error carries a server-provided
 * `Retry-After` delay (`ApiError.retryAfterMs`), which takes precedence.
 */
const retryDelay = (attemptIndex: number, error: unknown): number => {
  if (error instanceof ApiError && error.retryAfterMs !== undefined) {
    return Math.min(error.retryAfterMs, MAX_BACKOFF_MS);
  }
  return Math.min(1000 * 2 ** attemptIndex, MAX_BACKOFF_MS);
};

/**
 * Create a React Query client pre-wired with OptiCore-aware defaults.
 *
 * The retry policy is error-aware: OptiCore surfaces failures as `RenderError`
 * (e.g. `ApiError`). Actionable client errors (400/401/403/404/409/422, etc.)
 * are never retried — the user must fix something first. Transient failures
 * (network errors, 408, 429, 5xx) ARE retried, honoring a server-provided
 * `Retry-After` delay when present (falling back to exponential backoff
 * otherwise).
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
        gcTime: DEFAULT_GC_TIME,
        retry: (failureCount, error) => isRetryable(error) && failureCount < DEFAULT_MAX_RETRIES,
        retryDelay,
        refetchOnReconnect: true,
        // Mobile: don't refetch every time the app returns to the foreground.
        refetchOnWindowFocus: false,
        ...overrides?.defaultOptions?.queries,
      },
      mutations: {
        // Same error-awareness as queries: never retry an actionable 4xx
        // (validation/permission) mutation; retry transient failures once.
        retry: (failureCount, error) => isRetryable(error) && failureCount < 1,
        retryDelay,
        ...overrides?.defaultOptions?.mutations,
      },
    },
  });
}
