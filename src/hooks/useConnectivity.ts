import { useState, useEffect } from 'react';
import type { ConnectivityAdapter } from '../adapters/interfaces';
import { resolveConnectivityAdapter } from '../adapters/registry';

/**
 * Hook to monitor network connectivity status.
 *
 * Resolves a {@link ConnectivityAdapter} via the default chain
 * (`@react-native-community/netinfo` → memory fallback). Pass an `adapter`
 * argument to override — e.g. to provide a test-only adapter or a custom
 * implementation supplied via `OptiCoreProvider`.
 *
 * @returns Object containing:
 * - isConnected: boolean | null
 * - isInternetReachable: boolean | null
 * - type: string | null
 */
export function useConnectivity(adapter?: ConnectivityAdapter) {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    const resolved = adapter ?? resolveConnectivityAdapter();

    const unsubscribe = resolved.addEventListener((state) => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
      setType(state.type);
    });

    resolved.fetch().then((state) => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
      setType(state.type);
    });

    return () => {
      unsubscribe();
    };
  }, [adapter]);

  return { isConnected, isInternetReachable, type };
}
