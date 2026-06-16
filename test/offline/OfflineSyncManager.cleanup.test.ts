
import { OfflineSyncManager } from '../../src/offline/OfflineSyncManager';
import { SyncEngine } from '../../src/offline/SyncEngine';
import { RequestQueue } from '../../src/offline/RequestQueue';
import { ApiClient } from '../../src/infrastructure/network/ApiClient';
import { ConnectivityManager } from '../../src/infrastructure/connectivity/ConnectivityManager';
import { SyncResult } from '../../src/offline/types';

// Mock dependencies
import { Logger } from '../../src/infrastructure/logger/Logger';
jest.mock('../../src/infrastructure/network/ApiClient');
jest.mock('../../src/infrastructure/logger/Logger');
jest.mock('../../src/infrastructure/connectivity/ConnectivityManager');
jest.mock('../../src/offline/SyncEngine');
jest.mock('../../src/offline/RequestQueue');

describe('OfflineSyncManager Cleanup', () => {
    let manager: OfflineSyncManager;
    let mockSyncEngine: jest.Mocked<SyncEngine>;
    let mockQueue: jest.Mocked<RequestQueue>;
    let mockConnectivity: jest.Mocked<ConnectivityManager>;
    let mockLogger: jest.Mocked<Logger>;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Setup mock logger
        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        } as unknown as jest.Mocked<Logger>;
        (Logger.getInstance as jest.Mock).mockReturnValue(mockLogger);

        // Setup mock instances
        mockSyncEngine = {
            processQueue: jest.fn(),
            getSyncingStatus: jest.fn().mockReturnValue(false),
            addListener: jest.fn(),
        } as unknown as jest.Mocked<SyncEngine>;

        mockQueue = {
            add: jest.fn(),
            remove: jest.fn(),
            getAll: jest.fn().mockReturnValue([]),
            size: jest.fn().mockReturnValue(0),
            clear: jest.fn(),
            restore: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<RequestQueue>;

        mockConnectivity = {
            isConnected: true,
            addListener: jest.fn(),
            removeListener: jest.fn(),
        } as unknown as jest.Mocked<ConnectivityManager>;

        // reset singleton
        (OfflineSyncManager as any).instance = null;

        // Mock constructors/getters
        (SyncEngine as unknown as jest.Mock).mockImplementation(() => mockSyncEngine);
        (RequestQueue as jest.Mock).mockImplementation(() => mockQueue);
        (ConnectivityManager.getInstance as jest.Mock).mockReturnValue(mockConnectivity);
        (ApiClient.getInstance as jest.Mock).mockReturnValue({});

        manager = OfflineSyncManager.getInstance();
    });

    it('should remove successfully synced items from queue', async () => {
        // Setup queue with items
        const items = [{ id: '1' }, { id: '2' }];
        mockQueue.getAll.mockReturnValue(items as any);
        mockQueue.size.mockReturnValue(2);

        // Setup SyncEngine response with results
        const syncResult: SyncResult = {
            success: 1,
            failed: 1,
            pending: 0,
            errors: [],
            results: [
                { requestId: '1', success: true },
                { requestId: '2', success: false, retryable: true }
            ]
        };
        mockSyncEngine.processQueue.mockResolvedValue(syncResult);

        // Trigger sync
        await manager.sync();

        // Verify SyncEngine called
        expect(mockSyncEngine.processQueue).toHaveBeenCalledWith(items, expect.any(Object));

        // Verify successful item removed
        expect(mockQueue.remove).toHaveBeenCalledWith('1');

        // Verify failed item NOT removed
        expect(mockQueue.remove).not.toHaveBeenCalledWith('2');
    });

    it('should remove non-retryable failures from queue', async () => {
        // Setup queue with items
        const items = [{ id: '3' }];
        mockQueue.getAll.mockReturnValue(items as any);
        mockQueue.size.mockReturnValue(1);

        // Setup SyncEngine response
        const syncResult: SyncResult = {
            success: 0,
            failed: 1,
            pending: 0,
            errors: [],
            results: [
                { requestId: '3', success: false, retryable: false }
            ]
        };
        mockSyncEngine.processQueue.mockResolvedValue(syncResult);

        // Trigger sync
        await manager.sync();

        // Non-retryable failures (e.g. 4xx) are removed — they will never succeed on retry
        expect(mockQueue.remove).toHaveBeenCalledWith('3');
    });
});
