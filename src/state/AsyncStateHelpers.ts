import { AsyncState } from './types/AsyncStateTypes';

/**
 * Safely extracts data from success state
 * Returns undefined for other states
 */
export function unwrap<T>(state: AsyncState<T>): T | undefined {
  if (state.type === 'success') {
    return state.data;
  }
  return undefined;
}

/**
 * Pattern matching utility for AsyncState
 * Ensures all states are handled (exhaustiveness checking supported via return type)
 */
export function match<T, R>(
  state: AsyncState<T>,
  handlers: {
    idle: () => R;
    loading: (previousData?: T) => R;
    success: (data: T) => R;
    error: (error: Error, previousData?: T) => R;
  }
): R {
  switch (state.type) {
    case 'idle':
      return handlers.idle();
    case 'loading':
      return handlers.loading(state.previousData);
    case 'success':
      return handlers.success(state.data);
    case 'error':
      return handlers.error(state.error, state.previousData);
  }
}

/**
 * Transforms the data in success state, leaves other states unchanged
 */
export function mapSuccess<T, U>(state: AsyncState<T>, fn: (data: T) => U): AsyncState<U> {
  if (state.type === 'success') {
    return { type: 'success', data: fn(state.data) };
  }

  // Preserve previousData across the type map so a refresh keeps showing stale
  // data (the whole point of previousData) instead of flashing a loading state.
  if (state.type === 'loading') {
    return {
      type: 'loading',
      previousData: state.previousData !== undefined ? fn(state.previousData) : undefined,
    };
  }

  if (state.type === 'error') {
    return {
      type: 'error',
      error: state.error,
      previousData: state.previousData !== undefined ? fn(state.previousData) : undefined,
    };
  }

  return { type: 'idle' };
}

/**
 * Transforms the error in error state, leaves other states unchanged
 */
export function mapError<T>(state: AsyncState<T>, fn: (error: Error) => Error): AsyncState<T> {
  if (state.type === 'error') {
    return {
      ...state,
      error: fn(state.error),
    };
  }
  return state;
}
