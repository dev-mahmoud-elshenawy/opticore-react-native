
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

    // Legacy INTERNATIONAL format behavior
    if (format === PhoneFormat.INTERNATIONAL) {
        // Simple grouping of 3-3-4 or 1-3-3-4 if starting with 1
        // For now, let's just do a simple space separation for readability as requested by "Basic international formatting"
        // But the check in existing code was `+${cleanValue}`. 
        // User Story 2 Scenario 2 says: +1 415 555 2671. 
        // Let's formatting it as groups of 3 or 4? 
        // Actually, generic international formatting is hard without lib-phonenumber.
        // Let's stick to the test expectation in Scenario 2: "+1 415 555 2671" (1-3-3-4)
        // Or if just numbers: "+1 234 567 890" (1-3-3-3).

        // Simple fallback: chunks of 3 from end
        return `+${cleanValue.replace(/(\d)(?=(\d{3})+$)/g, '$1 ')}`;
    }

    // Locale-based formatting
    let config = PHONE_LOCALES['US']; // Default
    if (customPattern) {
        config = customPattern;
    } else if (locale && PHONE_LOCALES[locale]) {
        config = PHONE_LOCALES[locale];
    } else if (locale && !PHONE_LOCALES[locale]) {
        // Fallback to US if unknown locale
        config = PHONE_LOCALES['US'];
    }

    // Apply pattern
    let result = '';
    let valIdx = 0;
    const pattern = config.pattern;

    for (let i = 0; i < pattern.length && valIdx < cleanValue.length; i++) {
        const char = pattern[i];
        if (char === '#') {
            result += cleanValue[valIdx];
            valIdx++;
        } else {
            result += char;
            // If the pattern character isn't a digit holder, we just append it.
            // If we haven't consumed all input digits yet, we continue.
            // But if we run out of input digits, we should stop unless it's a static separator?
            // Actually, usually we stop IF the next char is a placeholder we can't fill.
            // But if it's a separator, we might omit it if it's at the end.
        }
    }

    // Trim trailing separators if we didn't finish the mask
    // e.g. pattern "(###) ###-####", input "123". Result "(123) ". Trim to "(123)"?
    // User expectation: "123456" -> "(123) 456".
    // My loop above would output "(123) 456" exactly because it appends separators.

    // Better logic: only append validation chars IF we have more digits to come?
    // Or simpler: formatting loop.

    // Let's use a robust loop:
    // Re-do loop
    result = '';
    valIdx = 0;
    for (let i = 0; i < pattern.length; i++) {
        const char = pattern[i];
        if (char === '#') {
            if (valIdx < cleanValue.length) {
                result += cleanValue[valIdx];
                valIdx++;
            } else {
                break; // No more digits
            }
        } else {
            // It's a separator. Only add if we have more digits to output, OR if we strictly want partial mask?
            // US mask: (123) -> (123).  (123) 4 -> (123) 4.
            // so we add separators if we have successfully added the PREVIOUS digit?
            // AND if there are more digits coming or we are in the middle?

            // Standard mask logic often fills until end of input.
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
