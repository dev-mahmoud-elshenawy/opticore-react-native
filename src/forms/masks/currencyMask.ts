
import { CurrencyOptions } from '../types';

/**
 * Applies a mask to a currency value.
 * @param value The raw number value
 * @param options Formatting options
 * @returns The masked currency string
 */
export function applyCurrencyMask(value: number, options: CurrencyOptions = {}): string {
    const {
        currency = 'USD',
        locale = 'en-US',
        precision = 2
    } = options;

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
    }).format(value);
}

/**
 * Parses a currency string back to a number.
 * @param value The masked currency string
 * @returns The raw number value
 */
export function unmaskCurrency(value: string): number {
    if (!value) return 0;
    // Remove non-numeric characters except for decimal point and minus sign
    // This is a simplified approach and might need adjustment for locales using comma as decimal separator
    const cleanValue = value.replace(/[^0-9.-]+/g, '');
    return parseFloat(cleanValue) || 0;
}
