import { useWindowDimensions } from 'react-native';

export const breakpoints = {
    small: 360,
    medium: 768,
    large: 1024,
};

/**
 * Hook for responsive design breakpoints.
 *
 * @returns Object containing:
 * - isSmall: boolean (< 360px)
 * - isMedium: boolean (>= 360px && < 768px)
 * - isLarge: boolean (>= 768px && < 1024px)
 * - isXLarge: boolean (>= 1024px)
 * - width: number - Current window width
 */
export function useResponsive() {
    const { width } = useWindowDimensions();

    return {
        isSmall: width < breakpoints.small,
        isMedium: width >= breakpoints.small && width < breakpoints.medium,
        isLarge: width >= breakpoints.medium && width < breakpoints.large,
        isXLarge: width >= breakpoints.large,
        width,
    };
}
