
import { SyncEngine } from '@/offline/SyncEngine';
import { HttpMethod } from '@/infrastructure/network/HttpMethod';
import { ApiClient } from '@/infrastructure/network/ApiClient';
import { Logger } from '@/infrastructure/logger/Logger';
import type { QueueItem, SyncEvent } from '@/offline/types';

jest.mock('@/infrastructure/network/ApiClient');
jest.mock('@/infrastructure/logger/Logger');

describe('SyncEngine', () => {
    let engine: SyncEngine;
    let mockApiClient: jest.Mocked<ApiClient>;
    let mockLogger: jest.Mocked<Logger>;

    beforeEach(() => {
        // Reset singletons
        (ApiClient as any).instance = null;
        (Logger as any).instance = null;

        // Create mocked ApiClient
        mockApiClient = {
            request: jest.fn().mockResolvedValue({ data: 'success', status: 200, headers: {}, config: {} }),
        } as any;

        // Create mocked Logger
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
        } as any;

        // Mock getInstance methods
        (ApiClient.getInstance as jest.Mock) = jest.fn().mockReturnValue(mockApiClient);
        (Logger.getInstance as jest.Mock) = jest.fn().mockReturnValue(mockLogger);

        engine = new SyncEngine();
    });

    describe('processQueue', () => {
        it('should process all items successfully', async () => {
            const items: QueueItem[] = [
                { id: '1', method: HttpMethod.POST, url: '/api/test1', data: {}, priority: 'normal', maxRetries: 3, retryCount: 0, createdAt: Date.now() },
                { id: '2', method: HttpMethod.PUT, url: '/api/test2', data: {}, priority: 'normal', maxRetries: 3, retryCount: 0, createdAt: Date.now() },
            ];

            const result = await engine.processQueue(items, { maxRetries: 3, retryDelay: 100, maxBackoff: 5000 });

            expect(result.success).toBe(2);
            expect(result.failed).toBe(0);
            expect(result.pending).toBe(0);
            expect(result.errors).toHaveLength(0);
            expect(mockApiClient.request).toHaveBeenCalledTimes(2);
        });

        it('should handle partial failures', async () => {
            const items: QueueItem[] = [
                { id: '1', method: HttpMethod.POST, url: '/api/success', data: {}, priority: 'normal', maxRetries: 3, retryCount: 0, createdAt: Date.now() },
                { id: '2', method: HttpMethod.POST, url: '/api/fail', data: {}, priority: 'normal', maxRetries: 3, retryCount: 0, createdAt: Date.now() },
            ];

            mockApiClient.request
                .mockResolvedValueOnce({ data: 'success', status: 200, headers: {}, config: {} })
                .mockRejectedValueOnce({ status: 404, message: 'Not Found' });

            const result = await engine.processQueue(items, { maxRetries: 0, retryDelay: 100, maxBackoff: 5000 });

            expect(result.success).toBe(1);
            expect(result.failed).toBe(1);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].requestId).toBe('2');
        });

        it('should emit sync events', async () => {
            const events: SyncEvent[] = [];
            engine.addListener(event => events.push(event));

            const items: QueueItem[] = [
                { id: '1', method: HttpMethod.GET, url: '/api/test', data: undefined, priority: 'normal', maxRetries: 3, retryCount: 0, createdAt: Date.now() },
            ];

            await engine.processQueue(items, { maxRetries: 3, retryDelay: 100, maxBackoff: 5000 });

            expect(events).toContainEqual({ type: 'sync_start' });
            expect(events).toContainEqual({ type: 'request_success', requestId: '1' });
            expect(events).toContainEqual(expect.objectContaining({ type: 'sync_complete' }));
        });

        it('should prevent concurrent syncs', async () => {
            const items: QueueItem[] = [
                { id: '1', method: HttpMethod.GET, url: '/api/test', data: undefined, priority: 'normal', maxRetries: 3, retryCount: 0, createdAt: Date.now() },
            ];

            // Start first sync
            const syncPromise = engine.processQueue(items, { maxRetries: 3, retryDelay: 100, maxBackoff: 5000 });

            // Try to start second sync
            await expect(
                engine.processQueue(items, { maxRetries: 3, retryDelay: 100, maxBackoff: 5000 })
            ).rejects.toThrow('Sync already in progress');

            await syncPromise;
        });
    });

    describe('executeRequest', () => {
        it('should execute request successfully', async () => {
            const item: QueueItem = {
                id: '1',
                method: HttpMethod.POST,
                url: '/api/test',
                data: { foo: 'bar' },
                headers: { 'X-Custom': 'header' },
                priority: 'normal',
                maxRetries: 3,
                retryCount: 0,
                createdAt: Date.now(),
            };

            await engine.executeRequest(item, { maxRetries: 3, retryDelay: 100, maxBackoff: 5000 });

            expect(mockApiClient.request).toHaveBeenCalledWith({
                method: HttpMethod.POST,
                url: '/api/test',
                data: { foo: 'bar' },
                headers: { 'X-Custom': 'header' },
            });
        });

        it('should retry on retryable errors', async () => {
            const item: QueueItem = {
                id: '1',
                method: HttpMethod.GET,
                url: '/api/test',
                data: undefined,
                priority: 'normal',
                maxRetries: 3,
                retryCount: 0,
                createdAt: Date.now(),
            };

            // Fail twice, then succeed
            mockApiClient.request
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('timeout'))
                .mockResolvedValueOnce({ data: 'success', status: 200, headers: {}, config: {} });

            await engine.executeRequest(item, { maxRetries: 3, retryDelay: 10, maxBackoff: 100 });

            expect(mockApiClient.request).toHaveBeenCalledTimes(3);
        });

        it('should not retry on non-retryable errors', async () => {
            const item: QueueItem = {
                id: '1',
                method: HttpMethod.POST,
                url: '/api/test',
                data: {},
                priority: 'normal',
                maxRetries: 3,
                retryCount: 0,
                createdAt: Date.now(),
            };

            const error = { status: 400, message: 'Bad Request' };
            mockApiClient.request.mockRejectedValue(error);

            await expect(
                engine.executeRequest(item, { maxRetries: 3, retryDelay: 10, maxBackoff: 100 })
            ).rejects.toEqual(error);

            expect(mockApiClient.request).toHaveBeenCalledTimes(1); // No retries
        });

        it('should use exponential backoff', async () => {
            const item: QueueItem = {
                id: '1',
                method: HttpMethod.GET,
                url: '/api/test',
                data: undefined,
                priority: 'normal',
                maxRetries: 3,
                retryCount: 0,
                createdAt: Date.now(),
            };

            mockApiClient.request.mockRejectedValue(new Error('Network error'));

            const startTime = Date.now();
            await expect(
                engine.executeRequest(item, { maxRetries: 3, retryDelay: 50, maxBackoff: 5000 })
            ).rejects.toThrow();
            const endTime = Date.now();

            // Should have delays: 50ms, 100ms, 200ms = 350ms minimum
            expect(endTime - startTime).toBeGreaterThanOrEqual(300);
        });

        it('should cap backoff at maxBackoff', async () => {
            const item: QueueItem = {
                id: '1',
                method: HttpMethod.GET,
                url: '/api/test',
                data: undefined,
                priority: 'normal',
                maxRetries: 3,
                retryCount: 0,
                createdAt: Date.now(),
            };

            mockApiClient.request.mockRejectedValue(new Error('Network error'));

            const startTime = Date.now();
            await expect(
                engine.executeRequest(item, { maxRetries: 3, retryDelay: 100, maxBackoff: 150 })
            ).rejects.toThrow();
            const endTime = Date.now();

            // Backoff should be capped at 150ms: 100ms, 150ms, 150ms = 400ms
            expect(endTime - startTime).toBeLessThan(600);
        });

        it('should emit retry events', async () => {
            const events: SyncEvent[] = [];
            engine.addListener(event => events.push(event));

            const item: QueueItem = {
                id: '1',
                method: HttpMethod.GET,
                url: '/api/test',
                data: undefined,
                priority: 'normal',
                maxRetries: 3,
                retryCount: 0,
                createdAt: Date.now(),
            };

            mockApiClient.request
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({ data: 'success', status: 200, headers: {}, config: {} });

            await engine.executeRequest(item, { maxRetries: 3, retryDelay: 10, maxBackoff: 100 });

            expect(events).toContainEqual({ type: 'request_retry', requestId: '1', attempt: 1 });
        });
    });

    describe('isRetryable', () => {
        it('should return true for network errors', () => {
            expect(engine.isRetryable(new Error('Network request failed'))).toBe(true);
            expect(engine.isRetryable(new Error('timeout occurred'))).toBe(true);
            expect(engine.isRetryable(new Error('ECONNREFUSED'))).toBe(true);
        });

        it('should return false for non-retryable status codes', () => {
            expect(engine.isRetryable({ status: 400 })).toBe(false);
            expect(engine.isRetryable({ status: 401 })).toBe(false);
            expect(engine.isRetryable({ status: 403 })).toBe(false);
            expect(engine.isRetryable({ status: 404 })).toBe(false);
            expect(engine.isRetryable({ status: 422 })).toBe(false);
        });

        it('should return true for retryable status codes', () => {
            expect(engine.isRetryable({ status: 408 })).toBe(true); // Request Timeout
            expect(engine.isRetryable({ status: 429 })).toBe(true); // Too Many Requests
            expect(engine.isRetryable({ status: 500 })).toBe(true); // Internal Server Error
            expect(engine.isRetryable({ status: 502 })).toBe(true); // Bad Gateway
            expect(engine.isRetryable({ status: 503 })).toBe(true); // Service Unavailable
        });

        it('should return true for unknown errors', () => {
            expect(engine.isRetryable(new Error('Unknown error'))).toBe(true);
            expect(engine.isRetryable({ message: 'Something went wrong' })).toBe(true);
        });
    });

    describe('event listeners', () => {
        it('should add and remove listeners', () => {
            const listener = jest.fn();
            const removeListener = engine.addListener(listener);

            // Listener should not be called yet
            expect(listener).not.toHaveBeenCalled();

            removeListener();

            // After removal, listener should not be in the list
            expect(listener).not.toHaveBeenCalled();
        });

        it('should handle listener errors gracefully', async () => {
            const badListener = jest.fn(() => {
                throw new Error('Listener error');
            });
            const goodListener = jest.fn();

            engine.addListener(badListener);
            engine.addListener(goodListener);

            const items: QueueItem[] = [
                { id: '1', method: HttpMethod.GET, url: '/api/test', data: undefined, priority: 'normal', maxRetries: 3, retryCount: 0, createdAt: Date.now() },
            ];

            await engine.processQueue(items, { maxRetries: 3, retryDelay: 10, maxBackoff: 100 });

            // Both listeners should have been called
            expect(badListener).toHaveBeenCalled();
            expect(goodListener).toHaveBeenCalled();
            // Error should have been logged
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe('getSyncingStatus', () => {
        it('should return false when not syncing', () => {
            expect(engine.getSyncingStatus()).toBe(false);
        });

        it('should return true during sync', async () => {
            const items: QueueItem[] = [
                { id: '1', method: HttpMethod.GET, url: '/api/test', data: undefined, priority: 'normal', maxRetries: 3, retryCount: 0, createdAt: Date.now() },
            ];

            mockApiClient.request.mockImplementation(
                () => new Promise(resolve => setTimeout(() => resolve({ data: 'success', status: 200, headers: {}, config: {} }), 50))
            );

            const syncPromise = engine.processQueue(items, { maxRetries: 3, retryDelay: 10, maxBackoff: 100 });

            // Should be syncing
            await new Promise(resolve => setTimeout(resolve, 10));
            expect(engine.getSyncingStatus()).toBe(true);

            await syncPromise;

            // Should be done
            expect(engine.getSyncingStatus()).toBe(false);
        });
    });
});
