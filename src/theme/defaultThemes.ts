import type { Theme } from './types';

export const lightTheme: Theme = {
    name: 'light',
    mode: 'light',
    colors: {
        // Primary - Deep Blue
        primary: '#1976D2',
        primaryLight: '#42A5F5',
        primaryDark: '#1565C0',

        // Secondary - Teal
        secondary: '#009688',
        secondaryLight: '#26A69A',
        secondaryDark: '#00796B',

        // Backgrounds
        background: '#FFFFFF',
        surface: '#F5F5F5',
        card: '#FFFFFF',

        // Text
        text: '#212121',
        textSecondary: '#757575',
        textDisabled: '#9E9E9E',

        // Borders
        border: '#E0E0E0',
        divider: '#BDBDBD',

        // Status
        error: '#D32F2F',
        warning: '#FFA000',
        success: '#388E3C',
        info: '#1976D2',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    typography: {
        fontFamily: 'System',
        sizes: {
            xs: 10,
            sm: 12,
            md: 14,
            lg: 16,
            xl: 20,
            xxl: 24,
            h1: 32,
            h2: 28,
            h3: 24,
        },
        weights: {
            regular: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
        },
    },
    borderRadius: {
        none: 0,
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
    },
    shadows: {
        sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
        md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
        lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 8 },
    },
};

export const darkTheme: Theme = {
    name: 'dark',
    mode: 'dark',
    colors: {
        // Primary - Lighter Blue for dark mode
        primary: '#90CAF9',
        primaryLight: '#BBDEFB',
        primaryDark: '#42A5F5',

        // Secondary - Lighter Teal for dark mode
        secondary: '#80CBC4',
        secondaryLight: '#B2DFDB',
        secondaryDark: '#009688',

        // Backgrounds
        background: '#121212',
        surface: '#1E1E1E',
        card: '#2C2C2C',

        // Text
        text: '#FFFFFF',
        textSecondary: '#B0BEC5',
        textDisabled: '#607D8B',

        // Borders
        border: '#37474F',
        divider: '#455A64',

        // Status (Adjusted for dark mode visibility)
        error: '#EF5350',
        warning: '#FFCA28',
        success: '#66BB6A',
        info: '#42A5F5',
    },
    spacing: lightTheme.spacing,
    typography: lightTheme.typography,
    borderRadius: lightTheme.borderRadius,
    shadows: {
        sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 2 },
        md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
        lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
    },
};
