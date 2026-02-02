// Mock implementation of react-native for testing
export const Platform = {
  OS: 'ios',
  Version: '15.0',
  select: jest.fn((obj) => obj.ios || obj.default),
};

export const AppState = {
  currentState: 'active',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

export default {
  Platform,
  AppState,
};
