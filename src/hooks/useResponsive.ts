import { useWindowDimensions } from 'react-native';
import { useConfig } from '../providers/useConfig';

export interface Breakpoints {
  small?: number;
  medium?: number;
  large?: number;
}

export const defaultBreakpoints: Required<Breakpoints> = {
  small: 360,
  medium: 768,
  large: 1024,
};

// Backward compatibility
export const breakpoints = defaultBreakpoints;

/**
 * Hook for responsive design breakpoints.
 *
 * @param overrides Optional breakpoints to override context/defaults
 * @returns Object containing:
 * - isSmall: boolean (< small)
 * - isMedium: boolean (>= small && < medium)
 * - isLarge: boolean (>= medium && < large)
 * - isXLarge: boolean (>= large)
 * - width: number - Current window width
 */
export function useResponsive(overrides?: Partial<Breakpoints>) {
  const { width } = useWindowDimensions();

  // Try to get config from context, but don't fail if outside provider
  let contextBreakpoints: Partial<Breakpoints> | undefined;
  try {
    const config = useConfig();
    contextBreakpoints = config.responsive;
  } catch {
    // Ignore error if used outside provider
  }

  const activeBreakpoints = {
    ...defaultBreakpoints, // Defaults
    ...contextBreakpoints, // Context
    ...overrides, // Params (highest priority)
  };

  return {
    isSmall: width < activeBreakpoints.small,
    isMedium: width >= activeBreakpoints.small && width < activeBreakpoints.medium,
    isLarge: width >= activeBreakpoints.medium && width < activeBreakpoints.large,
    isXLarge: width >= activeBreakpoints.large,
    width,
  };
}
