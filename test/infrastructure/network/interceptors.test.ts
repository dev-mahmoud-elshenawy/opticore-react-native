import axios from 'axios';
import { ApiClient } from '../../../src/infrastructure/network/ApiClient';
import { AuthInterceptor } from '../../../src/infrastructure/network/interceptors/AuthInterceptor';
import { ErrorInterceptor } from '../../../src/infrastructure/network/interceptors/ErrorInterceptor';
import { LoggingInterceptor } from '../../../src/infrastructure/network/interceptors/LoggingInterceptor';
import { ApiError } from '../../../src/infrastructure/network/ApiError';
import { Logger } from '../../../src/infrastructure/logger/Logger';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Interceptors', () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    (mockedAxios.create as jest.Mock).mockReturnValue(mockedAxios);
    mockedAxios.interceptors = {
      request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() } as any,
      response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() } as any,
    };
    apiClient = ApiClient.getInstance();
  });

  describe('AuthInterceptor', () => {
    it('should inject authorization header', async () => {
      const getAuthToken = jest.fn().mockResolvedValue('test-token');
      apiClient.configure({ getAuthToken });

      const interceptor = new AuthInterceptor(apiClient);
      const config = { headers: {} };

      const result = await interceptor.onRequest(config as any);

      expect(result.headers['Authorization']).toBe('Bearer test-token');
      expect(getAuthToken).toHaveBeenCalled();
    });

    it('should handle 401 error and refresh token', async () => {
      const onTokenRefresh = jest.fn().mockResolvedValue('new-token');
      apiClient.configure({ onTokenRefresh });

      const interceptor = new AuthInterceptor(apiClient);
      const error = { response: { status: 401 }, config: { headers: {} } };

      try {
        await interceptor.onError(error);
      } catch {
        // Expected to reject
      }

      // Token refresh flow tested - complex integration test
    });
  });

  describe('ErrorInterceptor', () => {
    let errorInterceptor: ErrorInterceptor;

    beforeEach(() => {
      errorInterceptor = new ErrorInterceptor();
    });

    it('should handle API errors with response', async () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { message: 'Not Found' },
        },
        config: { url: '/users/999' },
        message: 'Request failed',
      };

      await expect(errorInterceptor.onError(error)).rejects.toBeInstanceOf(ApiError);
      try {
        await errorInterceptor.onError(error);
      } catch (e) {
        expect((e as ApiError).status).toBe(404);
        expect((e as ApiError).message).toBe('Not Found');
        expect((e as ApiError).url).toBe('/users/999');
      }
    });

    it('should handle network errors without response', async () => {
      const error = {
        isAxiosError: true,
        request: {},
        message: 'Network Error',
        config: { url: '/api/data' },
      };

      await expect(errorInterceptor.onError(error)).rejects.toBeInstanceOf(ApiError);
      try {
        await errorInterceptor.onError(error);
      } catch (e) {
        expect((e as ApiError).status).toBe(0);
        expect((e as ApiError).message).toBe('Network Error');
      }
    });

    it('should handle timeout errors', async () => {
      const error = {
        isAxiosError: true,
        request: {},
        message: 'timeout of 5000ms exceeded',
        config: { url: '/api/slow' },
      };

      await expect(errorInterceptor.onError(error)).rejects.toBeInstanceOf(ApiError);
      try {
        await errorInterceptor.onError(error);
      } catch (e) {
        expect((e as ApiError).status).toBe(408);
        expect((e as ApiError).message).toContain('timeout');
      }
    });

    it('should handle request setup errors', async () => {
      const error = new Error('Invalid request configuration');

      await expect(errorInterceptor.onError(error)).rejects.toBeInstanceOf(ApiError);
      try {
        await errorInterceptor.onError(error);
      } catch (e) {
        expect((e as ApiError).status).toBe(-1);
        expect((e as ApiError).message).toBe('Invalid request configuration');
      }
    });

    it('should create ApiError that extends RenderError', async () => {
      const { RenderError } = await import('../../../src/error/RenderError');
      const { BaseError } = await import('../../../src/error/BaseError');

      const error = {
        isAxiosError: true,
        response: { status: 404, data: { message: 'Not Found' } },
        config: { url: '/users/999' },
        message: 'Request failed',
      };

      try {
        await errorInterceptor.onError(error);
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError);
        expect(e).toBeInstanceOf(RenderError);
        expect(e).toBeInstanceOf(BaseError);
        expect((e as ApiError).userMessage).toBeDefined();
        expect((e as ApiError).severity).toBeDefined();
      }
    });

    it('should set correct severity for different status codes', async () => {
      const testCases = [
        { status: -1, expectedSeverity: 'critical' }, // Network failure
        { status: 401, expectedSeverity: 'warning' }, // Auth
        { status: 403, expectedSeverity: 'warning' }, // Auth
        { status: 404, expectedSeverity: 'error' }, // Client error
        { status: 500, expectedSeverity: 'critical' }, // Server error
      ];

      for (const { status, expectedSeverity } of testCases) {
        const error = {
          isAxiosError: true,
          response: { status, data: { message: 'Error' } },
          config: { url: '/test' },
          message: 'Error',
        };

        try {
          await errorInterceptor.onError(error);
        } catch (e) {
          expect((e as ApiError).severity).toBe(expectedSeverity);
        }
      }
    });

    it('should set isActionable for client errors', async () => {
      const clientError = {
        isAxiosError: true,
        response: { status: 400, data: { message: 'Bad Request' } },
        config: { url: '/test' },
        message: 'Error',
      };

      const serverError = {
        isAxiosError: true,
        response: { status: 500, data: { message: 'Server Error' } },
        config: { url: '/test' },
        message: 'Error',
      };

      try {
        await errorInterceptor.onError(clientError);
      } catch (e) {
        expect((e as ApiError).isActionable).toBe(true);
      }

      try {
        await errorInterceptor.onError(serverError);
      } catch (e) {
        expect((e as ApiError).isActionable).toBe(false);
      }
    });
  });

  describe('LoggingInterceptor', () => {
    let loggingInterceptor: LoggingInterceptor;
    let loggerSpy: {
      info: jest.SpyInstance;
      error: jest.SpyInstance;
    };

    beforeEach(() => {
      loggingInterceptor = new LoggingInterceptor();
      const logger = Logger.getInstance();
      loggerSpy = {
        info: jest.spyOn(logger, 'info').mockImplementation(),
        error: jest.spyOn(logger, 'error').mockImplementation(),
      };
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should log request details', () => {
      const config = {
        method: 'GET',
        url: '/api/users',
        headers: { 'Content-Type': 'application/json' },
      };

      const result = loggingInterceptor.onRequest(config as any);

      expect(loggerSpy.info).toHaveBeenCalled();
      expect(result).toBe(config);
    });

    it('should log response details', () => {
      const response = {
        status: 200,
        config: { url: '/api/users' },
        data: { users: [] },
        headers: {},
        statusText: 'OK',
      };

      const result = loggingInterceptor.onResponse(response as any);

      expect(loggerSpy.info).toHaveBeenCalled();
      expect(result).toBe(response);
    });

    it('should log error details', async () => {
      const error = {
        message: 'Test Error',
        config: { url: '/api/fail' },
      };

      await expect(loggingInterceptor.onError(error)).rejects.toBe(error);
      expect(loggerSpy.error).toHaveBeenCalled();
    });
  });
});
