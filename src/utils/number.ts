/**
 * Safely parses a value to an integer.
 * @param value - Input value
 * @param fallback - Fallback if parsing fails (default: 0)
 */
export function toInt(value: unknown, fallback: number = 0): number {
  if (value === null || value === undefined) return fallback;
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Safely parses a value to a float.
 * @param value - Input value
 * @param fallback - Fallback if parsing fails (default: 0)
 */
export function toDouble(value: unknown, fallback: number = 0): number {
  if (value === null || value === undefined) return fallback;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Clamps a number between a minimum and maximum value.
 * @param value - Input value
 * @param min - Minimum value
 * @param max - Maximum value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generates a random integer between min and max (inclusive).
 * @param min - Minimum value
 * @param max - Maximum value
 */
export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
