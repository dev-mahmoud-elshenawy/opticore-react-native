import { useEffect } from 'react';

/**
 * Hook to execute a callback only once when component mounts.
 *
 * @param effect - Callback function to execute
 */
export function useMount(effect: () => void | (() => void)) {
  useEffect(() => {
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
