import { OfflineSyncManager } from '../../src/offline/OfflineSyncManager';
import { RequestQueue } from '../../src/offline/RequestQueue';
import { ApiClient } from '../../src/infrastructure/network/ApiClient';
import { HttpMethod } from '../../src/infrastructure/network/HttpMethod';
import { ConnectivityManager } from '../../src/infrastructure/connectivity/ConnectivityManager';
import { Logger } from '../../src/infrastructure/logger/Logger';

// Mock dependencies
jest.mock('../../src/infrastructure/network/ApiClient');
jest.mock('../../src/infrastructure/logger/Logger');
jest.mock('../../src/infrastructure/connectivity/ConnectivityManager');
jest.mock('../../src/offline/SyncEngine');
jest.mock('../../src/offline/RequestQueue');

describe('OfflineSyncManager Initialization Guard', () => {
    let manager: OfflineSyncManager;
    let mockQueue: jest.Mocked<RequestQueue>;
    let mockConnectivity: jest.Mocked<ConnectivityManager>;
    let restoreResolver: () => void;
    let mockLogger: jest.Mocked<Logger>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mock logger
        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        } as unknown as jest.Mocked<Logger>;
        (Logger.getInstance as jest.Mock).mockReturnValue(mockLogger);

        // Setup delayed restore to simulate async init
        const restorePromise = new Promise<void>((resolve) => {
            restoreResolver = resolve;
        });

        mockQueue = {
            add: jest.fn().mockReturnValue('req_1'),
            restore: jest.fn().mockReturnValue(restorePromise),
            setMaxSize: jest.fn(),
            // ... other methods mocked via auto-mock or default
        } as unknown as jest.Mocked<RequestQueue>;

        mockConnectivity = {
            isConnected: true,
            addListener: jest.fn(),
            removeListener: jest.fn(),
        } as unknown as jest.Mocked<ConnectivityManager>;

        // Reset singleton
        (OfflineSyncManager as any).instance = null;

        // Mock constructors
        (RequestQueue as jest.Mock).mockImplementation(() => mockQueue);
        (ConnectivityManager.getInstance as jest.Mock).mockReturnValue(mockConnectivity);
        (ApiClient.getInstance as jest.Mock).mockReturnValue({});
    });

    it('should wait for initialization before enqueueing', async () => {
        // Initialize manager
        manager = OfflineSyncManager.getInstance();

        // Call enqueue immediately (before restore completes)
        const enqueuePromise = manager.enqueue({
            method: HttpMethod.POST,
            url: '/test',
            data: {}
        });

        // Verify queue.add NOT called yet
        expect(mockQueue.add).not.toHaveBeenCalled();

        // Finish initialization
        restoreResolver();

        // Await enqueue
        await enqueuePromise;

        // Verify queue.add called AFTER init
        expect(mockQueue.add).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
        // Mock restore to fail
        mockQueue.restore.mockRejectedValue(new Error('Storage corrupted'));

        // Initialize
        manager = OfflineSyncManager.getInstance();

        // Should still resolve readyPromise (in finally block)
        // We can test this by checking if enqueue proceeds
        const enqueuePromise = manager.enqueue({
            method: HttpMethod.POST,
            url: '/test',
            data: {}
        });

        // Resolve the restore promise (which rejects inside)
        try {
            await restoreResolver(); // This simulates the async completion of restore
        } catch (e) {
            // Restore mock might need to be set up differently to simulate rejection properly
            // but here we mocked it to reject.
        }

        // Enqueue should proceed without error
        await expect(enqueuePromise).resolves.toBe('req_1');

        // Logger should have logged error
        // Note: RequestQueue swallows error usually, but here we mocked restore to reject directly.
        // If RequestQueue swallows it, OfflineSyncManager sees success.
        // If RequestQueue throws, OfflineSyncManager catches it.
        // Let's verify OfflineSyncManager catches it.
        expect(mockLogger.error).toHaveBeenCalledWith(
            expect.stringContaining('Initialization failed'),
            expect.any(Error)
        );
    });
});
