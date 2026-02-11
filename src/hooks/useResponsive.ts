import { useWindowDimensions } from 'react-native';
import { useConfig } from '../providers/useConfig';
import { ResponsiveConfig } from '../config/types';

export const breakpoints = {
  small: 360,
  medium: 768,
  large: 1024,
};

/**
 * Hook for responsive design breakpoints.
 *
 * @param customBreakpoints Optional breakpoints to override context/defaults
 * @returns Object containing:
 * - isSmall: boolean (< small)
 * - isMedium: boolean (>= small && < medium)
 * - isLarge: boolean (>= medium && < large)
 * - isXLarge: boolean (>= large)
 * - width: number - Current window width
 */
export function useResponsive(customBreakpoints?: ResponsiveConfig['breakpoints']) {
  const { width } = useWindowDimensions();

  // Try to get config from context, but don't fail if outside provider
  let contextBreakpoints;
  try {
    const config = useConfig();
    contextBreakpoints = config.responsive;
  } catch (e) {
    // Ignore error if used outside provider
  }

  const activeBreakpoints = {
    ...breakpoints, // Defaults
    ...contextBreakpoints, // Context
    ...customBreakpoints, // Params (highest priority)
  };

  return {
    isSmall: width < activeBreakpoints.small!,
    isMedium: width >= activeBreakpoints.small! && width < activeBreakpoints.medium!,
    isLarge: width >= activeBreakpoints.medium! && width < activeBreakpoints.large!,
    isXLarge: width >= activeBreakpoints.large!,
    width,
  };
}
