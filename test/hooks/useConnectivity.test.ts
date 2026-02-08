import { renderHookCompat, waitFor } from '../utils';
import { useConnectivity } from '../../src/hooks/useConnectivity';
import NetInfo from '@react-native-community/netinfo';

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()), // Returns unsubscribe function
  fetch: jest.fn(),
}));

describe('useConnectivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    });

    const { result } = await renderHookCompat(() => useConnectivity());

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
      expect(result.current.isInternetReachable).toBe(true);
      expect(result.current.type).toBe('wifi');
    });
  });

  it('should handle offline state', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
    });

    const { result } = await renderHookCompat(() => useConnectivity());

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
      expect(result.current.isInternetReachable).toBe(false);
      expect(result.current.type).toBe('none');
    });
  });

  it('should cleanup listener on unmount', async () => {
    const unsubscribeMock = jest.fn();
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(unsubscribeMock);

    const { unmount } = await renderHookCompat(() => useConnectivity());
    await unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });
});
