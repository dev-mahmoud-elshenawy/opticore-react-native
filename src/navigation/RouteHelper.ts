import { useRouter } from 'expo-router';

/**
 * Parameters for navigation — plain key-value pairs.
 * Consuming apps define their own route paths; this library does not register any.
 */
export type NavigationParams = Record<string, string | number>;

/**
 * Custom hook providing programmatic navigation helpers on top of Expo Router.
 *
 * Accepts plain string route paths — no route registration required.
 * Designed as core infrastructure to be used across many projects.
 *
 * @example
 * ```typescript
 * const { push, replace, back, backWithData, reset } = useRouteHelper();
 *
 * push('/home');
 * push('/user/profile', { id: '123' });
 * replace('/login');
 * back();
 * backWithData({ selected: 'item-42' });
 * reset('/home');
 * ```
 */
export const useRouteHelper = () => {
  const router = useRouter();

  /**
   * Navigate to a route (push onto stack).
   * @param route - The route path string
   * @param params - Optional navigation parameters
   */
  const push = (route: string, params?: NavigationParams): void => {
    if (params) {
      router.push({ pathname: route, params });
    } else {
      router.push(route);
    }
  };

  /**
   * Replace the current screen with a new route (no back entry).
   * @param route - The route path string
   * @param params - Optional navigation parameters
   */
  const replace = (route: string, params?: NavigationParams): void => {
    if (params) {
      router.replace({ pathname: route, params });
    } else {
      router.replace(route);
    }
  };

  /**
   * Go back one step in the navigation stack.
   * Safe — no-op if already at the root screen.
   */
  const back = (): void => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  /**
   * Go back one step and pass data to the previous screen.
   *
   * Sets navigation params before going back so the previous screen can read them
   * via `useLocalSearchParams()`.
   *
   * Safe — no-op if already at the root screen.
   *
   * @param data - Key-value pairs to pass to the previous screen
   *
   * @example
   * ```typescript
   * // Screen B: go back with result
   * backWithData({ selected: 'item-42', confirmed: 'true' });
   *
   * // Screen A: read the returned data
   * const params = useLocalSearchParams();
   * console.log(params.selected); // 'item-42'
   * ```
   */
  const backWithData = (data: NavigationParams): void => {
    if (router.canGoBack()) {
      (router as unknown as { setParams: (params: Record<string, string>) => void }).setParams(
        data as Record<string, string>
      );
      router.back();
    }
  };

  /**
   * Clear the entire navigation stack and navigate to a route.
   * Uses dismissAll() to clear all screens, then replace() to set the new root.
   * @param route - The route path string
   * @param params - Optional navigation parameters
   */
  const reset = (route: string, params?: NavigationParams): void => {
    if (router.canGoBack()) {
      router.dismissAll();
    }
    replace(route, params);
  };

  return { push, replace, back, backWithData, reset };
};
