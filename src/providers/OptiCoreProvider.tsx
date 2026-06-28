import React, { useEffect, useMemo, useRef } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { CoreConfig } from '../config/types';
import { CoreSetup } from '../config/CoreSetup';
import { ConfigProvider } from './ConfigContext';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from '../theme/ThemeProvider';
import { ConnectivityManager } from '../infrastructure/connectivity/ConnectivityManager';
import { LifecycleManager } from '../infrastructure/lifecycle/LifecycleManager';
import { StorageManager } from '../infrastructure/storage/StorageManager';
import { resolveAllAdapters } from '../adapters/registry';
import { configurePlatformAdapters } from '../utils/platform';

export interface OptiCoreProviderProps {
  /**
   * Configuration for the OptiCore library
   */
  config: CoreConfig;

  /**
   * Child components to render
   */
  children: React.ReactNode;

  /**
   * Whether to enable connectivity monitoring
   * @default true
   */
  enableConnectivity?: boolean;

  /**
   * Whether to enable lifecycle management
   * @default true
   */
  enableLifecycle?: boolean;

  /**
   * Inject a custom React Query client (e.g. from `createQueryClient(...)`).
   * When omitted, the provider builds one from OptiCore's defaults merged with
   * `config.query`. Use this to fully control the client (devtools, persistence,
   * a shared instance) without wrapping your own `QueryClientProvider`.
   */
  queryClient?: QueryClient;
}

/**
 * Unified Provider for OptiCore.
 *
 * Resolves the adapter chain on mount (consumer overrides > popular peer >
 * memory fallback), wires every singleton to those adapters, initializes
 * CoreSetup, ConnectivityManager, LifecycleManager, then composes the
 * downstream providers (Config / Query / Theme).
 */
export const OptiCoreProvider: React.FC<OptiCoreProviderProps> = ({
  config,
  children,
  enableConnectivity = true,
  enableLifecycle = true,
  queryClient,
}) => {
  const resolvedAdapters = useMemo(() => resolveAllAdapters(config.adapters), [config.adapters]);

  // CRITICAL: configure the singletons SYNCHRONOUSLY during render, before any
  // child renders. Child effects run BEFORE parent effects in React, so doing
  // this in a useEffect would let a child's mount effect fire an API call
  // against an un-configured ApiClient (no baseURL/auth). The ref guard keeps it
  // idempotent across re-renders and React StrictMode double-invocation; the
  // underlying configure()/init() calls are themselves idempotent.
  const setupDone = useRef(false);
  // Track which adapter was last configured synchronously so the effect can
  // detect whether it needs to re-configure (adapter changed after mount) or
  // skip (initial mount — already done here synchronously).
  const configuredConnectivity = useRef<typeof resolvedAdapters.connectivity | null>(null);
  if (!setupDone.current) {
    StorageManager.getInstance().configure({
      secureAdapter: resolvedAdapters.secureStorage,
      localAdapter: resolvedAdapters.localStorage,
    });
    configurePlatformAdapters({
      clipboard: resolvedAdapters.clipboard,
      device: resolvedAdapters.device,
    });
    CoreSetup.getInstance().init(config);
    if (enableConnectivity) {
      ConnectivityManager.getInstance().configure(resolvedAdapters.connectivity);
      configuredConnectivity.current = resolvedAdapters.connectivity;
    }
    setupDone.current = true;
  }

  // Effects handle teardown on unmount and re-configure when the adapter
  // reference changes after the initial synchronous setup.
  useEffect(() => {
    if (!enableConnectivity) return;
    const connectivity = ConnectivityManager.getInstance();
    // Skip configure on initial mount (already done synchronously above).
    // Re-configure only when the adapter reference changes after mount,
    // or after a StrictMode cleanup/remount cycle where dispose() was called.
    if (configuredConnectivity.current !== resolvedAdapters.connectivity) {
      configuredConnectivity.current = resolvedAdapters.connectivity;
      connectivity.configure(resolvedAdapters.connectivity);
    }
    return () => {
      configuredConnectivity.current = null;
      connectivity.dispose();
    };
  }, [enableConnectivity, resolvedAdapters.connectivity]);

  useEffect(() => {
    if (!enableLifecycle) return;
    const lifecycle = LifecycleManager.getInstance();
    return () => {
      lifecycle.dispose();
    };
  }, [enableLifecycle]);

  return (
    <ConfigProvider config={config}>
      <QueryProvider queryClient={queryClient} config={config.query}>
        <ThemeProvider defaultMode={config.theme?.defaultMode}>{children}</ThemeProvider>
      </QueryProvider>
    </ConfigProvider>
  );
};
