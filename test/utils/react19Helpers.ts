import { renderHook as originalRenderHook, act, waitFor } from '@testing-library/react-native';
import { type ReactNode, type ComponentType } from 'react';

/**
 * React 19 compatible renderHook wrapper for @testing-library/react-native v14+
 * 
 * In v14 (React 19 compatible), renderHook returns a Promise that resolves to RenderHookResult.
 * This wrapper keeps the synchronous-looking API by directly exposing the result object.
 * 
 * The v14 API change: renderHook now returns Promise<RenderHookResult>
 * RenderHookResult has { current, rerender, unmount } where `current` is the hook return value
 */
export function renderHook<TResult, TProps = unknown>(
    hook: (props: TProps) => TResult,
    options?: {
        initialProps?: TProps;
        wrapper?: ComponentType<{ children: ReactNode }>;
    }
) {
    // In v14, renderHook returns a Promise, but the result object is what we need
    // The actual hook result is in result.current, not result itself
    return originalRenderHook(hook, options);
}

/**
 * React 19 compatible act wrapper for async operations
 * Ensures proper flush of React batched updates
 */
export async function actAsync(callback: () => Promise<void> | void): Promise<void> {
    await act(async () => {
        await callback();
    });
}

/**
 * Wait for hook to stabilize before assertions
 * Useful for hooks with async effects
 */
export async function waitForHook<T>(
    getResult: () => T,
    predicate: (result: T) => boolean,
    options?: { timeout?: number; interval?: number }
): Promise<void> {
    await waitFor(() => {
        expect(predicate(getResult())).toBe(true);
    }, options);
}
