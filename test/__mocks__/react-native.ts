// Mock implementation of react-native for testing
// Note: We can't import from react-native here as it would cause circular deps
// Define AppStateStatus manually instead

type AppStateStatus = 'active' | 'background' | 'inactive';

const mockRemoveEventListener = jest.fn();
const mockAddEventListener = jest.fn(
  (_eventType: string, callback: (status: AppStateStatus) => void) => {
    // Store the callback for manual triggering in tests
    (mockAddEventListener as any).lastCallback = callback;
    return {
      remove: mockRemoveEventListener,
    };
  }
);

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

const React = require('react');

// Basic React Native components for testing (simple mocks)
export const View = class View extends React.Component {
  render() {
    return React.createElement('View', this.props, this.props.children);
  }
};
export const Text = class Text extends React.Component {
  render() {
    return React.createElement('Text', this.props, this.props.children);
  }
};
export const TouchableOpacity = class TouchableOpacity extends React.Component {
  render() {
    return React.createElement('TouchableOpacity', this.props, this.props.children);
  }
};
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
