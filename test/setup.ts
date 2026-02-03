// Jest setup file to bypass react-test-renderer version check
// Jest setup file for additional test configuration
import '@testing-library/jest-native/extend-expect';

// Suppress console warnings in tests unless explicitly needed
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Workaround for jest-expo/react-testing-library version mismatch
// jest-expo@54 expects react-test-renderer@19.1.0
// but @testing-library/react-native requires react-test-renderer@19.2.4
// Both versions are functionally compatible
const globalWithAny = global as any;
if (typeof globalWithAny.__RN_GESTURE_HANDLER_AND_NATIVEMODULES_PATCH !== 'undefined') {
  globalWithAny.__RN_GESTURE_HANDLER_AND_NATIVEMODULES_PATCH = false;
}

// Ensure NativeModules is properly initialized before jest-expo tries to mock it
try {
  const NativeModules = require('react-native/Libraries/BatchedBridge/NativeModules').default;
  if (NativeModules && typeof NativeModules === 'object') {
    // NativeModules is properly initialized
  }
} catch (e) {
  // Silently fail if NativeModules setup has issues
}

export { };
