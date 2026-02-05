/**
 * Example: Basic App Setup with CoreProvider
 *
 * This example shows the recommended way to set up an Expo/React Native app
 * with CoreProvider for complete infrastructure configuration.
 */
import React from 'react';
import { CoreProvider } from 'opticore-react-native';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './navigation/MainNavigator';

/**
 * Root App Component
 *
 * CoreProvider should wrap your entire application at the root level,
 * before any navigation or other providers.
 */
export default function App() {
  return (
    <CoreProvider>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </CoreProvider>
  );
}

/**
 * Example: Custom Configuration
 *
 * You can customize the provider configuration based on your needs.
 */
export function AppWithCustomConfig() {
  return (
    <CoreProvider
      config={{
        // Customize React Query behavior
        query: {
          queryClientConfig: {
            defaultOptions: {
              queries: {
                staleTime: 10 * 60 * 1000, // 10 minutes
                retry: 5,
              },
            },
          },
        },
        // Toggle features
        enableDevTools: __DEV__,
        enableConnectivity: true,
        enableLifecycle: true,
      }}
    >
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </CoreProvider>
  );
}

/**
 * Example: Expo Router Setup
 *
 * For Expo Router apps, wrap the Slot component.
 */
import { Slot } from 'expo-router';

export function ExpoRouterApp() {
  return (
    <CoreProvider>
      <Slot />
    </CoreProvider>
  );
}
