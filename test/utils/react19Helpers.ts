import { renderHook as originalRenderHook, act, waitFor } from '@testing-library/react-native';
import { ReactNode } from 'react';

/**
 * React 19 compatible renderHook wrapper
 * 
 * The @testing-library/react-native renderHook API changed in React 19:
 * - Return value is now the hook result directly, not { result: { current: value } }
 * - Must destructure differently to access result and rerender
 * 
 * This wrapper provides backward compatibility with test patterns.
 */
export function renderHook<TResult, TProps = unknown>(
    hook: (props: TProps) => TResult,
    options?: {
        initialProps?: TProps;
        wrapper?: React.ComponentType<{ children: ReactNode }>;
    }
) {
    const renderResult = originalRenderHook(hook, options);

    return {
        result: renderResult,
        rerender: renderResult.rerender,
        unmount: renderResult.unmount,
    };
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

/**
 * Create a test wrapper component with providers
 */
export function createWrapper(providers: React.ComponentType<{ children: ReactNode }>[]) {
    return ({ children }: { children: ReactNode }) => {
        return providers.reduceRight(
            (acc, Provider) => <Provider>{ acc } </Provider>,
      children
        );
    };
}
