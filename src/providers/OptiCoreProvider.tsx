import React, { useEffect, useMemo } from 'react';
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

    // Wire adapters into singletons before any consumer code runs.
    useEffect(() => {
        StorageManager.getInstance().configure({
            secureAdapter: resolvedAdapters.secureStorage,
            localAdapter: resolvedAdapters.localStorage,
        });
        configurePlatformAdapters({
            clipboard: resolvedAdapters.clipboard,
            device: resolvedAdapters.device,
        });
    }, [resolvedAdapters]);

    // Initialize CoreSetup on mount
    useEffect(() => {
        CoreSetup.getInstance().init(config);
    }, [config]);

    // Initialize connectivity monitoring (uses resolved adapter)
    useEffect(() => {
        if (!enableConnectivity) return;
        const connectivity = ConnectivityManager.getInstance();
        connectivity.configure(resolvedAdapters.connectivity);
        return () => {
            connectivity.dispose();
        };
    }, [enableConnectivity, resolvedAdapters.connectivity]);

    // Initialize lifecycle management
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
