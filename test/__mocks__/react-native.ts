// Mock implementation of react-native for testing
import { AppStateStatus } from 'react-native';
import React from 'react';

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

// Basic React Native components for testing
export const View = (props: any) => React.createElement('View', props);
export const Text = (props: any) => React.createElement('Text', props);
export const TouchableOpacity = (props: any) => React.createElement('TouchableOpacity', props);
export const StyleSheet = {
  create: (styles: any) => styles,
  flatten: (style: any) => {
    if (Array.isArray(style)) {
      return Object.assign({}, ...style.filter(Boolean));
    }
    return style || {};
  },
};

export default {
  Platform,
  AppState,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
};

export { mockAddEventListener, mockRemoveEventListener };
