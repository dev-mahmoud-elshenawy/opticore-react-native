
import { PhoneFormat } from '../types';

/**
 * Applies a mask to a phone number.
 * @param value The raw phone number
 * @param format The desired format (US or INTERNATIONAL)
 * @returns The masked phone number
 */
export function applyPhoneMask(value: string, format: PhoneFormat = PhoneFormat.US): string {
    if (!value) return '';

    const cleanValue = value.replace(/\D/g, '');

    if (format === PhoneFormat.US) {
        if (cleanValue.length === 0) return '';
        if (cleanValue.length <= 3) return cleanValue;
        if (cleanValue.length <= 6) return `(${cleanValue.slice(0, 3)}) ${cleanValue.slice(3)}`;
        return `(${cleanValue.slice(0, 3)}) ${cleanValue.slice(3, 6)}-${cleanValue.slice(6, 10)}`;
    } else {
        // Basic international formatting: +123 456 789
        // This is a simplified implementation, real international formatting is complex
        return `+${cleanValue}`;
    }
}

/**
 * Removes the mask from a phone number, returning only digits.
 * @param value The masked phone number
 * @returns The raw phone number (digits only)
 */
export function unmaskPhone(value: string): string {
    return value.replace(/\D/g, '');
}
