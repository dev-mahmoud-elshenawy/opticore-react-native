/**
 * Integration Test: CoreProvider Initialization
 *
 * Tests that CoreProvider correctly initializes all infrastructure managers
 * and provides React Query context to components.
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { CoreProvider } from '../../src/providers/CoreProvider';
import { ConnectivityManager } from '../../src/infrastructure/connectivity/ConnectivityManager';
import { LifecycleManager } from '../../src/infrastructure/lifecycle/LifecycleManager';

// Mock infrastructure managers
jest.mock('../../src/infrastructure/connectivity/ConnectivityManager');
jest.mock('../../src/infrastructure/lifecycle/LifecycleManager');

describe('Integration: CoreProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Infrastructure Initialization', () => {
    it('should initialize ConnectivityManager when enabled', () => {
      const TestComponent = () => <Text>Test</Text>;

      render(
        <CoreProvider config={{ enableConnectivity: true }}>
          <TestComponent />
        </CoreProvider>
      );

      // Verify ConnectivityManager was accessed (singleton pattern)
      expect(ConnectivityManager.getInstance).toHaveBeenCalled();
    });

    it('should initialize LifecycleManager when enabled', () => {
      const TestComponent = () => <Text>Test</Text>;

      render(
        <CoreProvider config={{ enableLifecycle: true }}>
          <TestComponent />
        </CoreProvider>
      );

      // Verify LifecycleManager was accessed (singleton pattern)
      expect(LifecycleManager.getInstance).toHaveBeenCalled();
    });

    it('should NOT initialize ConnectivityManager when disabled', () => {
      const TestComponent = () => <Text>Test</Text>;

      render(
        <CoreProvider config={{ enableConnectivity: false }}>
          <TestComponent />
        </CoreProvider>
      );

      // Verify ConnectivityManager was NOT called
      expect(ConnectivityManager.getInstance).not.toHaveBeenCalled();
    });

    it('should NOT initialize LifecycleManager when disabled', () => {
      const TestComponent = () => <Text>Test</Text>;

      render(
        <CoreProvider config={{ enableLifecycle: false }}>
          <TestComponent />
        </CoreProvider>
      );

      // Verify LifecycleManager was NOT called
      expect(LifecycleManager.getInstance).not.toHaveBeenCalled();
    });
  });

  describe('React Query Context', () => {
    it('should provide QueryClient to child components', () => {
      let queryClientFromContext: any = null;

      const TestComponent = () => {
        queryClientFromContext = useQueryClient();
        return <Text>Test</Text>;
      };

      render(
        <CoreProvider>
          <TestComponent />
        </CoreProvider>
      );

      // Verify QueryClient is available
      expect(queryClientFromContext).toBeDefined();
      expect(queryClientFromContext).toHaveProperty('getQueryData');
      expect(queryClientFromContext).toHaveProperty('setQueryData');
    });

    it('should render multiple children correctly', async () => {
      const { getByText } = await render(
        <CoreProvider>
          <View>
            <Text>Child 1</Text>
            <Text>Child 2</Text>
            <Text>Child 3</Text>
          </View>
        </CoreProvider>
      );

      expect(getByText('Child 1')).toBeTruthy();
      expect(getByText('Child 2')).toBeTruthy();
      expect(getByText('Child 3')).toBeTruthy();
    });
  });

  describe('Configuration Merging', () => {
    it('should use default configuration when none provided', async () => {
      const TestComponent = () => <Text>Test</Text>;

      const { getByText } = await render(
        <CoreProvider>
          <TestComponent />
        </CoreProvider>
      );

      expect(getByText('Test')).toBeTruthy();
      // Both managers should be initialized with defaults (enabled: true)
      expect(ConnectivityManager.getInstance).toHaveBeenCalled();
      expect(LifecycleManager.getInstance).toHaveBeenCalled();
    });

    it('should merge custom configuration with defaults', () => {
      const TestComponent = () => <Text>Test</Text>;

      render(
        <CoreProvider
          config={{
            enableConnectivity: true,
            enableLifecycle: false,
            enableDevTools: false,
          }}
        >
          <TestComponent />
        </CoreProvider>
      );

      expect(ConnectivityManager.getInstance).toHaveBeenCalled();
      expect(LifecycleManager.getInstance).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup managers on unmount', async () => {
      const mockDispose = jest.fn();

      (ConnectivityManager.getInstance as jest.Mock).mockReturnValue({
        dispose: mockDispose,
      });

      (LifecycleManager.getInstance as jest.Mock).mockReturnValue({
        dispose: mockDispose,
      });

      const TestComponent = () => <Text>Test</Text>;

      const { unmount } = await render(
        <CoreProvider>
          <TestComponent />
        </CoreProvider>
      );

      unmount();

      await waitFor(() => {
        // Verify dispose was called on cleanup
        expect(mockDispose).toHaveBeenCalled();
      });
    });
  });
});
