import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/**
 * Hook to monitor network connectivity status.
 * Wraps @react-native-community/netinfo.
 *
 * @returns Object containing:
 * - isConnected: boolean | null - True if connected, false if definitely offline, null if unknown
 * - isInternetReachable: boolean | null - True if internet allows actual requests
 * - type: string | null - Connection type (wifi, cellular, etc.)
 */
export function useConnectivity() {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
    const [type, setType] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setIsConnected(state.isConnected);
            setIsInternetReachable(state.isInternetReachable);
            setType(state.type);
        });

        NetInfo.fetch().then((state) => {
            setIsConnected(state.isConnected);
            setIsInternetReachable(state.isInternetReachable);
            setType(state.type);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return { isConnected, isInternetReachable, type };
}
