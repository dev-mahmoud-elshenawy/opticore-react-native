/**
 * Theme Infrastructure Types
 * Spec 017
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
    // Primary
    primary: string;
    primaryLight: string;
    primaryDark: string;

    // Secondary
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;

    // Backgrounds
    background: string;
    surface: string;
    card: string;

    // Text
    text: string;
    textSecondary: string;
    textDisabled: string;

    // Borders
    border: string;
    divider: string;

    // Status
    error: string;
    warning: string;
    success: string;
    info: string;

    // Extensible
    [key: string]: string;
}

export interface ThemeSpacing {
    xs: number;   // 4
    sm: number;   // 8
    md: number;   // 16
    lg: number;   // 24
    xl: number;   // 32
    xxl: number;  // 48
}

export interface ThemeTypography {
    fontFamily: string;
    sizes: {
        xs: number;   // 10
        sm: number;   // 12
        md: number;   // 14
        lg: number;   // 16
        xl: number;   // 20
        xxl: number;  // 24
        h1: number;   // 32
        h2: number;   // 28
        h3: number;   // 24
    };
    weights: {
        regular: string;
        medium: string;
        semibold: string;
        bold: string;
    };
}

export interface ThemeBorderRadius {
    none: number;   // 0
    sm: number;     // 4
    md: number;     // 8
    lg: number;     // 12
    xl: number;     // 16
    full: number;   // 9999
}

/**
 * React Native shadow object. Spread directly onto a View's style prop.
 * iOS uses shadowColor/shadowOffset/shadowOpacity/shadowRadius.
 * Android uses elevation.
 */
export interface ThemeShadowValue {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
}

export interface ThemeShadows {
    sm: ThemeShadowValue;
    md: ThemeShadowValue;
    lg: ThemeShadowValue;
    [key: string]: ThemeShadowValue;
}

export interface Theme {
    name: string;
    mode: 'light' | 'dark';
    colors: ThemeColors;
    spacing: ThemeSpacing;
    typography: ThemeTypography;
    borderRadius: ThemeBorderRadius;
    shadows: ThemeShadows;
}

export interface ThemeConfig {
    defaultMode?: ThemeMode;
    persistMode?: boolean;
    storageKey?: string;
    followSystem?: boolean;
}

export type ThemeListener = (theme: Theme, mode: ThemeMode) => void;
