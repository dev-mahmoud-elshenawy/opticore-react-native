
import { SyncEngine } from '../../src/offline/SyncEngine';
import { ApiClient } from '../../src/infrastructure/network/ApiClient';
import { ConflictResolver } from '../../src/offline/ConflictResolver';
import { QueueItem } from '../../src/offline/types';
import { HttpMethod } from '../../src/infrastructure/network/HttpMethod';

jest.mock('../../src/infrastructure/network/ApiClient');
jest.mock('../../src/offline/ConflictResolver');

describe('SyncEngine Deterministic Cleanup', () => {
    let mockApiClient: jest.Mocked<ApiClient>;
    let mockResolver: jest.Mocked<ConflictResolver>;
    let engine: SyncEngine;

    beforeEach(() => {
        jest.clearAllMocks();
        mockApiClient = {
            request: jest.fn(),
        } as unknown as jest.Mocked<ApiClient>;

        mockResolver = {
            resolve: jest.fn(),
            getStrategy: jest.fn().mockReturnValue('server-wins'),
        } as unknown as jest.Mocked<ConflictResolver>;

        engine = new SyncEngine(mockApiClient, mockResolver);
    });

    const createItem = (id: string): QueueItem => ({
        id,
        method: HttpMethod.POST,
        url: '/test',
        data: {},
        headers: {},
        retryCount: 0,
        createdAt: Date.now(),
    });

    it('should return detailed results for all processed items', async () => {
        const items = [createItem('1'), createItem('2')];

        // Item 1 succeeds
        mockApiClient.request.mockResolvedValueOnce({ data: 'ok', status: 200, headers: {}, config: {} });

        // Item 2 fails with non-retryable error (e.g. 400)
        const badRequestError = {
            response: { status: 400 },
            isAxiosError: true,
            message: 'Bad Request'
        };
        mockApiClient.request.mockRejectedValueOnce(badRequestError);

        const result = await engine.processQueue(items, { maxRetries: 1, retryDelay: 10, maxBackoff: 100 });

        expect(result.results).toHaveLength(2);

        // Check success result
        const res1 = result.results.find(r => r.requestId === '1');
        expect(res1).toBeDefined();
        expect(res1?.success).toBe(true);

        // Check failure result
        const res2 = result.results.find(r => r.requestId === '2');
        expect(res2).toBeDefined();
        expect(res2?.success).toBe(false);
        expect(res2?.retryable).toBe(false);
    });
});
