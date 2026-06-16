import { AuthInterceptor } from '../../../src/infrastructure/network/interceptors/AuthInterceptor';
import { ApiClient } from '../../../src/infrastructure/network/ApiClient';
import type { AuthStrategy } from '../../../src/infrastructure/network/AuthStrategy';

/**
 * Build a mock ApiClient exposing just the surface AuthInterceptor touches:
 * `.config` (network config with the auth strategy) and `.client.request`.
 */
function buildMockClient(strategy: AuthStrategy, innerRequest: jest.Mock): ApiClient {
  return {
    config: { authStrategy: strategy },
    client: { request: innerRequest },
  } as unknown as ApiClient;
}

const make401 = () => ({ config: {} as Record<string, unknown>, response: { status: 401 } });

describe('AuthInterceptor', () => {
  it('refreshes once for concurrent 401s (single-flight), then retries each request', async () => {
    let resolveRefresh: () => void = () => {};
    const refreshGate = new Promise<void>((resolve) => {
      resolveRefresh = resolve;
    });

    const handleUnauthorized = jest.fn(async () => {
      await refreshGate; // hold all callers until we release
      return { retry: true };
    });
    const strategy: AuthStrategy = {
      applyAuth: (c) => c,
      handleUnauthorized,
    };
    const innerRequest = jest.fn().mockResolvedValue({ data: 'ok', status: 200 });
    const interceptor = new AuthInterceptor(buildMockClient(strategy, innerRequest));

    const calls = Promise.all([
      interceptor.onError(make401()),
      interceptor.onError(make401()),
      interceptor.onError(make401()),
    ]);

    resolveRefresh();
    await calls;

    // One shared refresh, but every request gets retried.
    expect(handleUnauthorized).toHaveBeenCalledTimes(1);
    expect(innerRequest).toHaveBeenCalledTimes(3);
  });

  it('allows a fresh refresh after the in-flight one settles', async () => {
    const handleUnauthorized = jest.fn().mockResolvedValue({ retry: true });
    const strategy: AuthStrategy = { applyAuth: (c) => c, handleUnauthorized };
    const innerRequest = jest.fn().mockResolvedValue({ data: 'ok', status: 200 });
    const interceptor = new AuthInterceptor(buildMockClient(strategy, innerRequest));

    await interceptor.onError(make401());
    await interceptor.onError(make401());

    // Sequential (non-overlapping) 401s each get their own refresh.
    expect(handleUnauthorized).toHaveBeenCalledTimes(2);
  });

  it('rejects without retry when refresh declines', async () => {
    const handleUnauthorized = jest.fn().mockResolvedValue(null);
    const strategy: AuthStrategy = { applyAuth: (c) => c, handleUnauthorized };
    const innerRequest = jest.fn();
    const interceptor = new AuthInterceptor(buildMockClient(strategy, innerRequest));

    await expect(interceptor.onError(make401())).rejects.toBeDefined();
    expect(innerRequest).not.toHaveBeenCalled();
  });
});
