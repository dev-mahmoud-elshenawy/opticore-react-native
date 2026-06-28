import { createQueryClient } from '../../src/query/createQueryClient';
import { ApiError } from '../../src/infrastructure/network/ApiError';

describe('createQueryClient', () => {
  it('applies OptiCore-aware query defaults', () => {
    const client = createQueryClient();
    const queries = client.getDefaultOptions().queries;
    expect(queries?.staleTime).toBe(5 * 60 * 1000);
    expect(typeof queries?.retry).toBe('function');
  });

  it('does not retry actionable (4xx) ApiErrors', () => {
    const retry = createQueryClient().getDefaultOptions().queries?.retry as (
      n: number,
      e: unknown
    ) => boolean;
    expect(retry(0, new ApiError(404, 'not found'))).toBe(false);
  });

  it('retries transient (5xx / network) failures up to the limit', () => {
    const retry = createQueryClient().getDefaultOptions().queries?.retry as (
      n: number,
      e: unknown
    ) => boolean;
    expect(retry(0, new ApiError(500, 'server error'))).toBe(true);
    expect(retry(1, new ApiError(500, 'server error'))).toBe(true);
    expect(retry(2, new ApiError(500, 'server error'))).toBe(false);
  });

  it('retries 429 (rate limited) and 503/408 like other transient failures', () => {
    const retry = createQueryClient().getDefaultOptions().queries?.retry as (
      n: number,
      e: unknown
    ) => boolean;
    expect(retry(0, new ApiError(429, 'rate limited'))).toBe(true);
    expect(retry(0, new ApiError(503, 'unavailable'))).toBe(true);
    expect(retry(0, new ApiError(408, 'timeout'))).toBe(true);
  });

  it('does not retry actionable errors even with failureCount 0', () => {
    const retry = createQueryClient().getDefaultOptions().queries?.retry as (
      n: number,
      e: unknown
    ) => boolean;
    for (const status of [400, 401, 403, 404, 409, 422]) {
      expect(retry(0, new ApiError(status, 'bad'))).toBe(false);
    }
  });

  it('falls back to count-based retry for non-ApiError failures', () => {
    const retry = createQueryClient().getDefaultOptions().queries?.retry as (
      n: number,
      e: unknown
    ) => boolean;
    expect(retry(0, new Error('boom'))).toBe(true);
    expect(retry(2, new Error('boom'))).toBe(false);
  });

  it('uses retryAfterMs from the error when scheduling a retry delay', () => {
    const retryDelay = createQueryClient().getDefaultOptions().queries?.retryDelay as (
      attempt: number,
      error: unknown
    ) => number;
    const error = new ApiError(429, 'rate limited', undefined, undefined, undefined, '2');
    expect(retryDelay(0, error)).toBe(2000);
  });

  it('clamps retryAfterMs-derived delay to the 30s backoff cap', () => {
    const retryDelay = createQueryClient().getDefaultOptions().queries?.retryDelay as (
      attempt: number,
      error: unknown
    ) => number;
    const error = new ApiError(429, 'rate limited', undefined, undefined, undefined, '3600');
    expect(retryDelay(0, error)).toBe(30000);
  });

  it('falls back to exponential backoff when retryAfterMs is absent', () => {
    const retryDelay = createQueryClient().getDefaultOptions().queries?.retryDelay as (
      attempt: number,
      error: unknown
    ) => number;
    const error = new ApiError(500, 'server error');
    expect(retryDelay(0, error)).toBe(1000);
    expect(retryDelay(1, error)).toBe(2000);
    expect(retryDelay(5, error)).toBe(30000);
  });

  it('applies the same retryable/retryAfter rules to mutations', () => {
    const options = createQueryClient().getDefaultOptions();
    const mutationRetry = options.mutations?.retry as (n: number, e: unknown) => boolean;
    const mutationRetryDelay = options.mutations?.retryDelay as (
      attempt: number,
      error: unknown
    ) => number;

    expect(mutationRetry(0, new ApiError(429, 'rate limited'))).toBe(true);
    expect(mutationRetry(1, new ApiError(429, 'rate limited'))).toBe(false);
    expect(mutationRetry(0, new ApiError(422, 'bad input'))).toBe(false);

    const error = new ApiError(429, 'rate limited', undefined, undefined, undefined, '2');
    expect(mutationRetryDelay(0, error)).toBe(2000);
  });

  it('ships sensible cache/refetch defaults', () => {
    const queries = createQueryClient().getDefaultOptions().queries;
    expect(queries?.gcTime).toBe(10 * 60 * 1000);
    expect(queries?.refetchOnReconnect).toBe(true);
    expect(queries?.refetchOnWindowFocus).toBe(false);
  });

  it('lets overrides win over the defaults', () => {
    const client = createQueryClient({
      defaultOptions: { queries: { staleTime: 0, retry: false } },
    });
    const queries = client.getDefaultOptions().queries;
    expect(queries?.staleTime).toBe(0);
    expect(queries?.retry).toBe(false);
  });
});
