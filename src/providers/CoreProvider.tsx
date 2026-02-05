import React from 'react';
import { QueryProvider } from './QueryProvider';
import { CoreProviderConfig } from '../types/provider-types';
import { ConnectivityManager } from '../infrastructure/connectivity/ConnectivityManager';
import { LifecycleManager } from '../infrastructure/lifecycle/LifecycleManager';

/**
 * Props for CoreProvider component
 */
export interface CoreProviderProps {
  /** Child components to render within the provider */
  children: React.ReactNode;
  /** Optional configuration for CoreProvider and its sub-providers */
  config?: CoreProviderConfig;
}

/**
 * CoreProvider Component
 *
 * Combines all opticore infrastructure providers into a single wrapper component
 * for simplified app setup. Includes:
 * - QueryProvider: React Query configuration and caching
 * - Connectivity monitoring (future)
 * - Lifecycle management (future)
 * - State observers (future)
 *
 * @example
 * ```tsx
 * // Basic usage - wraps entire app
 * export default function App() {
 *   return (
 *     <CoreProvider>
 *       <Navigation />
 *     </CoreProvider>
 *   );
 * }
 *
 * // With custom configuration
 * <CoreProvider
 *   config={{
 *     query: {
 *       queryClientConfig: {
 *         defaultOptions: {
 *           queries: { staleTime: 10 * 60 * 1000 },
 *         },
 *       },
 *     },
 *     enableDevTools: false,
 *   }}
 * >
 *   <App />
 * </CoreProvider>
 * ```
 */
export const CoreProvider: React.FC<CoreProviderProps> = ({ children, config = {} }) => {
  const {
    query,
    enableDevTools = __DEV__,
    enableConnectivity = true,
    enableLifecycle = true,
  } = config;

  // Initialize connectivity monitoring if enabled
  React.useEffect(() => {
    if (!enableConnectivity) return;

    const connectivityManager = ConnectivityManager.getInstance();

    // Connectivity manager is a singleton and automatically initializes
    // It will monitor network status for all consumers

    return () => {
      // Cleanup: dispose connectivity manager
      connectivityManager.dispose();
    };
  }, [enableConnectivity]);

  // Initialize lifecycle management if enabled
  React.useEffect(() => {
    if (!enableLifecycle) return;

    const lifecycleManager = LifecycleManager.getInstance();

    // Lifecycle manager is a singleton and automatically initializes
    // It will monitor app state for all consumers

    return () => {
      // Cleanup: dispose lifecycle manager
      lifecycleManager.dispose();
    };
  }, [enableLifecycle]);

  // Initialize state observers
  React.useEffect(() => {
    if (!(__DEV__ && enableDevTools)) return;

    // TODO: Initialize Zustand DevTools when state management is integrated
    // For now, DevTools are enabled by default in Zustand stores

    return () => {
      // Cleanup: disconnect DevTools when implemented
    };
  }, [enableDevTools]);

  // Wrap children with QueryProvider
  // Future providers will be added here as they become available
  return <QueryProvider config={query?.queryClientConfig}>{children}</QueryProvider>;
};

/**
 * Re-export QueryProvider for direct use if needed
 */
export { QueryProvider } from './QueryProvider';
