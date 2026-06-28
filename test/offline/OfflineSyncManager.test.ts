import { OfflineSyncManager } from '../../src/offline/OfflineSyncManager';
import { ConnectivityManager } from '../../src/infrastructure/connectivity/ConnectivityManager';
import { Logger } from '../../src/infrastructure/logger/Logger';
import { HttpMethod } from '../../src/infrastructure/network/HttpMethod';
// Mocks
jest.mock('../../src/infrastructure/connectivity/ConnectivityManager');
jest.mock('../../src/infrastructure/logger/Logger');
jest.mock('../../src/offline/RequestQueue');
jest.mock('../../src/offline/SyncEngine');
jest.mock('../../src/offline/ConflictResolver');

import { RequestQueue } from '../../src/offline/RequestQueue';
import { SyncEngine } from '../../src/offline/SyncEngine';

describe('OfflineSyncManager', () => {
  let manager: OfflineSyncManager;
  let mockConnectivity: any;
  let mockQueue: any;
  let mockSyncEngine: any;
  let connectivityListener: (isConnected: boolean) => void;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singleton if possible, or just re-get it.
    // Since it's a singleton, we might need a way to reset it or just rely on mocks being cleared.
    // Ideally we'd add a method to reset instance for testing.
    (OfflineSyncManager as any).instance = null;

    // Setup Connectivity Mock
    mockConnectivity = {
      addListener: jest.fn((cb) => {
        connectivityListener = cb;
      }),
      removeListener: jest.fn(),
      isConnected: true,
    };
    (ConnectivityManager.getInstance as jest.Mock).mockReturnValue(mockConnectivity);

    // Setup Logger Mock
    (Logger.getInstance as jest.Mock).mockReturnValue({
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    });

    // Setup Queue Mock
    mockQueue = {
      restore: jest.fn(),
      add: jest.fn().mockReturnValue('req-123'),
      remove: jest.fn(),
      getAll: jest.fn().mockReturnValue([]),
      size: jest.fn().mockReturnValue(0),
      clear: jest.fn(),
    };
    (RequestQueue as jest.Mock).mockImplementation(() => mockQueue);

    // Setup SyncEngine Mock
    mockSyncEngine = {
      processQueue: jest
        .fn()
        .mockResolvedValue({ success: 0, failed: 0, pending: 0, errors: [], results: [] }),
      getSyncingStatus: jest.fn().mockReturnValue(false),
      addListener: jest.fn().mockReturnValue(() => {}),
      isRetryable: jest.fn().mockReturnValue(true),
    };
    (SyncEngine as unknown as jest.Mock).mockImplementation(() => mockSyncEngine);

    manager = OfflineSyncManager.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = OfflineSyncManager.getInstance();
    const instance2 = OfflineSyncManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should initialize and restore queue', async () => {
    // Wait for async init if needed, although constructor triggers it.
    // In test environment, promises might need a tick.
    await new Promise(process.nextTick);
    expect(mockQueue.restore).toHaveBeenCalled();
  });

  it('should enqueue requests', async () => {
    const request = { method: HttpMethod.POST, url: '/api/test', data: {} };
    const id = await manager.enqueue(request);

    expect(mockQueue.add).toHaveBeenCalledWith(request);
    expect(id).toBe('req-123');
  });

  it('should trigger sync when enqueueing if online', async () => {
    const request = { method: HttpMethod.POST, url: '/api/test' };
    mockQueue.getAll.mockReturnValue([request]);

    await manager.enqueue(request);

    expect(mockSyncEngine.processQueue).toHaveBeenCalled();
  });

  it('should NOT trigger sync when enqueueing if offline', async () => {
    mockConnectivity.isConnected = false;
    const request = { method: HttpMethod.POST, url: '/api/test' };

    await manager.enqueue(request);

    expect(mockSyncEngine.processQueue).not.toHaveBeenCalled();
  });

  it('should auto-sync on reconnect', async () => {
    // Simulate going online
    jest.useFakeTimers();

    // Mock queue to have items so sync proceeds
    mockQueue.getAll.mockReturnValue([{ id: 'req-1', method: 'POST', url: '/api/sync' }]);
    mockQueue.size.mockReturnValue(1);

    connectivityListener(true);

    // Fast-forward time to trigger the timeout (default syncDelay is 1000ms)
    jest.advanceTimersByTime(1000);

    // Wait for promises to resolve
    await Promise.resolve();
    await Promise.resolve();

    expect(mockSyncEngine.processQueue).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('should remove item from queue on successful sync', () => {
    // Get the listener registered with SyncEngine
    const addListenerCall = mockSyncEngine.addListener.mock.calls[0];
    const listener = addListenerCall[0];

    // Simulate success event
    listener({ type: 'request_success', requestId: 'req-1' });

    expect(mockQueue.remove).toHaveBeenCalledWith('req-1');
  });

  it('should remove non-retryable failures from queue', () => {
    const addListenerCall = mockSyncEngine.addListener.mock.calls[0];
    const syncListener = addListenerCall[0];

    // Mark as non-retryable
    mockSyncEngine.isRetryable.mockReturnValue(false);

    const error = new Error('Bad Request');
    syncListener({ type: 'request_failed', requestId: 'req-bad', error });

    expect(mockQueue.remove).toHaveBeenCalledWith('req-bad');
  });

  it('should NOT remove retryable failures from queue', () => {
    const addListenerCall = mockSyncEngine.addListener.mock.calls[0];
    const syncListener = addListenerCall[0];

    // Mark as retryable
    mockSyncEngine.isRetryable.mockReturnValue(true);

    const error = new Error('Network timeout');
    syncListener({ type: 'request_failed', requestId: 'req-retry', error });

    expect(mockQueue.remove).not.toHaveBeenCalled();
  });

  describe('emit / addListener', () => {
    it('should propagate SyncEngine events to manager listeners', () => {
      const addListenerCall = mockSyncEngine.addListener.mock.calls[0];
      const syncListener = addListenerCall[0];

      const managerListener = jest.fn();
      manager.addListener(managerListener);

      syncListener({ type: 'sync_start' });

      expect(managerListener).toHaveBeenCalledWith({ type: 'sync_start' });
    });

    it('should allow unsubscribing listeners', () => {
      const addListenerCall = mockSyncEngine.addListener.mock.calls[0];
      const syncListener = addListenerCall[0];

      const managerListener = jest.fn();
      const unsubscribe = manager.addListener(managerListener);

      unsubscribe();
      syncListener({ type: 'sync_start' });

      expect(managerListener).not.toHaveBeenCalled();
    });

    it('should catch errors thrown by listeners', () => {
      const addListenerCall = mockSyncEngine.addListener.mock.calls[0];
      const syncListener = addListenerCall[0];

      const badListener = jest.fn(() => {
        throw new Error('listener crash');
      });
      const goodListener = jest.fn();
      manager.addListener(badListener);
      manager.addListener(goodListener);

      syncListener({ type: 'sync_start' });

      // Bad listener threw but good listener still received the event
      expect(goodListener).toHaveBeenCalledWith({ type: 'sync_start' });
    });
  });

  describe('dispose', () => {
    it('should clean up all resources', async () => {
      await new Promise(process.nextTick);

      const managerListener = jest.fn();
      manager.addListener(managerListener);

      manager.dispose();

      // Listener receives the 'disposed' event before being cleared
      expect(managerListener).toHaveBeenCalledWith({ type: 'disposed' });
      expect(mockQueue.clear).toHaveBeenCalled();

      // Reset mock to verify no further events are received after dispose
      managerListener.mockClear();

      // Trigger a sync engine event after dispose
      const addListenerCall = mockSyncEngine.addListener.mock.calls[0];
      const syncListener = addListenerCall[0];
      syncListener({ type: 'sync_start' });

      expect(managerListener).not.toHaveBeenCalled();
    });
  });
});
