/**
 * Navigation Type Definitions
 *
 * Centralized type definitions for navigation and routing.
 * Provides type safety for Expo Router navigation operations.
 *
 * @module types/Navigation
 */

/**
 * Route parameter types.
 *
 * This is an open base interface that consuming apps extend
 * via declaration merging to get type-safe route params for their own routes.
 *
 * OptiCore does NOT define any routes — this is a reusable infrastructure library.
 * Apps define their own route map by merging into this interface.
 *
 * @example
 * ```typescript
 * // In your app's types file (e.g. src/types/routes.d.ts):
 * declare module 'opticore-react-native' {
 *   interface RouteParams {
 *     '/dashboard': undefined;
 *     '/profile/[id]': { id: string };
 *     '/search': { query: string; category?: string };
 *   }
 * }
 * ```
 */
export interface RouteParams {
  [route: string]: Record<string, string | number> | undefined;
}

/**
 * Navigation transition types
 */
export type TransitionType = 'push' | 'pop' | 'replace' | 'reset';

/**
 * Navigation options for route transitions
 */
export interface NavigationOptions {
  /** Replace current route instead of pushing */
  replace?: boolean;
  /** Animation type */
  animation?: 'fade' | 'slide' | 'none';
  /** Gesture enabled */
  gestureEnabled?: boolean;
  /** Custom transition duration */
  transitionDuration?: number;
}

/**
 * Screen configuration metadata
 */
export interface ScreenConfig {
  /** Screen title */
  title?: string;
  /** Whether header is shown */
  headerShown?: boolean;
  /** Background color */
  backgroundColor?: string;
  /** Status bar style */
  statusBarStyle?: 'light' | 'dark' | 'auto';
  /** Orientation lock */
  orientation?: 'portrait' | 'landscape' | 'default';
}

/**
 * Navigation state
 */
export interface NavigationState {
  /** Current routes stack */
  routes: Array<{
    key: string;
    name: string;
    params?: Record<string, unknown>;
  }>;
  /** Index of current route */
  index: number;
  /** History of navigation actions */
  history?: Array<{
    type: string;
    key: string;
  }>;
}

/**
 * Route guard function type
 */
export type RouteGuard = (
  to: string,
  from: string,
  params?: Record<string, unknown>
) => boolean | Promise<boolean>;

/**
 * Navigation helper types
 */
export type NavigateFunction = <T extends keyof RouteParams>(
  route: T,
  params?: RouteParams[T],
  options?: NavigationOptions
) => void;
