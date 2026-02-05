import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { ConnectivityManager } from '../../../src/infrastructure/connectivity/ConnectivityManager';

// Mock NetInfo
jest.mock('@react-native-community/netinfo');

describe('ConnectivityManager', () => {
  let connectivityManager: ConnectivityManager;
  let mockUnsubscribe: jest.Mock;
  let netInfoCallback: ((state: NetInfoState) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    netInfoCallback = null;

    mockUnsubscribe = jest.fn();

    // Setup mock to capture callback
    (NetInfo.addEventListener as jest.Mock).mockImplementation(
      (callback: (state: NetInfoState) => void) => {
        netInfoCallback = callback;
        return mockUnsubscribe;
      }
    );

    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      type: 'wifi',
    } as NetInfoState);

    // Reset singleton instance by disposing and clearing private static field
    const instance = (ConnectivityManager as any).instance;
    if (instance) {
      instance.dispose();
      (ConnectivityManager as any).instance = null;
    }

    connectivityManager = ConnectivityManager.getInstance();
  });

  afterEach(() => {
    if (connectivityManager) {
      connectivityManager.dispose();
    }
    // Clear singleton instance
    (ConnectivityManager as any).instance = null;
    jest.clearAllMocks();
  });

  it('should return singleton instance', () => {
    const instance1 = ConnectivityManager.getInstance();
    const instance2 = ConnectivityManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should initialize with connectivity status', async () => {
    // Give time for async initialization
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(NetInfo.fetch).toHaveBeenCalled();
  });

  it('should add and notify listeners on connectivity change', () => {
    const mockCallback = jest.fn();
    connectivityManager.addListener(mockCallback);

    // Simulate connectivity change using captured callback
    if (netInfoCallback) {
      netInfoCallback({ isConnected: false, type: 'none' } as NetInfoState);
    }

    expect(mockCallback).toHaveBeenCalledWith(false);
  });

  it('should remove listener successfully', () => {
    const mockCallback = jest.fn();
    connectivityManager.addListener(mockCallback);
    connectivityManager.removeListener(mockCallback);

    // Simulate connectivity change using captured callback
    if (netInfoCallback) {
      netInfoCallback({ isConnected: false, type: 'none' } as NetInfoState);
    }

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should support multiple listeners concurrently', () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();
    const mockCallback3 = jest.fn();

    connectivityManager.addListener(mockCallback1);
    connectivityManager.addListener(mockCallback2);
    connectivityManager.addListener(mockCallback3);

    // Simulate connectivity change using captured callback
    // Must change from initial state (true) to trigger listeners
    if (netInfoCallback) {
      netInfoCallback({ isConnected: false, type: 'none' } as NetInfoState);
    }

    expect(mockCallback1).toHaveBeenCalledWith(false);
    expect(mockCallback2).toHaveBeenCalledWith(false);
    expect(mockCallback3).toHaveBeenCalledWith(false);
  });

  it('should provide current connectivity status synchronously', async () => {
    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 100));

    // isConnected should be available synchronously after init
    const status = connectivityManager.isConnected;
    expect(typeof status).toBe('boolean');
  });

  it('should clean up on dispose', () => {
    connectivityManager.dispose();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle offline to online transition', () => {
    const mockCallback = jest.fn();
    connectivityManager.addListener(mockCallback);

    // Use captured callback from mock
    if (netInfoCallback) {
      // Go offline
      netInfoCallback({ isConnected: false, type: 'none' } as NetInfoState);
      expect(mockCallback).toHaveBeenCalledWith(false);

      // Go online
      netInfoCallback({ isConnected: true, type: 'cellular' } as NetInfoState);
      expect(mockCallback).toHaveBeenCalledWith(true);
      expect(mockCallback).toHaveBeenCalledTimes(2);
    }
  });
});
