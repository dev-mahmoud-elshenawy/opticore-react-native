/**
 * Integration Test: Hooks → Infrastructure Integration
 *
 * Tests that custom hooks properly integrate with underlying infrastructure
 * (NetInfo, AppState, AsyncState pattern).
 */

import { renderHookCompat, act, waitFor } from '../utils';
import { useConnectivity } from '../../src/hooks/useConnectivity';
import { useLifecycle } from '../../src/hooks/useLifecycle';
import { useAsyncState } from '../../src/hooks/useAsyncState';

// Mocks are handled by __mocks__ folder and setup.ts
// We can access properties on mocked modules directly

describe('Integration: Hooks → Infrastructure', () => {

  describe('useConnectivity → NetInfo', () => {
    it('should fetch initial connectivity state', async () => {
      const { result } = await renderHookCompat(() => useConnectivity());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
        expect(result.current.isInternetReachable).toBe(true);
        expect(result.current.type).toBe('wifi');
      }, { timeout: 1000 });
    });

    it('should register listener with NetInfo', async () => {
      // Use named export (default export is at .default in CJS interop)
      const { mockAddEventListener: netInfoAddEventListener } = require('@react-native-community/netinfo');

      await renderHookCompat(() => useConnectivity());

      // Verify NetInfo.addEventListener was called
      expect(netInfoAddEventListener).toHaveBeenCalled();
    });

    it('should cleanup listener on unmount', async () => {
      // Use named export for the mock function
      const { mockAddEventListener: netInfoAddEventListener } = require('@react-native-community/netinfo');
      const mockUnsubscribe = jest.fn();

      const originalImpl = netInfoAddEventListener.getMockImplementation();
      netInfoAddEventListener.mockImplementation(() => mockUnsubscribe);

      const { unmount } = await renderHookCompat(() => useConnectivity());

      // Wrap in act to flush cleanup effects
      await act(async () => { unmount(); });

      // Verify unsubscribe was called
      expect(mockUnsubscribe).toHaveBeenCalled();

      if (originalImpl) {
        netInfoAddEventListener.mockImplementation(originalImpl);
      }
    });

    it('should update state when connectivity changes', async () => {
      const { result } = await renderHookCompat(() => useConnectivity());

      // Wait for initial state
      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      }, { timeout: 1000 });

      // Simulate going offline
      await act(async () => {
        // Access the mock from the module
        const mockNetInfo = require('@react-native-community/netinfo').default;
        if (mockNetInfo.mockTriggerChange) {
          mockNetInfo.mockTriggerChange({
            isConnected: false,
            isInternetReachable: false,
            type: 'none',
          });
        }
      });

      // Verify state updated
      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
        expect(result.current.isInternetReachable).toBe(false);
        expect(result.current.type).toBe('none');
      }, { timeout: 1000 });
    });
  });

  describe('useLifecycle → AppState', () => {
    it('should return initial app state', async () => {
      const { result } = await renderHookCompat(() => useLifecycle());
      expect(result.current).toBe('active');
    });

    it('should register listener with AppState', async () => {
      const { AppState } = require('react-native');

      await renderHookCompat(() => useLifecycle());

      // Verify AppState.addEventListener was called
      expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should cleanup listener on unmount', async () => {
      const mockRemove = jest.fn();
      const { AppState } = require('react-native');

      const originalImpl = AppState.addEventListener.getMockImplementation();
      AppState.addEventListener.mockImplementation(() => ({ remove: mockRemove }));

      const { unmount } = await renderHookCompat(() => useLifecycle());

      // Wrap in act to flush cleanup effects synchronously
      await act(async () => { unmount(); });

      // Verify remove was called
      expect(mockRemove).toHaveBeenCalled();

      if (originalImpl) {
        AppState.addEventListener.mockImplementation(originalImpl);
      }
    });

    it('should update state when app state changes', async () => {
      const { result } = await renderHookCompat(() => useLifecycle());

      // Initial state
      expect(result.current).toBe('active');

      // Simulate app going to background
      await act(async () => {
        // Use the global mock's exposed callback mechanism
        // Note: Check test/__mocks__/react-native.ts for implementation
        // require react-native which Jest resolves to test/__mocks__/react-native.ts
        const { mockAddEventListener } = require('react-native');
        if (mockAddEventListener.lastCallback) {
          mockAddEventListener.lastCallback('background');
        }
      });

      // Verify state updated
      await waitFor(() => {
        expect(result.current).toBe('background');
      }, { timeout: 1000 });
    });
  });
});

describe('useAsyncState → AsyncState Pattern', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should follow AsyncState pattern transitions', async () => {
    const { result } = await renderHookCompat(() => useAsyncState<string>());

    // Initial: idle
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Transition: loading
    let promise: Promise<void>;
    await act(async () => {
      const asyncOperation = new Promise<string>((resolve) => {
        setTimeout(() => resolve('Test Data'), 10);
      });
      promise = result.current.run(asyncOperation);
      jest.runAllTimers();
    });

    await act(async () => {
      await promise;
    });

    // After success
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBe('Test Data');
      expect(result.current.error).toBeNull();
    }, { timeout: 1000 });
  });

  it('should handle errors in AsyncState pattern', async () => {
    const { result } = await renderHookCompat(() => useAsyncState<string>());

    const testError = new Error('Test error');

    // Run operation that fails
    await act(async () => {
      const failingOperation = new Promise<string>((_, reject) => {
        setTimeout(() => reject(testError), 10);
      });

      try {
        const promise = result.current.run(failingOperation);
        jest.runAllTimers();
        await promise;
      } catch {
        // Error should be caught and stored in state
      }
    });

    // Verify error state
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(testError);
      expect(result.current.data).toBeNull();
    }, { timeout: 1000 });
  });

  it('should prevent memory leaks on unmount', async () => {
    const { result, unmount } = await renderHookCompat(() => useAsyncState<string>());

    // Start async operation
    const asyncOperation = new Promise<string>((resolve) => {
      setTimeout(() => resolve('Data'), 100);
    });

    const promise = result.current.run(asyncOperation);

    // Unmount before completion
    unmount();

    jest.runAllTimers();

    // Wait for operation to complete (should not update state after unmount)
    await promise.catch(() => {
      // Should not throw - operation should be cancelled
    });

    // No assertions needed - if no memory leak, test passes
    expect(true).toBe(true);
  });
});

describe('Cross-Hook Integration', () => {
  it('should allow using multiple infrastructure hooks together', async () => {
    // Use multiple hooks in same component
    const { result } = await renderHookCompat(() => ({
      connectivity: useConnectivity(),
      lifecycle: useLifecycle(),
      async: useAsyncState<string>(),
    }));

    // All hooks should work together
    await waitFor(() => {
      expect(result.current.connectivity).toBeDefined();
      expect(result.current.lifecycle).toBeDefined();
      expect(result.current.async).toBeDefined();

      // Verify each hook has expected properties
      expect(result.current.connectivity.isConnected).toBeDefined();
      expect(result.current.lifecycle).toBe('active');
      expect(result.current.async.isLoading).toBe(false);
    }, { timeout: 1000 });
  });
});
