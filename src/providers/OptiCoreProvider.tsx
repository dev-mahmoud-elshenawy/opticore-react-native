import React, { useEffect } from 'react';
import { CoreConfig } from '../config/types';
import { CoreSetup } from '../config/CoreSetup';
import { ConfigProvider } from './ConfigContext';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from '../theme/ThemeProvider';
import { ConnectivityManager } from '../infrastructure/connectivity/ConnectivityManager';
import { LifecycleManager } from '../infrastructure/lifecycle/LifecycleManager';

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
 * Unified Provider for OptiCore
 * 
 * Composes all necessary providers and initializes singletons.
 * Replaces CoreProvider as the main entry point.
 */
export const OptiCoreProvider: React.FC<OptiCoreProviderProps> = ({
    config,
    children,
    enableConnectivity = true,
    enableLifecycle = true,
}) => {
    // Initialize CoreSetup on mount
    useEffect(() => {
        CoreSetup.getInstance().init(config);
    }, [config]);

    // Initialize connectivity monitoring
    useEffect(() => {
        if (!enableConnectivity) return;
        const connectivity = ConnectivityManager.getInstance();
        return () => {
            connectivity.dispose();
        };
    }, [enableConnectivity]);

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
