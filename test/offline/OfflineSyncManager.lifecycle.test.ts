import { OfflineSyncManager } from '../../src/offline/OfflineSyncManager';
import { RequestQueue } from '../../src/offline/RequestQueue';
import { ApiClient } from '../../src/infrastructure/network/ApiClient';
import { ConnectivityManager } from '../../src/infrastructure/connectivity/ConnectivityManager';
import { Logger } from '../../src/infrastructure/logger/Logger';

// Mock dependencies
jest.mock('../../src/infrastructure/network/ApiClient');
jest.mock('../../src/infrastructure/logger/Logger');
jest.mock('../../src/infrastructure/connectivity/ConnectivityManager');
jest.mock('../../src/offline/SyncEngine');
jest.mock('../../src/offline/RequestQueue');

describe('OfflineSyncManager Listener Lifecycle', () => {
  let manager: OfflineSyncManager;
  let mockConnectivity: jest.Mocked<ConnectivityManager>;
  let mockLogger: jest.Mocked<Logger>;
  let connectivityListener: (connected: boolean) => void;

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

    // Setup connectivity mock to capture listener
    mockConnectivity = {
      isConnected: true,
      addListener: jest.fn((listener) => {
        connectivityListener = listener;
        return () => {};
      }),
      removeListener: jest.fn(),
    } as unknown as jest.Mocked<ConnectivityManager>;

    // Reset singleton
    (OfflineSyncManager as any).instance = null;

    // Mock constructors
    (RequestQueue as jest.Mock).mockImplementation(() => ({
      restore: jest.fn().mockResolvedValue(undefined),
      size: jest.fn().mockReturnValue(1), // Assume items pending
      getAll: jest.fn().mockReturnValue([{ id: '1' }]),
      clear: jest.fn(),
    }));
    (ConnectivityManager.getInstance as jest.Mock).mockReturnValue(mockConnectivity);
    (ApiClient.getInstance as jest.Mock).mockReturnValue({});

    // Mock setTimeout to run immediately
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should register exactly one listener on initialization', async () => {
    manager = OfflineSyncManager.getInstance();

    // Wait for async init to complete
    await manager.getPendingCount();

    expect(mockConnectivity.addListener).toHaveBeenCalledTimes(1);
  });

  it('should trigger sync when connectivity is restored', async () => {
    manager = OfflineSyncManager.getInstance();

    // Wait for init
    await manager.getPendingCount();

    // Spy on sync
    const syncSpy = jest.spyOn(manager, 'sync').mockResolvedValue({} as any);

    // Simulate offline -> online
    expect(connectivityListener).toBeDefined();
    connectivityListener(true);

    // Fast-forward delay
    jest.runAllTimers();

    expect(syncSpy).toHaveBeenCalled();
  });

  it('should NOT trigger sync when paused', async () => {
    manager = OfflineSyncManager.getInstance();

    // Wait for init
    await manager.getPendingCount();

    const syncSpy = jest.spyOn(manager, 'sync');

    manager.pause();

    // Simulate online
    connectivityListener(true);
    jest.runAllTimers();

    expect(syncSpy).not.toHaveBeenCalled();
  });

  it('should remove listener on dispose', async () => {
    manager = OfflineSyncManager.getInstance();

    // Wait for init
    await manager.getPendingCount();

    manager.dispose();

    expect(mockConnectivity.removeListener).toHaveBeenCalledWith(connectivityListener);
  });
});
