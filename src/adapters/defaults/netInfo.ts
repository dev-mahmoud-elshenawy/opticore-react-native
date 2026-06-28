import type { ConnectivityAdapter, ConnectivitySnapshot } from '../interfaces';
import { nativeModulePresent } from './nativeModulePresent';

interface NetInfoState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string | null;
}

interface NetInfoModule {
  fetch(): Promise<NetInfoState>;
  addEventListener(cb: (state: NetInfoState) => void): () => void;
}

const toState = (s: NetInfoState): ConnectivitySnapshot => ({
  isConnected: s?.isConnected ?? null,
  isInternetReachable: s?.isInternetReachable ?? null,
  type: s?.type ?? null,
});

/**
 * Default connectivity adapter backed by `@react-native-community/netinfo`.
 * Returns null if the peer is not installed — or if its native module is not
 * in the running binary (e.g. Expo Go), so we never trigger the peer's
 * import-time `getEnforcing('RNCNetInfo')` throw.
 */
export function createNetInfoAdapter(): ConnectivityAdapter | null {
  if (!nativeModulePresent('RNCNetInfo')) return null;

  let netInfo: NetInfoModule;
  try {
    const mod = require('@react-native-community/netinfo');
    netInfo = (mod?.default ?? mod) as NetInfoModule;
  } catch {
    return null;
  }

  if (typeof netInfo?.addEventListener !== 'function') return null;

  return {
    fetch: async () => toState(await netInfo.fetch()),
    addEventListener: (cb) => netInfo.addEventListener((s) => cb(toState(s))),
  };
}
