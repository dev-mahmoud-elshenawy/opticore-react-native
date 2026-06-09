import React, { useEffect, useMemo, useRef } from 'react';
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
}) => {
    const resolvedAdapters = useMemo(
        () => resolveAllAdapters(config.adapters),
        [config.adapters],
    );

    // CRITICAL: configure the singletons SYNCHRONOUSLY during render, before any
    // child renders. Child effects run BEFORE parent effects in React, so doing
    // this in a useEffect would let a child's mount effect fire an API call
    // against an un-configured ApiClient (no baseURL/auth). The ref guard keeps it
    // idempotent across re-renders and React StrictMode double-invocation; the
    // underlying configure()/init() calls are themselves idempotent.
    const setupDone = useRef(false);
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
        }
        setupDone.current = true;
    }

    // Disposal only — the configuration above already ran synchronously.
    // Effects handle teardown on unmount (and re-subscribe if the toggle flips).
    useEffect(() => {
        if (!enableConnectivity) return;
        const connectivity = ConnectivityManager.getInstance();
        // Re-apply on toggle changes (initial configure happened during render).
        connectivity.configure(resolvedAdapters.connectivity);
        return () => {
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
            <QueryProvider>
                <ThemeProvider defaultMode={config.theme?.defaultMode}>
                    {children}
                </ThemeProvider>
            </QueryProvider>
        </ConfigProvider>
    );
};
