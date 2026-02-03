import { useState, useEffect, useRef } from 'react';

/**
 * Hook to throttle a value update.
 * Allows the value to update at most once every `limit` milliseconds.
 *
 * @param value - The value to throttle
 * @param limit - Time limit in milliseconds
 * @returns The throttled value
 */
export function useThrottle<T>(value: T, limit: number): T {
    const [throttledValue, setThrottledValue] = useState<T>(value);
    const lastRan = useRef(Date.now());

    useEffect(() => {
        const handler = setTimeout(function () {
            if (Date.now() - lastRan.current >= limit) {
                setThrottledValue(value);
                lastRan.current = Date.now();
            }
        }, limit - (Date.now() - lastRan.current));

        return () => {
            clearTimeout(handler);
        };
    }, [value, limit]);

    return throttledValue;
}
