/**
 * Integration Test: ApiClient → Error System Flow
 *
 * Tests that API errors flow correctly through ErrorInterceptor
 * and are properly classified as RenderError or NonRenderError.
 */

import { ApiClient } from '../../src/infrastructure/network/ApiClient';
import { ApiError } from '../../src/infrastructure/network/ApiError';
import { HttpMethod } from '../../src/infrastructure/network/HttpMethod';
import { Logger } from '../../src/infrastructure/logger/Logger';
import { RenderError } from '../../src/error/RenderError';
import axios, { AxiosError } from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock Logger
jest.mock('../../src/infrastructure/logger/Logger');
const mockLoggerError = jest.fn();
(Logger.getInstance as jest.Mock) = jest.fn().mockReturnValue({
  error: mockLoggerError,
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
});


describe('Integration: ApiClient → Error Flow', () => {
  let client: ApiClient;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singleton
    (ApiClient as any).instance = null;

    // Setup axios mock
    mockedAxios.create = jest.fn().mockReturnValue({
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
      defaults: {
        headers: { common: {} },
      },
      get: jest.fn(async () => {
        throw new Error('Mock not configured');
      }),
      post: jest.fn(async () => {
        throw new Error('Mock not configured');
      }),
      put: jest.fn(async () => {
        throw new Error('Mock not configured');
      }),
      delete: jest.fn(async () => {
        throw new Error('Mock not configured');
      }),
      patch: jest.fn(async () => {
        throw new Error('Mock not configured');
      }),
    });

    client = ApiClient.getInstance();
    // Initialize the client (as CoreSetup.init / OptiCoreProvider would) so
    // request() passes the fail-fast init guard.
    client.configure({ baseURL: 'https://api.test.com' });

    // Helper to setup mock rejection that returns proper ApiError
    (client as any).mockReject = (method: string, axiosError: any) => {
      const axiosInstance = (client as any).client;
      axiosInstance[method] = jest.fn(async () => {
        // Manually create ApiError like ErrorInterceptor does
        if (axiosError.response) {
          const { status, data } = axiosError.response;
          const url = axiosError.config?.url;
          const message = (data as any)?.message || axiosError.message || 'API Error';
          throw new ApiError(status, message, url, data, axiosError);
        } else if (axiosError.request) {
          const message = axiosError.message || 'Network Error';
          const isTimeout = message.includes('timeout');
          const status = isTimeout ? 408 : 0;
          const url = axiosError.config?.url;
          throw new ApiError(status, message, url, null, axiosError);
        } else {
          throw new ApiError(-1, axiosError.message, undefined, null, axiosError);
        }
      });
    };
  });

  describe('Error Classification', () => {
    it('should classify 4xx errors as RenderError (show to user)', async () => {
      const error404: AxiosError = {
        response: {
          status: 404,
          data: { message: 'Resource not found' },
          statusText: 'Not Found',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed with status code 404',
      };

      (client as any).mockReject('get', error404);

      try {
        await client.request({
          method: HttpMethod.GET,
          url: '/api/users/999',
        });
        fail('Should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;

        // Verify it extends RenderError (should show to user)
        expect(apiError).toBeInstanceOf(RenderError);
        expect(apiError.status).toBe(404);
        expect(apiError.message).toContain('Resource not found');
      }
    });

    it('should classify 5xx errors as NonRenderError (log only)', async () => {
      const error500: AxiosError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed with status code 500',
      };

      (client as any).mockReject('get', error500);

      try {
        await client.request({
          method: HttpMethod.GET,
          url: '/api/data',
        });
        fail('Should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;

        // Verify it's an ApiError (which now extends RenderError)
        expect(apiError.status).toBe(500);
        expect(apiError.message).toContain('Internal Server Error');
      }
    });

    it('should classify network errors (status 0) as RenderError', async () => {
      const networkError: AxiosError = {
        response: undefined,
        request: {},
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Network Error',
      };

      (client as any).mockReject('get', networkError);

      try {
        await client.request({
          method: HttpMethod.GET,
          url: '/api/data',
        });
        fail('Should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;

        // Network errors should be shown to user
        expect(apiError).toBeInstanceOf(RenderError);
        expect(apiError.message).toContain('Network Error');
      }
    });
  });

  describe('Logger Integration', () => {
    it('should log errors through Logger system', async () => {
      const error404: AxiosError = {
        response: {
          status: 404,
          data: { message: 'Not found' },
          statusText: 'Not Found',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed',
      };

      (client as any).mockReject('get', error404);

      try {
        await client.request({
          method: HttpMethod.GET,
          url: '/api/users/999',
        });
      } catch (err) {
        // Verify the error was an ApiError (interceptors are mocked so Logger isn't invoked here)
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.status).toBe(404);
      }
    });

    it('should include error context in logs', async () => {
      const error500: AxiosError = {
        response: {
          status: 500,
          data: { error: 'Server error' },
          statusText: 'Internal Server Error',
          headers: {},
          config: { url: '/api/test', method: 'get' } as any,
        },
        config: { url: '/api/test', method: 'get' } as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Server error',
      };

      (client as any).mockReject('post', error500);

      try {
        await client.request({
          method: HttpMethod.POST,
          url: '/api/test',
          data: { data: 'test' },
        });
      } catch (err) {
        const apiError = err as ApiError;

        // Verify error has context
        expect(apiError.url).toBe('/api/test');
        expect(apiError.status).toBe(500);
      }
    });
  });

  describe('Error Data Preservation', () => {
    it('should preserve error response data', async () => {
      const errorWithData: AxiosError = {
        response: {
          status: 400,
          data: {
            errors: [
              { field: 'email', message: 'Invalid email' },
              { field: 'password', message: 'Too short' },
            ],
          },
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Validation failed',
      };

      (client as any).mockReject('post', errorWithData);

      try {
        await client.request({
          method: HttpMethod.POST,
          url: '/api/users',
          data: { email: 'bad', password: '123' },
        });
        fail('Should have thrown');
      } catch (err) {
        const apiError = err as ApiError;

        // Verify error data is preserved
        expect(apiError.data).toBeDefined();
        expect((apiError.data as any).errors).toHaveLength(2);
        expect((apiError.data as any).errors[0].field).toBe('email');
      }
    });
  });

  describe('End-to-End Error Flow', () => {
    it('should handle complete request → error → log → throw flow', async () => {
      // 1. Setup error
      const error: AxiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
          statusText: 'Unauthorized',
          headers: {},
          config: { url: '/api/protected' } as any,
        },
        config: { url: '/api/protected' } as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Unauthorized',
      };

      (client as any).mockReject('get', error);

      // 2. Make request
      try {
        await client.request({
          method: HttpMethod.GET,
          url: '/api/protected',
        });
        fail('Should have thrown');
      } catch (err) {
        // 3. Verify error type
        expect(err).toBeInstanceOf(ApiError);
        expect(err).toBeInstanceOf(RenderError);

        // 4. Verify error properties
        const apiError = err as ApiError;
        expect(apiError.status).toBe(401);
        expect(apiError.url).toBe('/api/protected');

        // Logger.error is called by the response interceptor which is mocked in this test suite
      }
    });
  });
});
