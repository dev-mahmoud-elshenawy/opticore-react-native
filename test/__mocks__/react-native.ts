// Mock implementation of react-native for testing
import { AppStateStatus } from 'react-native';

const mockRemoveEventListener = jest.fn();
const mockAddEventListener = jest.fn((_eventType: string, callback: (status: AppStateStatus) => void) => {
  // Store the callback for manual triggering in tests
  (mockAddEventListener as any).lastCallback = callback;
  return {
    remove: mockRemoveEventListener,
  };
});

export const Platform = {
  OS: 'ios' as 'ios' | 'android' | 'web',
  Version: '15.0',
  select: jest.fn((obj: any) => obj.ios || obj.default),
};

export const AppState = {
  currentState: 'active' as AppStateStatus,
  addEventListener: mockAddEventListener,
  removeEventListener: jest.fn(),
};

export default {
  Platform,
  AppState,
};

export { mockAddEventListener, mockRemoveEventListener };
