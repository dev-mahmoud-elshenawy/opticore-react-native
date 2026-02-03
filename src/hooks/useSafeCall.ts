import { useState, useCallback } from 'react';

export type SafeCallResult<T> = {
    execute: (fn: () => Promise<T>) => Promise<T | undefined>;
    error: Error | null;
    isLoading: boolean;
};

/**
 * Hook to safely execute async functions with error handling.
 * Catches errors and exposes them in state instead of crashing.
 *
 * @returns SafeCallResult object containing:
 * - execute: (fn: () => Promise<T>) => Promise<T | undefined>
 * - error: Error | null
 * - isLoading: boolean
 */
export function useSafeCall<T>(): SafeCallResult<T> {
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const execute = useCallback(async (fn: () => Promise<T>): Promise<T | undefined> => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await fn();
            return result;
        } catch (e: any) {
            const err = e instanceof Error ? e : new Error(String(e));
            setError(err);
            return undefined;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { execute, error, isLoading };
}
