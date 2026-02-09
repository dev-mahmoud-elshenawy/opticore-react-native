import { useContext } from 'react';
import { ThemeContext, ThemeContextValue } from './ThemeProvider';
import { ThemeColors, ThemeSpacing, ThemeTypography, ThemeBorderRadius } from './types';

export interface ThemeHookReturn extends ThemeContextValue {
    colors: ThemeColors;
    spacing: ThemeSpacing;
    typography: ThemeTypography;
    borderRadius: ThemeBorderRadius;
}

/**
 * Hook to access the current theme and control mode.
 */
export function useTheme(): ThemeHookReturn {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return {
        ...context,
        // Shortcuts for easier access
        colors: context.theme.colors,
        spacing: context.theme.spacing,
        typography: context.theme.typography,
        borderRadius: context.theme.borderRadius,
    };
}
