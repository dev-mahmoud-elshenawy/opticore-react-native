
import { CurrencyOptions, CurrencyLocaleConfig } from '../types';

export const CURRENCY_LOCALES: Record<string, CurrencyLocaleConfig> = {
    'en-US': { decimalSeparator: '.', thousandsSeparator: ',', symbolPosition: 'before', symbol: '$' },
    'de-DE': { decimalSeparator: ',', thousandsSeparator: '.', symbolPosition: 'after', symbol: ' €' },
    'fr-FR': { decimalSeparator: ',', thousandsSeparator: ' ', symbolPosition: 'after', symbol: ' €' },
    'ja-JP': { decimalSeparator: '.', thousandsSeparator: ',', symbolPosition: 'before', symbol: '¥' },
    'pt-BR': { decimalSeparator: ',', thousandsSeparator: '.', symbolPosition: 'before', symbol: 'R$ ' },
    // Arabian Locales (using English-friendly formatting for compatibility)
    'ar-EG': { decimalSeparator: '.', thousandsSeparator: ',', symbolPosition: 'after', symbol: ' EGP' },
    'ar-SA': { decimalSeparator: '.', thousandsSeparator: ',', symbolPosition: 'after', symbol: ' SAR' },
    'ar-AE': { decimalSeparator: '.', thousandsSeparator: ',', symbolPosition: 'after', symbol: ' AED' },
    'ar-KW': { decimalSeparator: '.', thousandsSeparator: ',', symbolPosition: 'after', symbol: ' KWD' },
    'ar-QA': { decimalSeparator: '.', thousandsSeparator: ',', symbolPosition: 'after', symbol: ' QAR' },
};

/**
 * Applies a mask to a currency value.
 * @param value The raw number value
 * @param options Formatting options
 * @returns The masked currency string
 */
export function applyCurrencyMask(value: number, options: CurrencyOptions = {}): string {
    const {
        locale = 'en-US',
        precision = 2
    } = options;

    const config = CURRENCY_LOCALES[locale] || CURRENCY_LOCALES['en-US'];
    const currencySymbol = options.symbol || ((options.currency && options.currency !== 'USD') ? ` ${options.currency}` : config.symbol);

    // 1. Format number with fixed precision
    const fixedValue = value.toFixed(precision);

    // 2. Split integer and fraction
    const [integerPart, fractionPart] = fixedValue.split('.');

    // 3. Add thousands separators to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator);

    // 4. Construct main number string
    let formattedNumber = formattedInteger;
    if (precision > 0) {
        formattedNumber += config.decimalSeparator + fractionPart;
    }

    // 5. Add symbol based on position
    if (config.symbolPosition === 'before') {
        return `${currencySymbol}${formattedNumber}`;
    } else {
        return `${formattedNumber}${currencySymbol}`;
    }
}

/**
 * Parses a currency string back to a number.
 * @param value The masked currency string
 * @param options Parsing options (locale needed for correct decimal separator)
 * @returns The raw number value
 */
export function unmaskCurrency(value: string, options: { locale?: string } = {}): number {
    if (!value) return 0;

    const locale = options.locale || 'en-US';
    const config = CURRENCY_LOCALES[locale] || CURRENCY_LOCALES['en-US'];

    // 1. Escape special regex characters for separators
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const decimalSep = esc(config.decimalSeparator);

    // 2. Remove everything that is NOT a digit, minus sign, or the decimal separator
    // We construct a regex like: /[^0-9-\.]/g (if decimal is dot)
    const allowedCharsRegex = new RegExp(`[^0-9-${decimalSep}]`, 'g');
    let cleanValue = value.replace(allowedCharsRegex, '');

    // 3. Replace the locale-specific decimal separator with a standard dot '.'
    // validation: ensure only the last decimal separator is treated as decimal if multiple exist (unlikely in valid input but possible in messy input)
    // For simplicity, we just replace all occurrences.
    if (config.decimalSeparator !== '.') {
        cleanValue = cleanValue.split(config.decimalSeparator).join('.');
    }

    // 4. Handle edge case: multiple dots? parseFloat handles up to first non-digit/dot usually.
    // If we have "1.234.56" (where dot was thousands sep), step 2 removed the dots (since they matched decimalSep IF decimalSep was dot).
    // WAIT. If thousandsSep IS dot (de-DE), and decimalSep IS comma.
    // step 2 regex `[^0-9-,]` -> removes dots. Correct.
    // step 3 replace comma with dot. Correct.

    // Edge case: en-US "1,234.56". decimalSep = dot.
    // regex `[^0-9-.]` -> removes commas. Correct.

    return parseFloat(cleanValue) || 0;
}
