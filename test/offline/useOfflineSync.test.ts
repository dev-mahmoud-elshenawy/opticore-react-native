import { renderHook, act } from '@testing-library/react-native';
import { useOfflineSync } from '../../src/offline/useOfflineSync';
import { OfflineSyncManager } from '../../src/offline/OfflineSyncManager';
import { ConnectivityManager } from '../../src/infrastructure/connectivity/ConnectivityManager';
import { HttpMethod } from '../../src/infrastructure/network/HttpMethod';

// Mocks
jest.mock('../../src/offline/OfflineSyncManager');
jest.mock('../../src/infrastructure/connectivity/ConnectivityManager');

describe('useOfflineSync', () => {
  let mockManager: any;
  let mockConnectivity: any;
  let managerListeners: Function[] = [];
  let connectivityListeners: Function[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    managerListeners = [];
    connectivityListeners = [];

    // Setup Manager Mock
    mockManager = {
      addListener: jest.fn((cb) => {
        managerListeners.push(cb);
        return () => {
          managerListeners = managerListeners.filter((l) => l !== cb);
        };
      }),
      isSyncing: jest.fn().mockReturnValue(false),
      getPendingCount: jest.fn().mockReturnValue(0),
      enqueue: jest.fn().mockResolvedValue('req-1'),
      sync: jest.fn().mockResolvedValue({ success: 1, failed: 0 }),
      remove: jest.fn().mockReturnValue(true),
      clearQueue: jest.fn(),
    };
    (OfflineSyncManager.getInstance as jest.Mock).mockReturnValue(mockManager);

    // Setup Connectivity Mock
    mockConnectivity = {
      addListener: jest.fn((cb) => {
        connectivityListeners.push(cb);
      }),
      removeListener: jest.fn((cb) => {
        connectivityListeners = connectivityListeners.filter((l) => l !== cb);
      }),
      isConnected: true,
    };
    (ConnectivityManager.getInstance as jest.Mock).mockReturnValue(mockConnectivity);
  });

  it('should return initial state', async () => {
    const { result } = await renderHook(() => useOfflineSync());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isSyncing).toBe(false);
    expect(result.current.pendingCount).toBe(0);
  });

  it('should update state on connectivity change', async () => {
    const { result } = await renderHook(() => useOfflineSync());

    await act(async () => {
      mockConnectivity.isConnected = false;
      connectivityListeners.forEach((cb) => cb(false));
    });

    expect(result.current.isOnline).toBe(false);
  });

  it('should update state on sync events', async () => {
    const { result } = await renderHook(() => useOfflineSync());

    await act(async () => {
      mockManager.isSyncing.mockReturnValue(true);
      mockManager.getPendingCount.mockReturnValue(5);
      managerListeners.forEach((cb) => cb({ type: 'sync_started' }));
    });

    expect(result.current.isSyncing).toBe(true);
    expect(result.current.pendingCount).toBe(5);
  });

  it('should enqueue requests', async () => {
    const { result } = await renderHook(() => useOfflineSync());
    const request = { method: HttpMethod.POST, url: '/test' };

    await act(async () => {
      await result.current.enqueue(request);
    });

    expect(mockManager.enqueue).toHaveBeenCalledWith(request);
  });
});
