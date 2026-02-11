
import { SyncEngine } from '../../src/offline/SyncEngine';
import { ApiClient } from '../../src/infrastructure/network/ApiClient';
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
        // @ts-ignore - We are testing the constructor change before it's implemented in type definition
        // validating that we CAN pass it. 
        // Once we modify SyncEngine.ts, this test will type check correctly if we update types.
        // For now, we cast to any to bypass TS check until implementation is done.
        const syncEngine = new SyncEngine(mockApiClient);

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
