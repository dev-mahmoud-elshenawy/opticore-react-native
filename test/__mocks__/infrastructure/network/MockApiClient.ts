import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../../../../src/infrastructure/network/ApiResponse';

interface MockResponseConfig {
    data?: any;
    status?: number;
    delay?: number;
    error?: Error;
}

/**
 * MockApiClient - Test double for ApiClient
 *
 * Provides configurable responses for testing without real network calls.
 * Captures all requests for assertions.
 *
 * @example
 * ```typescript
 * const mockApi = new MockApiClient();
 * mockApi.mockGet('/users', { data: [{ id: 1, name: 'John' }] });
 *
 *const response = await mockApi.get('/users');
 * expect(mockApi.requests).toHaveLength(1);
 * ```
 */
export class MockApiClient {
    public requests: Array<{
        method: string;
        url: string;
        config?: AxiosRequestConfig;
        data?: any;
    }> = [];

    private responses: Map<
        string,
        MockResponseConfig | ((config?: AxiosRequestConfig) => MockResponseConfig)
    > = new Map();

    /**
     * Configure a mock response for a specific method + URL combination
     */
    private mockResponse(
        method: string,
        url: string,
        config: MockResponseConfig | ((config?: AxiosRequestConfig) => MockResponseConfig)
    ): void {
        this.responses.set(`${method}:${url}`, config);
    }

    /**
     * Mock a GET request
     */
    mockGet(url: string, config: MockResponseConfig): void {
        this.mockResponse('GET', url, config);
    }

    /**
     * Mock a POST request
     */
    mockPost(url: string, config: MockResponseConfig): void {
        this.mockResponse('POST', url, config);
    }

    /**
     * Mock a PUT request
     */
    mockPut(url: string, config: MockResponseConfig): void {
        this.mockResponse('PUT', url, config);
    }

    /**
     * Mock a DELETE request
     */
    mockDelete(url: string, config: MockResponseConfig): void {
        this.mockResponse('DELETE', url, config);
    }

    /**
     * Mock a PATCH request
     */
    mockPatch(url: string, config: MockResponseConfig): void {
        this.mockResponse('PATCH', url, config);
    }

    /**
     * Execute a mocked request
     */
    private async executeRequest<T = any>(
        method: string,
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> {
        this.requests.push({ method, url, config, data });

        const key = `${method}:${url}`;
        const responseConfig = this.responses.get(key);

        if (!responseConfig) {
            throw new Error(`No mock configured for ${method} ${url}`);
        }

        const resolvedConfig =
            typeof responseConfig === 'function' ? responseConfig(config) : responseConfig;

        if (resolvedConfig.delay) {
            await new Promise((resolve) => setTimeout(resolve, resolvedConfig.delay));
        }

        if (resolvedConfig.error) {
            throw resolvedConfig.error;
        }

        return {
            data: resolvedConfig.data as T,
            status: resolvedConfig.status || 200,
            statusText: 'OK',
            headers: {},
            config: config as any,
        } as AxiosResponse<T>;
    }

    /**
     * GET request
     */
    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.executeRequest<T>('GET', url, undefined, config);
    }

    /**
     * POST request
     */
    async post<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> {
        return this.executeRequest<T>('POST', url, data, config);
    }

    /**
     * PUT request
     */
    async put<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> {
        return this.executeRequest<T>('PUT', url, data, config);
    }

    /**
     * DELETE request
     */
    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.executeRequest<T>('DELETE', url, undefined, config);
    }

    /**
     * PATCH request
     */
    async patch<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> {
        return this.executeRequest<T>('PATCH', url, data, config);
    }

    /**
     * Clear all request history
     */
    clearRequests(): void {
        this.requests = [];
    }

    /**
     * Clear all mock configurations
     */
    clearMocks(): void {
        this.responses.clear();
    }

    /**
     * Reset both requests and mocks
     */
    reset(): void {
        this.clearRequests();
        this.clearMocks();
    }
}
