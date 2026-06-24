import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { RenderError } from './RenderError';

export interface DefaultErrorFallbackProps {
  /** The classified render error that triggered the fallback. */
  error: RenderError;
  /** Clears error state and attempts to re-render children. */
  onReset: () => void;
}

/**
 * Built-in fallback UI for OptiCoreErrorBoundary.
 * Displays the error's user-facing message and a "Try Again" button.
 * Replace via the `fallback` prop on OptiCoreErrorBoundary if you need custom UI.
 */
export function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps): React.ReactElement {
  // Build styles lazily on first render rather than at module load. Keeping
  // `StyleSheet.create` out of module scope means importing the library (e.g.
  // for `ApiClient` or `buildUrl`) does not eagerly evaluate React Native's
  // StyleSheet/native modules — which keeps non-UI usage and tests side-effect free.
  const styles = React.useMemo(() => createStyles(), []);

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{error.userMessage}</Text>
      <TouchableOpacity style={styles.button} onPress={onReset}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    message: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 16,
    },
    button: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: '#007AFF',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
