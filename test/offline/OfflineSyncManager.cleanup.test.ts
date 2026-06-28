import { OfflineSyncManager } from '../../src/offline/OfflineSyncManager';
import { SyncEngine } from '../../src/offline/SyncEngine';
import { RequestQueue } from '../../src/offline/RequestQueue';
import { ApiClient } from '../../src/infrastructure/network/ApiClient';
import { ConnectivityManager } from '../../src/infrastructure/connectivity/ConnectivityManager';
import { SyncResult, SyncListener } from '../../src/offline/types';

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
  let capturedSyncEngineListener: SyncListener | undefined;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    capturedSyncEngineListener = undefined;

    // Setup mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<Logger>;
    (Logger.getInstance as jest.Mock).mockReturnValue(mockLogger);

    // Setup mock instances — addListener captures the manager's cleanup handler
    mockSyncEngine = {
      processQueue: jest.fn(),
      getSyncingStatus: jest.fn().mockReturnValue(false),
      isRetryable: jest.fn().mockReturnValue(true),
      addListener: jest.fn((listener: SyncListener) => {
        capturedSyncEngineListener = listener;
        return () => {
          capturedSyncEngineListener = undefined;
        };
      }),
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

  it('should remove successfully synced items from queue via SyncEngine events', async () => {
    // Setup queue with items
    const items = [{ id: '1' }, { id: '2' }];
    mockQueue.getAll.mockReturnValue(items as any);
    mockQueue.size.mockReturnValue(2);

    // SyncEngine fires request_success during processQueue; manager's listener removes from queue
    const syncResult: SyncResult = {
      success: 1,
      failed: 1,
      pending: 0,
      errors: [],
      results: [
        { requestId: '1', success: true },
        { requestId: '2', success: false, retryable: true },
      ],
    };
    mockSyncEngine.processQueue.mockImplementation(async () => {
      // Simulate the real SyncEngine firing events as items complete
      capturedSyncEngineListener?.({ type: 'request_success', requestId: '1' });
      return syncResult;
    });

    // Trigger sync
    await manager.sync();

    // Verify SyncEngine called
    expect(mockSyncEngine.processQueue).toHaveBeenCalledWith(items, expect.any(Object));

    // Successful item removed via event listener
    expect(mockQueue.remove).toHaveBeenCalledWith('1');

    // Failed-but-retryable item NOT removed
    expect(mockQueue.remove).not.toHaveBeenCalledWith('2');

    // Item removed exactly once (no double-remove from post-sync loop)
    const removeCallsForItem1 = (mockQueue.remove as jest.Mock).mock.calls.filter(
      ([id]) => id === '1'
    );
    expect(removeCallsForItem1).toHaveLength(1);
  });

  it('should remove non-retryable failures from queue via SyncEngine events', async () => {
    // Setup queue with items
    const items = [{ id: '3' }];
    mockQueue.getAll.mockReturnValue(items as any);
    mockQueue.size.mockReturnValue(1);

    // isRetryable returns false for this error
    mockSyncEngine.isRetryable = jest.fn().mockReturnValue(false);

    const failureError = new Error('400 Bad Request');
    const syncResult: SyncResult = {
      success: 0,
      failed: 1,
      pending: 0,
      errors: [],
      results: [{ requestId: '3', success: false, retryable: false }],
    };
    mockSyncEngine.processQueue.mockImplementation(async () => {
      // Simulate SyncEngine firing request_failed with non-retryable error
      capturedSyncEngineListener?.({ type: 'request_failed', requestId: '3', error: failureError });
      return syncResult;
    });

    // Trigger sync
    await manager.sync();

    // Non-retryable failures are removed via event listener
    expect(mockQueue.remove).toHaveBeenCalledWith('3');
  });
});
