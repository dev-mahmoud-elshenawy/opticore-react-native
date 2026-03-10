
import { PhoneFormat, PhoneLocaleConfig } from '../types';

export const PHONE_LOCALES: Record<string, PhoneLocaleConfig> = {
    'US': { pattern: '(###) ###-####', prefix: '+1', maxDigits: 10 },
    'GB': { pattern: '##### ######', prefix: '+44', maxDigits: 11 },
    'DE': { pattern: '#### ########', prefix: '+49', maxDigits: 12 },
    'FR': { pattern: '## ## ## ## ##', prefix: '+33', maxDigits: 10 },
    'JP': { pattern: '###-####-####', prefix: '+81', maxDigits: 11 },
    'BR': { pattern: '(##) #####-####', prefix: '+55', maxDigits: 11 },
    // Arabian Locales
    'EG': { pattern: '### #### ####', prefix: '+20', maxDigits: 11 }, // e.g. 010 1234 5678
    'SA': { pattern: '### ### ####', prefix: '+966', maxDigits: 10 }, // e.g. 050 123 4567
    'AE': { pattern: '### ### ####', prefix: '+971', maxDigits: 10 }, // e.g. 050 123 4567
    'KW': { pattern: '#### ####', prefix: '+965', maxDigits: 8 },     // e.g. 5000 0000
    'QA': { pattern: '#### ####', prefix: '+974', maxDigits: 8 },     // e.g. 5000 0000
    'BH': { pattern: '#### ####', prefix: '+973', maxDigits: 8 },     // e.g. 3000 0000
    'OM': { pattern: '#### ####', prefix: '+968', maxDigits: 8 },     // e.g. 9000 0000
};


/**
 * Applies a mask to a phone number.
 * @param value The raw phone number
 * @param optionsOrFormat Formatting options or legacy PhoneFormat enum
 * @returns The masked phone number
 */
export function applyPhoneMask(value: string, optionsOrFormat: PhoneFormat | { locale?: string; format?: PhoneFormat; customPattern?: PhoneLocaleConfig } = {}): string {
    if (!value) return '';

    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length === 0) return '';

    // Handle legacy signature (format enum passed directly)
    let options: { locale?: string; format?: PhoneFormat; customPattern?: PhoneLocaleConfig } = {};
    if (typeof optionsOrFormat === 'string') {
        options = { format: optionsOrFormat as PhoneFormat };
    } else {
        options = optionsOrFormat;
    }

    const { format, locale, customPattern } = options;

    // International format: prefix with '+' and group digits in chunks of 3 from the right
    if (format === PhoneFormat.INTERNATIONAL) {
        return `+${cleanValue.replace(/(\d)(?=(\d{3})+$)/g, '$1 ')}`;
    }

    // Resolve locale config (defaults to US)
    let config = PHONE_LOCALES['US'];
    if (customPattern) {
        config = customPattern;
    } else if (locale && PHONE_LOCALES[locale]) {
        config = PHONE_LOCALES[locale];
    }

    // Apply pattern mask: replace '#' placeholders with digits,
    // include separators only when more digits follow
    const { pattern } = config;
    let result = '';
    let valIdx = 0;

    for (let i = 0; i < pattern.length; i++) {
        const char = pattern[i];
        if (char === '#') {
            if (valIdx < cleanValue.length) {
                result += cleanValue[valIdx];
                valIdx++;
            } else {
                break;
            }
        } else {
            // Only include separator if there are more digits to format
            if (valIdx < cleanValue.length) {
                result += char;
            }
        }
    }

    return result;
}

/**
 * Removes the mask from a phone number, returning only digits.
 * @param value The masked phone number
 * @returns The raw phone number (digits only)
 */
export function unmaskPhone(value: string): string {
    return value.replace(/\D/g, '');
}
