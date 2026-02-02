import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { ConnectivityManager } from '../../../src/infrastructure/connectivity/ConnectivityManager';

// Mock NetInfo
jest.mock('@react-native-community/netinfo');

describe('ConnectivityManager', () => {
  let connectivityManager: ConnectivityManager;
  let mockUnsubscribe: jest.Mock;

  beforeEach(() => {
    mockUnsubscribe = jest.fn();
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(mockUnsubscribe);
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      type: 'wifi',
    } as NetInfoState);

    connectivityManager = ConnectivityManager.getInstance();
  });

  afterEach(() => {
    connectivityManager.dispose();
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

    // Simulate connectivity change
    const eventHandler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
    eventHandler({ isConnected: false, type: 'none' } as NetInfoState);

    expect(mockCallback).toHaveBeenCalledWith(false);
  });

  it('should remove listener successfully', () => {
    const mockCallback = jest.fn();
    connectivityManager.addListener(mockCallback);
    connectivityManager.removeListener(mockCallback);

    // Simulate connectivity change
    const eventHandler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
    eventHandler({ isConnected: false, type: 'none' } as NetInfoState);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should support multiple listeners concurrently', () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();
    const mockCallback3 = jest.fn();

    connectivityManager.addListener(mockCallback1);
    connectivityManager.addListener(mockCallback2);
    connectivityManager.addListener(mockCallback3);

    // Simulate connectivity change
    const eventHandler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
    eventHandler({ isConnected: true, type: 'wifi' } as NetInfoState);

    expect(mockCallback1).toHaveBeenCalledWith(true);
    expect(mockCallback2).toHaveBeenCalledWith(true);
    expect(mockCallback3).toHaveBeenCalledWith(true);
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

    const eventHandler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];

    // Go offline
    eventHandler({ isConnected: false, type: 'none' } as NetInfoState);
    expect(mockCallback).toHaveBeenCalledWith(false);

    // Go online
    eventHandler({ isConnected: true, type: 'cellular' } as NetInfoState);
    expect(mockCallback).toHaveBeenCalledWith(true);
    expect(mockCallback).toHaveBeenCalledTimes(2);
  });
});
