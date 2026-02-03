import { useState, useCallback, useRef, useEffect } from 'react';

export type AsyncState<T> = {
    isLoading: boolean;
    data: T | null;
    error: Error | null;
    run: (promise: Promise<T>) => Promise<T | undefined>;
    setData: React.Dispatch<React.SetStateAction<T | null>>;
    setError: React.Dispatch<React.SetStateAction<Error | null>>;
    reset: () => void;
};

/**
 * Hook to manage async operation state (loading, data, error).
 * Automatically handles component unmounting to prevent memory leaks.
 *
 * @param initialData - Initial data value (optional)
 * @returns AsyncState object containing:
 * - isLoading: boolean
 * - data: T | null
 * - error: Error | null
 * - run: function to execute an async promise
 * - setData: function to manually set data
 * - setError: function to manually set error
 * - reset: function to reset state to initial values
 *
 * @example
 * const { data, isLoading, error, run } = useAsyncState<User>();
 *
 * useEffect(() => {
 *   run(fetchUser(id));
 * }, [id]);
 */
export function useAsyncState<T>(initialData: T | null = null): AsyncState<T> {
    const [data, setData] = useState<T | null>(initialData);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const run = useCallback(async (promise: Promise<T>): Promise<T | undefined> => {
        setIsLoading(true);
        setError(null);
        setData(null);

        try {
            const result = await promise;
            if (isMounted.current) {
                setData(result);
                setError(null);
            }
            return result;
        } catch (e: any) {
            if (isMounted.current) {
                setError(e instanceof Error ? e : new Error(String(e)));
                setData(null);
            }
            throw e;
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    }, []);

    const reset = useCallback(() => {
        setData(initialData);
        setError(null);
        setIsLoading(false);
    }, [initialData]);

    return {
        isLoading,
        data,
        error,
        run,
        setData,
        setError,
        reset,
    };
}
