import { useEffect, useRef } from 'react';

/**
 * Hook to store the previous value of a state or prop.
 *
 * @param value - The value to track
 * @returns The previous value (undefined on first render)
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
