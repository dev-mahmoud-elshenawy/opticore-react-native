
import { SyncEngine } from '../../src/offline/SyncEngine';
import { ApiClient } from '../../src/infrastructure/network/ApiClient';
import { ConflictResolver } from '../../src/offline/ConflictResolver';
import { QueueItem } from '../../src/offline/types';

// Mock ApiClient
jest.mock('../../src/infrastructure/network/ApiClient');

describe('SyncEngine Dependency Injection', () => {
    let mockApiClient: jest.Mocked<ApiClient>;

    beforeEach(() => {
        jest.clearAllMocks();
        // Create a mock ApiClient
        mockApiClient = {
            request: jest.fn(),
        } as unknown as jest.Mocked<ApiClient>;
    });

    it('should accept ApiClient in constructor and use it', async () => {
        const syncEngine = new SyncEngine(mockApiClient, new ConflictResolver('client-wins'));

        const item: QueueItem = {
            id: '1',
            method: 'POST' as any,
            url: '/test',
            data: { foo: 'bar' },
            headers: {},
            retryCount: 0,
            createdAt: Date.now(),
        };

        // Mock successful request
        mockApiClient.request.mockResolvedValue({
            data: {},
            status: 200,
            headers: {},
            config: {},
        });

        await syncEngine.processQueue([item], {
            maxRetries: 3,
            retryDelay: 100,
            maxBackoff: 1000,
        });

        expect(mockApiClient.request).toHaveBeenCalledWith(expect.objectContaining({
            method: 'POST',
            url: '/test',
            data: { foo: 'bar' },
        }));
    });
});
