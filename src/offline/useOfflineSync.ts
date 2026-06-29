import { useState, useEffect, useCallback } from 'react';
import { offline } from '../facades/offline';
import { connectivity } from '../facades/connectivity';
import { QueuedRequest } from './types';

/**
 * Hook to interact with the offline sync system
 */
export function useOfflineSync() {
  const [state, setState] = useState({
    isOnline: connectivity.isConnected,
    isSyncing: offline.isSyncing(),
    pendingCount: 0,
  });

  useEffect(() => {
    const updateState = async () => {
      const count = await offline.getPendingCount();
      setState({
        isOnline: connectivity.isConnected,
        isSyncing: offline.isSyncing(),
        pendingCount: count,
      });
    };

    const unsubscribeSync = offline.subscribe(updateState);
    const unsubscribeConnectivity = connectivity.subscribe(() => updateState());

    updateState();

    return () => {
      unsubscribeSync();
      unsubscribeConnectivity();
    };
  }, []);

  const enqueue = useCallback(async <T>(request: QueuedRequest<T>) => {
    return offline.enqueue(request);
  }, []);

  const sync = useCallback(async () => {
    return offline.sync();
  }, []);

  const remove = useCallback((id: string) => {
    return offline.remove(id);
  }, []);

  const clearQueue = useCallback(() => {
    offline.clearQueue();
    setState((prev) => ({ ...prev, pendingCount: 0 }));
  }, []);

  return {
    ...state,
    enqueue,
    sync,
    remove,
    clearQueue,
  };
}
