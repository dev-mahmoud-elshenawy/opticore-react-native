import { renderHook, act, waitFor } from '@testing-library/react-native';
import { ReactNode } from 'react';

/**
 * React 19 compatible renderHook wrapper
 * Handles the updated return type and async behavior.
 * In React 18/19 via testing-library, renderHook returns a result object that is stable.
 */
export function renderHookCompat<T, P>(
  hook: (props: P) => T,
  options?: {
    wrapper?: React.ComponentType<{ children: ReactNode }>;
    initialProps?: P;
  }
) {
  return renderHook(hook, options);
}

/**
 * React 19 compatible act wrapper for async operations
 * Ensures proper flush of React batched updates
 */
export async function actCompat(callback: () => Promise<void> | void) {
  await act(async () => {
    await callback();
  });
}

/**
 * Wait for hook to stabilize before assertions
 */
export async function waitForHook<T>(
  getResult: () => T,
  predicate: (result: T) => boolean,
  timeout = 5000
) {
  await waitFor(() => expect(predicate(getResult())).toBe(true), { timeout });
}
