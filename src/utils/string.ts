/**
 * Safely returns a string or a fallback if null/undefined.
 * @param str - The string to check
 * @param fallback - Fallback value (default: '')
 */
export function notNull(str: string | null | undefined, fallback: string = ''): string {
  if (str === null || str === undefined) {
    return fallback;
  }
  return str;
}

/**
 * Capitalizes the first letter of a string and lowercases the rest.
 * @param str - Input string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncates a string to a maximum length and appends a suffix.
 * @param str - Input string
 * @param length - Maximum length (default: 50)
 * @param suffix - Suffix to append if truncated (default: '...')
 */
export function truncate(str: string, length: number = 50, suffix: string = '...'): string {
  if (!str || str.length <= length) return str;
  return str.substring(0, length) + suffix;
}

/**
 * Masks a string, keeping only the last few characters visible.
 * Useful for phone numbers or credit cards.
 * @param str - Input string
 * @param visibleChars - Number of characters to keep visible at the end (default: 4)
 * @param maskChar - Character to use for masking (default: '*')
 */
export function maskSensitive(
  str: string,
  visibleChars: number = 4,
  maskChar: string = '*'
): string {
  if (!str || str.length <= visibleChars) return str;
  const maskedLength = str.length - visibleChars;
  return maskChar.repeat(maskedLength) + str.slice(-visibleChars);
}

/**
 * Converts a string to camelCase.
 * @param str - Input string (snake_case, kebab-case, or space separated)
 */
export function toCamelCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/\s+/g, '_') // Convert spaces to underscores first
    .replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));
}

/**
 * Converts a string to snake_case.
 * @param str - Input string
 */
export function toSnakeCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    .replace(/[\s\-]+/g, '_')
    .replace(/^_/, ''); // Remove leading underscore if result of first capital
}

/**
 * Converts a string to kebab-case.
 * @param str - Input string
 */
export function toKebabCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    .replace(/[\s_]+/g, '-')
    .replace(/^-/, ''); // Remove leading dash
}

/**
 * Checks if a string is null, undefined, empty, or whitespace only.
 * @param str - Input string
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Validates if a string is a valid email format.
 * basic regex validation.
 * @param str - Input string
 */
export function isEmail(str: string): boolean {
  if (!str) return false;
  // Simple regex for basic validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
}

/**
 * Validates if a string is a valid URL.
 * @param str - Input string
 */
export function isURL(str: string): boolean {
  if (!str) return false;
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
