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
 * - ConnectivityManager: Network state monitoring (singleton, opt-in)
 * - LifecycleManager: App state lifecycle tracking (singleton, opt-in)
 * - DevTools: Zustand dev-mode integrations (dev only, opt-in)
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

    // Ensure the singleton is initialized; it manages its own lifecycle.
    // Do NOT dispose on unmount — it's a singleton shared across all consumers.
    ConnectivityManager.getInstance();
  }, [enableConnectivity]);

  // Initialize lifecycle management if enabled
  React.useEffect(() => {
    if (!enableLifecycle) return;

    // Ensure the singleton is initialized; it manages its own lifecycle.
    // Do NOT dispose on unmount — it's a singleton shared across all consumers.
    LifecycleManager.getInstance();
  }, [enableLifecycle]);

  // Initialize state observers
  // Zustand DevTools are enabled by default in dev mode via store middleware.
  // No additional setup needed here — this effect is reserved for future
  // dev-only integrations (e.g. custom state inspector, performance profiler).
  React.useEffect(() => {
    if (!(__DEV__ && enableDevTools)) return;
    return undefined;
  }, [enableDevTools]);

  // Wrap children with QueryProvider
  // Future providers will be added here as they become available
  return <QueryProvider config={query?.queryClientConfig}>{children}</QueryProvider>;
};

/**
 * Re-export QueryProvider for direct use if needed
 */
export { QueryProvider } from './QueryProvider';
