/**
 * Integration Test: State Management → Error System Integration
 *
 * Tests that AsyncState pattern, BaseStore, and StateObserver
 * properly integrate with the error classification system.
 */

import { create } from 'zustand';
import { createAsyncState, isError, toError, toSuccess } from '../../src/state/AsyncState';
import { RenderError } from '../../src/error/RenderError';
import { NonRenderError } from '../../src/error/NonRenderError';
import { StateObserver } from '../../src/state/StateObserver';

describe('Integration: State → Error System', () => {
  describe('AsyncState Error States', () => {
    it('should handle RenderError in AsyncState', () => {
      const error = new RenderError('Failed to load user data', 'Unable to load your profile', {
        code: 'UI_ERROR',
      });

      const state = toError(error);

      expect(isError(state)).toBe(true);
      expect(state.type).toBe('error');
      if (state.type === 'error') {
        expect(state.error).toBeInstanceOf(RenderError);
        expect(state.error.message).toBe('Failed to load user data');
      }
    });

    it('should handle NonRenderError in AsyncState', () => {
      const error = new NonRenderError('Failed to track event', {
        code: 'ANALYTICS_ERROR',
        isSilent: true,
      });

      const state = toError(error);

      expect(isError(state)).toBe(true);
      expect(state.type).toBe('error');
      if (state.type === 'error') {
        expect(state.error).toBeInstanceOf(NonRenderError);
        expect((state.error as NonRenderError).isSilent).toBe(true);
      }
    });

    it('should preserve error type through state transitions', () => {
      const renderError = new RenderError('Invalid input', undefined, {
        code: 'VALIDATION',
      });

      // Start idle
      let state = createAsyncState();
      expect(state.type).toBe('idle');

      // Transition to loading
      state = { type: 'loading' } as any;
      expect(state.type).toBe('loading');

      // Transition to error (RenderError)
      state = toError(renderError);
      expect(state.type).toBe('error');
      if (state.type === 'error') {
        expect(state.error).toBeInstanceOf(RenderError);
      }

      // Previous data should be undefined (not part of idle/loading state)
      if (state.type === 'error') {
        expect(state.previousData).toBeUndefined();
      }
    });
  });

  describe('BaseStore Error Handling', () => {
    interface TestState {
      user: { id: string; name: string } | null;
      error: Error | null;
      isLoading: boolean;
    }

    it('should store RenderError in Zustand store', () => {
      const useStore = create<TestState>(() => ({
        user: null,
        error: null,
        isLoading: false,
      }));

      const renderError = new RenderError('User not found', 'The user you are looking for does not exist', {
        code: 'USER_NOT_FOUND',
      });

      // Update store with error
      useStore.setState({ error: renderError, isLoading: false });

      const state = useStore.getState();
      expect(state.error).toBeInstanceOf(RenderError);
      expect(state.error?.message).toBe('User not found');
    });

    it('should store NonRenderError in Zustand store', () => {
      const useStore = create<TestState>(() => ({
        user: null,
        error: null,
        isLoading: false,
      }));

      const nonRenderError = new NonRenderError('Cache write failed', {
        code: 'CACHE_ERROR',
        isSilent: true,
      });

      useStore.setState({ error: nonRenderError });

      const state = useStore.getState();
      expect(state.error).toBeInstanceOf(NonRenderError);
      expect((state.error as NonRenderError).isSilent).toBe(true);
    });
  });

  describe('StateObserver Error Event Filtering', () => {
    interface ErrorState {
      asyncState: ReturnType<typeof createAsyncState>;
      lastError: Error | null;
    }

    it('should observe error state changes', () => {
      const useStore = create<ErrorState>(() => ({
        asyncState: createAsyncState(),
        lastError: null,
      }));

      const observer = StateObserver.getInstance();
      const errorCallback = jest.fn();

      // Subscribe to error states
      observer.subscribe(useStore, errorCallback);

      // Trigger error state
      const renderError = new RenderError('Test error', undefined, {
        code: 'TEST_ERROR',
      });
      useStore.setState({
        asyncState: toError(renderError),
        lastError: renderError,
      });

      // Observer should have been notified
      expect(errorCallback).toHaveBeenCalled();

      // Cleanup
      observer.cleanup();
    });

    it('should differentiate between RenderError and NonRenderError events', () => {
      const useStore = create<ErrorState>(() => ({
        asyncState: createAsyncState(),
        lastError: null,
      }));

      const observer = StateObserver.getInstance();
      const callback = jest.fn((state) => state.lastError);

      observer.subscribe(useStore, callback);

      // First: RenderError
      const renderError = new RenderError('Render error', undefined, {
        code: 'RENDER',
      });
      useStore.setState({ lastError: renderError });

      expect(callback).toHaveBeenCalled();
      const lastCall = callback.mock.results[callback.mock.results.length - 1];
      expect(lastCall.value).toBeInstanceOf(RenderError);

      // Second: NonRenderError
      const nonRenderError = new NonRenderError('Silent error', {
        code: 'NON_RENDER',
      });
      useStore.setState({ lastError: nonRenderError });

      const lastCall2 = callback.mock.results[callback.mock.results.length - 1];
      expect(lastCall2.value).toBeInstanceOf(NonRenderError);

      observer.cleanup();
    });
  });

  describe('End-to-End State → Error Flow', () => {
    interface UserState {
      user: { id: string; name: string } | null;
      asyncState: ReturnType<typeof createAsyncState>;
      fetchUser: (id: string) => Promise<void>;
    }

    it('should handle complete async operation with error', async () => {
      const useUserStore = create<UserState>((set) => ({
        user: null,
        asyncState: createAsyncState(),

        fetchUser: async (id: string) => {
          // Set loading
          set({ asyncState: { type: 'loading' } as any });

          try {
            // Simulate API call that fails
            throw new RenderError(`User ${id} not found`, 'The user does not exist', {
              code: 'USER_NOT_FOUND',
            });
          } catch (error) {
            // Set error state
            set({
              asyncState: toError(error as Error),
              user: null,
            });
            throw error;
          }
        },
      }));

      // Attempt to fetch user
      try {
        await useUserStore.getState().fetchUser('999');
        fail('Should have thrown');
      } catch (err) {
        // Verify error type
        expect(err).toBeInstanceOf(RenderError);

        // Verify state updated
        const state = useUserStore.getState();
        expect(isError(state.asyncState)).toBe(true);

        if (state.asyncState.type === 'error') {
          expect(state.asyncState.error).toBeInstanceOf(RenderError);
          expect(state.asyncState.error.message).toContain('not found');
        }
      }
    });

    it('should handle success after error recovery', async () => {
      let shouldFail = true;

      const useStore = create<UserState>((set) => ({
        user: null,
        asyncState: createAsyncState(),

        fetchUser: async (id: string) => {
          set({ asyncState: { type: 'loading' } as any });

          try {
            if (shouldFail) {
              throw new RenderError('Network error', undefined, {
                code: 'NETWORK_ERROR',
              });
            }

            // Success
            const user = { id, name: 'Test User' };
            set({
              asyncState: toSuccess(user),
              user,
            });
          } catch (error) {
            set({ asyncState: toError(error as Error) });
            throw error;
          }
        },
      }));

      // First attempt: fail
      try {
        await useStore.getState().fetchUser('1');
        fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(RenderError);
        expect(isError(useStore.getState().asyncState)).toBe(true);
      }

      // Second attempt: succeed
      shouldFail = false;
      await useStore.getState().fetchUser('1');

      const state = useStore.getState();
      expect(state.asyncState.type).toBe('success');
      expect(state.user).toEqual({ id: '1', name: 'Test User' });
    });
  });
});
