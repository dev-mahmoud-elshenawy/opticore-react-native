import { InternalAxiosRequestConfig } from 'axios';
import {
  BearerTokenStrategy,
  ApiKeyStrategy,
  NoAuthStrategy,
} from '../../../src/infrastructure/network/AuthStrategy';

describe('AuthStrategy', () => {
  let mockConfig: InternalAxiosRequestConfig;

  beforeEach(() => {
    mockConfig = {
      headers: {} as any,
    } as InternalAxiosRequestConfig;
  });

  describe('NoAuthStrategy', () => {
    it('should not modify headers', () => {
      const strategy = new NoAuthStrategy();
      const result = strategy.applyAuth({ ...mockConfig });
      expect(result.headers).toEqual({});
    });
  });

  describe('ApiKeyStrategy', () => {
    it('should add API key header', () => {
      const strategy = new ApiKeyStrategy('X-API-Key', 'secret');
      const result = strategy.applyAuth({ ...mockConfig });
      expect(result.headers['X-API-Key']).toBe('secret');
    });
  });

  describe('BearerTokenStrategy', () => {
    it('should add Authorization bearer header when token exists', async () => {
      const getToken = jest.fn().mockResolvedValue('token123');
      const strategy = new BearerTokenStrategy(getToken);

      const result = await strategy.applyAuth({ ...mockConfig });

      expect(getToken).toHaveBeenCalled();
      expect(result.headers['Authorization']).toBe('Bearer token123');
    });

    it('should not add header if no token', async () => {
      const getToken = jest.fn().mockResolvedValue(null);
      const strategy = new BearerTokenStrategy(getToken);

      const result = await strategy.applyAuth({ ...mockConfig });

      expect(result.headers['Authorization']).toBeUndefined();
    });

    it('should attempt refresh on 401', async () => {
      const onRefresh = jest.fn().mockResolvedValue('new_token');
      const strategy = new BearerTokenStrategy(jest.fn(), onRefresh);

      const error = { response: { status: 401 } };
      const result = await strategy.handleUnauthorized(error);

      expect(onRefresh).toHaveBeenCalled();
      expect(result).toEqual({ retry: true, tokenRefreshed: true });
    });

    it('should return null if refresh fails', async () => {
      const onRefresh = jest.fn().mockRejectedValue(new Error('fail'));
      const strategy = new BearerTokenStrategy(jest.fn(), onRefresh);

      const error = { response: { status: 401 } };
      const result = await strategy.handleUnauthorized(error);

      expect(result).toBeNull();
    });
  });
});
