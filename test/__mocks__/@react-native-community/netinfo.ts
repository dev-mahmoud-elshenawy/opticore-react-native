// Mock for @react-native-community/netinfo
import { NetInfoState } from '@react-native-community/netinfo';

const mockUnsubscribe = jest.fn();
const mockFetch = jest.fn().mockResolvedValue({
  isConnected: true,
  type: 'wifi',
  isInternetReachable: true,
} as NetInfoState);

const mockAddEventListener = jest.fn((callback: (state: NetInfoState) => void) => {
  // Store the callback for manual triggering in tests
  (mockAddEventListener as any).lastCallback = callback;
  return mockUnsubscribe;
});

const NetInfo = {
  addEventListener: mockAddEventListener,
  fetch: mockFetch,
};

export default NetInfo;
export { mockUnsubscribe, mockFetch, mockAddEventListener };
