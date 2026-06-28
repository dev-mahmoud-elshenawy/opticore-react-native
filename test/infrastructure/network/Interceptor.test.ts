import { Interceptor } from '../../../src/infrastructure/network/Interceptor';
import { ApiClient } from '../../../src/infrastructure/network/ApiClient';
import axios from 'axios';

// Mock axios to prevent actual network calls
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiClient Interceptors', () => {
  let apiClient: ApiClient;

  // We need to access the private instance or mock the internal client creation
  // For these tests, we'll assume ApiClient exposes ways to add interceptors
  // and we'll verify they are registered with axios.

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock for axios.create
    const mockAxiosInstance = {
      interceptors: {
        request: {
          use: jest.fn().mockReturnValue(1),
          eject: jest.fn(),
        },
        response: {
          use: jest.fn().mockReturnValue(1),
          eject: jest.fn(),
        },
      },
      defaults: { headers: { common: {} } },
      get: jest.fn(),
      post: jest.fn(),
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    // Reset singleton specifically for testing
    // We need to cast to any to access private static instance
    (ApiClient as any).instance = undefined;

    apiClient = ApiClient.getInstance();
  });

  // Since we haven't modified ApiClient yet, these tests are expected to fail
  // or compile error until we implement the methods.
  // We are writing them TDD style.

  it('should register a request interceptor with axios', () => {
    const interceptor: Interceptor = {
      onRequest: jest.fn((config) => config),
    };
    apiClient.addRequestInterceptor(interceptor);

    // Verify axios.interceptors.request.use was called
    expect(apiClient.client.interceptors.request.use).toHaveBeenCalled();
  });

  it('should register a response interceptor with axios', () => {
    const interceptor: Interceptor = {
      onResponse: jest.fn((res) => res),
    };
    apiClient.addResponseInterceptor(interceptor);

    expect(apiClient.client.interceptors.response.use).toHaveBeenCalled();
  });

  it('should allow removing an interceptor', () => {
    const interceptor: Interceptor = { onRequest: jest.fn() };
    const id = apiClient.addRequestInterceptor(interceptor);

    // Mock eject
    const requestEject = apiClient.client.interceptors.request.eject as jest.Mock;

    const removed = apiClient.removeInterceptor(id);

    expect(removed).toBe(true);
    expect(requestEject).toHaveBeenCalled();
  });

  it('should return false when removing unknown interceptor', () => {
    const removed = apiClient.removeInterceptor(999);
    expect(removed).toBe(false);
  });

  // Note: To fully verify execution order (FIFO) and chaining, we'd need to integration test
  // with a real or fully emulated axios instance.
  // Since we're mocking axios, we mostly verify that we call `use` on the axios instance.
  // However, we can trust Axios to handle the execution order if we register them.

  it('should assign unique IDs to interceptors', () => {
    const i1: Interceptor = { onRequest: jest.fn() };
    const i2: Interceptor = { onRequest: jest.fn() };

    const id1 = apiClient.addRequestInterceptor(i1);
    const id2 = apiClient.addRequestInterceptor(i2);

    expect(id1).not.toBe(id2);
  });
});
