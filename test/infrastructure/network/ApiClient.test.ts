import axios from 'axios';
import { ApiClient } from '../../../src/infrastructure/network/ApiClient';
import { HttpMethod } from '../../../src/infrastructure/network/HttpMethod';
import { NetworkConfig } from '../../../src/infrastructure/network/NetworkConfig';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiClient', () => {
  let apiClient: ApiClient;
  const defaultConfig: NetworkConfig = {
    baseURL: 'https://api.example.com',
    timeout: 5000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockedAxios as any);
    mockedAxios.interceptors = {
      request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
    };
    apiClient = ApiClient.getInstance();
    apiClient.configure(defaultConfig);
  });

  it('should initialize with correct configuration', () => {
    // Since we update defaults instead of re-creating, checking create args is no longer valid
    // Verify the public config getter returns what we set
    expect(apiClient.config).toMatchObject({
      baseURL: defaultConfig.baseURL,
      timeout: defaultConfig.timeout,
    });
  });

  it('should make GET request and return typed response', async () => {
    const mockResponse = { data: { id: 1, name: 'Test' }, status: 200, headers: {} };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const response = await apiClient.request<{ id: number; name: string }>({
      method: HttpMethod.GET,
      url: '/users/1',
    });

    expect(mockedAxios.get).toHaveBeenCalledWith('/users/1', { headers: undefined });
    expect(response.data).toEqual({ id: 1, name: 'Test' });
  });

  it('should make POST request with data', async () => {
    const mockData = { name: 'New User' };
    const mockResponse = { data: { id: 2, ...mockData }, status: 201, headers: {} };
    mockedAxios.post.mockResolvedValue(mockResponse);

    const response = await apiClient.request<{ id: number; name: string }>({
      method: HttpMethod.POST,
      url: '/users',
      data: mockData,
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/users', mockData, { headers: undefined });
    expect(response.data).toEqual({ id: 2, name: 'New User' });
  });

  it('should make PUT request with data', async () => {
    const mockData = { name: 'Updated User' };
    const mockResponse = { data: { id: 1, ...mockData }, status: 200, headers: {} };
    mockedAxios.put.mockResolvedValue(mockResponse);

    const response = await apiClient.request<{ id: number; name: string }>({
      method: HttpMethod.PUT,
      url: '/users/1',
      data: mockData,
    });

    expect(mockedAxios.put).toHaveBeenCalledWith('/users/1', mockData, { headers: undefined });
    expect(response.data).toEqual({ id: 1, name: 'Updated User' });
  });

  it('should make DELETE request', async () => {
    const mockResponse = { data: { success: true }, status: 200, headers: {} };
    mockedAxios.delete.mockResolvedValue(mockResponse);

    const response = await apiClient.request<{ success: boolean }>({
      method: HttpMethod.DELETE,
      url: '/users/1',
    });

    expect(mockedAxios.delete).toHaveBeenCalledWith('/users/1', { headers: undefined });
    expect(response.data).toEqual({ success: true });
  });

  it('should make PATCH request with partial data', async () => {
    const mockData = { name: 'Patched User' };
    const mockResponse = { data: { id: 1, ...mockData }, status: 200, headers: {} };
    mockedAxios.patch.mockResolvedValue(mockResponse);

    const response = await apiClient.request<{ id: number; name: string }>({
      method: HttpMethod.PATCH,
      url: '/users/1',
      data: mockData,
    });

    expect(mockedAxios.patch).toHaveBeenCalledWith('/users/1', mockData, { headers: undefined });
    expect(response.data).toEqual({ id: 1, name: 'Patched User' });
  });

  it('should forward an AbortSignal to the underlying request', async () => {
    const mockResponse = { data: { ok: true }, status: 200, headers: {} };
    mockedAxios.get.mockResolvedValue(mockResponse);
    const controller = new AbortController();

    await apiClient.request<{ ok: boolean }>({
      method: HttpMethod.GET,
      url: '/users/1',
      signal: controller.signal,
    });

    expect(mockedAxios.get).toHaveBeenCalledWith('/users/1', {
      headers: undefined,
      signal: controller.signal,
    });
  });

  it('should forward an AbortSignal on POST requests', async () => {
    const mockResponse = { data: { id: 2 }, status: 201, headers: {} };
    mockedAxios.post.mockResolvedValue(mockResponse);
    const controller = new AbortController();

    await apiClient.request<{ id: number }>({
      method: HttpMethod.POST,
      url: '/users',
      data: { name: 'x' },
      signal: controller.signal,
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/users',
      { name: 'x' },
      { headers: undefined, signal: controller.signal }
    );
  });

  it('should update configuration when configure is called', () => {
    const newConfig: NetworkConfig = {
      baseURL: 'https://api2.example.com',
      headers: { 'X-Custom': 'value' },
    };
    apiClient.configure(newConfig);

    expect(ApiClient.getInstance()).toBe(apiClient);
  });

  describe('initialization guard (spec 028 ④)', () => {
    it('is not initialized on a fresh instance and request() rejects before configure()', async () => {
      (ApiClient as unknown as { instance: ApiClient | null }).instance = null;
      const fresh = ApiClient.getInstance();

      expect(fresh.isInitialized()).toBe(false);
      await expect(fresh.request({ method: HttpMethod.GET, url: '/users' })).rejects.toThrow(
        /before initialization/
      );
    });

    it('is initialized after configure() and no longer throws the guard error', () => {
      (ApiClient as unknown as { instance: ApiClient | null }).instance = null;
      const fresh = ApiClient.getInstance();

      expect(fresh.isInitialized()).toBe(false);
      fresh.configure({ baseURL: 'https://api.example.com' });
      expect(fresh.isInitialized()).toBe(true);
    });
  });
});
