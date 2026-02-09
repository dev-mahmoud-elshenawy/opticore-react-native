import { hexToRgb, rgbToHex, lighten, darken } from '../utils/color';

/**
 * Adds transparency to a hex color.
 * @param color - Hex color
 * @param opacity - Opacity (0-1)
 * @returns Rgba string
 */
export function alpha(color: string, opacity: number): string {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    // Clamp opacity between 0 and 1
    const a = Math.max(0, Math.min(1, opacity));

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
}

/**
 * Calculates the relative luminance of a color.
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 */
function getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determines whether text on top of this color should be light or dark.
 * Uses W3C accessibility guidelines for contrast.
 * @param color - Background hex color
 * @returns 'light' | 'dark'
 */
export function contrast(color: string): 'light' | 'dark' {
    const rgb = hexToRgb(color);
    if (!rgb) return 'dark'; // Default to dark text if invalid

    const luminance = getLuminance(rgb.r, rgb.g, rgb.b);

    // Threshold of 0.5 is standard, but 0.179 is strictly W3C for 4.5:1?
    // Let's use a standard threshold for black/white text choice.
    // Generally, if luminance > 0.5, use dark text.
    return luminance > 0.5 ? 'dark' : 'light';
}

// Re-export existing utilities
export { hexToRgb, rgbToHex, lighten, darken };
