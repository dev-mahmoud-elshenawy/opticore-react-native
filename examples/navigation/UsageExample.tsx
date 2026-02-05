/**
 * Usage Example: Navigation Utilities
 * Demonstrates programmatic navigation using useRouteHelper.
 *
 * Route paths are defined by the consuming app — this library
 * accepts plain string routes and does not register any paths.
 */

import { View, Text, Button } from 'react-native';
import { useRouteHelper } from '../../src/navigation/RouteHelper';

// --- Programmatic Navigation Example ---

export const NavigationDemo = () => {
  const { push, replace, back, reset } = useRouteHelper();

  return (
    <View>
      <Text>Navigation Demo</Text>

      {/* Push a route (adds to stack) */}
      <Button title="Go to Search" onPress={() => push('/search', { query: 'react-native' })} />

      {/* Push with numeric params */}
      <Button title="Go to Item" onPress={() => push('/items/detail', { id: 42 })} />

      {/* Replace current screen (no back entry) */}
      <Button title="Replace with Dashboard" onPress={() => replace('/dashboard')} />

      {/* Go back safely */}
      <Button title="Go Back" onPress={() => back()} />

      {/* Reset entire stack */}
      <Button title="Reset to Home" onPress={() => reset('/home')} />
    </View>
  );
};
