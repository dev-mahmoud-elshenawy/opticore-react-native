/**
 * Navigation Type Definitions
 *
 * Centralized type definitions for navigation and routing.
 * Provides type safety for Expo Router navigation operations.
 *
 * @module types/Navigation
 */

/**
 * Route parameter types
 * Define your route parameters here for type safety
 */
export interface RouteParams {
  /** User profile route */
  'user/[id]': { id: string };
  /** Product details route */
  'product/[id]': { id: string };
  /** Search results route */
  search: { query: string; category?: string };
  /** Settings route */
  settings: undefined;
  /** Home route */
  index: undefined;
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
