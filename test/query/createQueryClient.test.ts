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
      e: unknown,
    ) => boolean;
    expect(retry(0, new ApiError(404, 'not found'))).toBe(false);
  });

  it('retries transient (5xx / network) failures up to the limit', () => {
    const retry = createQueryClient().getDefaultOptions().queries?.retry as (
      n: number,
      e: unknown,
    ) => boolean;
    expect(retry(0, new ApiError(500, 'server error'))).toBe(true);
    expect(retry(1, new ApiError(500, 'server error'))).toBe(true);
    expect(retry(2, new ApiError(500, 'server error'))).toBe(false);
  });

  it('ships sensible cache/refetch defaults', () => {
    const queries = createQueryClient().getDefaultOptions().queries;
    expect(queries?.gcTime).toBe(10 * 60 * 1000);
    expect(queries?.refetchOnReconnect).toBe(true);
    expect(queries?.refetchOnWindowFocus).toBe(false);
  });

  it('lets overrides win over the defaults', () => {
    const client = createQueryClient({ defaultOptions: { queries: { staleTime: 0, retry: false } } });
    const queries = client.getDefaultOptions().queries;
    expect(queries?.staleTime).toBe(0);
    expect(queries?.retry).toBe(false);
  });
});
