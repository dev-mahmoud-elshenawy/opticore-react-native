import { useState, useEffect, useCallback } from 'react';
import { OfflineSyncManager } from './OfflineSyncManager';
import { ConnectivityManager } from '../infrastructure/connectivity/ConnectivityManager';
import { QueuedRequest } from './types';

/**
 * Hook to interact with the offline sync system
 */
export function useOfflineSync() {
    const manager = OfflineSyncManager.getInstance();
    const connectivity = ConnectivityManager.getInstance();

    // Subscribe to manager state (pending count, syncing status, paused status)

    const [state, setState] = useState({
        isOnline: connectivity.isConnected,
        isSyncing: manager.isSyncing(),
        pendingCount: 0,
    });

    useEffect(() => {
        const updateState = async () => {
            const count = await manager.getPendingCount();
            setState({
                isOnline: connectivity.isConnected,
                isSyncing: manager.isSyncing(),
                pendingCount: count,
            });
        };

        const unsubscribeSync = manager.addListener(updateState);

        // Connectivity listener
        const handleConnectivity = () => updateState();
        connectivity.addListener(handleConnectivity);

        // Initial update in case state changed between render and effect
        updateState();

        return () => {
            unsubscribeSync();
            connectivity.removeListener(handleConnectivity);
        };
    }, [manager, connectivity]);

    const enqueue = useCallback(async <T>(request: QueuedRequest<T>) => {
        return manager.enqueue(request);
    }, [manager]);

    const sync = useCallback(async () => {
        return manager.sync();
    }, [manager]);

    const remove = useCallback((id: string) => {
        return manager.remove(id);
    }, [manager]);

    const clearQueue = useCallback(() => {
        manager.clearQueue();
        // Force update state after clear since it might not emit event immediately
        setState(prev => ({ ...prev, pendingCount: 0 }));
    }, [manager]);

    return {
        ...state,
        enqueue,
        sync,
        remove,
        clearQueue
    };
}
