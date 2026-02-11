
import { SyncEngine } from '../../src/offline/SyncEngine';
import { ApiClient } from '../../src/infrastructure/network/ApiClient';
import { ConflictResolver } from '../../src/offline/ConflictResolver';
import { QueueItem } from '../../src/offline/types';
import { HttpMethod } from '../../src/infrastructure/network/HttpMethod';

jest.mock('../../src/infrastructure/network/ApiClient');
jest.mock('../../src/offline/ConflictResolver');

describe('SyncEngine Conflict Resolution', () => {
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
            getStrategy: jest.fn(),
        } as unknown as jest.Mocked<ConflictResolver>;

        engine = new SyncEngine(mockApiClient, mockResolver);
    });

    const createItem = (): QueueItem => ({
        id: '1',
        method: HttpMethod.POST,
        url: '/test',
        data: { val: 'local' },
        headers: {},
        retryCount: 0,
        createdAt: Date.now(),
    });

    it('should handle server-wins by accepting success without retry', async () => {
        const item = createItem();
        (mockResolver.getStrategy as jest.Mock).mockReturnValue('server-wins');

        // Mock 409 error
        const conflictError = {
            response: { status: 409, data: { val: 'server' } },
            isAxiosError: true
        };
        mockApiClient.request.mockRejectedValueOnce(conflictError);
        mockResolver.resolve.mockResolvedValue({ val: 'server' });

        await engine.processQueue([item], { maxRetries: 3, retryDelay: 10, maxBackoff: 100 });

        expect(mockResolver.resolve).toHaveBeenCalledWith({ val: 'local' }, { val: 'server' });
        expect(mockApiClient.request).toHaveBeenCalledTimes(1); // No retry
        // Should emit success
        // We can verify result count
    });

    it('should handle manual resolution by retrying with merged data', async () => {
        const item = createItem();
        (mockResolver.getStrategy as jest.Mock).mockReturnValue('manual');

        const conflictError = {
            response: { status: 409, data: { val: 'server' } },
            isAxiosError: true
        };

        // 1st attempt: fails with 409
        // 2nd attempt: succeeds
        mockApiClient.request
            .mockRejectedValueOnce(conflictError)
            .mockResolvedValueOnce({ data: 'ok', status: 200, headers: {}, config: {} });

        // Resolve to merged data
        mockResolver.resolve.mockResolvedValue({ val: 'merged' });

        await engine.processQueue([item], { maxRetries: 3, retryDelay: 10, maxBackoff: 100 });

        expect(mockResolver.resolve).toHaveBeenCalled();
        expect(mockApiClient.request).toHaveBeenCalledTimes(2);

        // Verify second call used merged data
        expect(mockApiClient.request).toHaveBeenLastCalledWith(expect.objectContaining({
            data: { val: 'merged' }
        }));
    });
});
