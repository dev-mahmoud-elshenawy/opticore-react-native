import { useState, useEffect, useRef } from 'react';

/**
 * Hook to throttle a value update.
 * Applies the value immediately on the leading edge, then ignores changes
 * until `limit` milliseconds have elapsed. The latest value during the
 * quiet period is applied on the trailing edge.
 *
 * @param value - The value to throttle
 * @param limit - Time limit in milliseconds
 * @returns The throttled value
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  // Initialize to `limit` ms in the past so the first call fires immediately.
  const lastRan = useRef<number>(Date.now() - limit);

  useEffect(() => {
    const elapsed = Date.now() - lastRan.current;
    if (elapsed >= limit) {
      // Leading edge: enough time has passed — apply immediately.
      lastRan.current = Date.now();
      setThrottledValue(value);
      return undefined;
    }
    // Trailing edge: schedule the update for the remainder of the window.
    const timer = setTimeout(() => {
      lastRan.current = Date.now();
      setThrottledValue(value);
    }, limit - elapsed);
    return () => clearTimeout(timer);
  }, [value, limit]);

  return throttledValue;
}
