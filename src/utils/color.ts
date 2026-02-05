/**
 * Converts a hex string to an RGB object.
 * @param hex - Hex string (#RRGGBB or #RGB)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result =
    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex) ||
    /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);

  if (!result) return null;

  if (result[0].length <= 4) {
    return {
      r: parseInt(result[1] + result[1], 16),
      g: parseInt(result[2] + result[2], 16),
      b: parseInt(result[3] + result[3], 16),
    };
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Converts RGB values to a hex string.
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    const hex = clamped.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Lightens a color by a percentage.
 * @param color - Hex color
 * @param amount - Percentage (0-100)
 */
export function lighten(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const increase = (val: number) => Math.min(255, val + (255 - val) * (amount / 100));

  return rgbToHex(increase(rgb.r), increase(rgb.g), increase(rgb.b));
}

/**
 * Darkens a color by a percentage.
 * @param color - Hex color
 * @param amount - Percentage (0-100)
 */
export function darken(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const decrease = (val: number) => Math.max(0, val * (1 - amount / 100));

  return rgbToHex(decrease(rgb.r), decrease(rgb.g), decrease(rgb.b));
}
