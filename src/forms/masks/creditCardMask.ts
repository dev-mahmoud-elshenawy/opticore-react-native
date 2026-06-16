import { CardType, CardPattern } from '../types';

// Module-level convenience registry. Kept for backward compatibility, but the
// `detectCardType`/`applyCreditCardMask` functions also accept an explicit
// `patterns` argument so callers can avoid the shared mutable state entirely.
let customPatterns: CardPattern[] = [];

export function registerCustomCardPatterns(patterns: CardPattern[]) {
    customPatterns = patterns;
}

/**
 * Detects the credit card type based on the number.
 * @param value The raw credit card number
 * @param patterns Custom patterns to check first. Defaults to the globally
 *   registered patterns (see {@link registerCustomCardPatterns}); pass an
 *   explicit array to stay free of the shared module state.
 * @returns The detected card type (enum or custom name) or UNKNOWN
 */
export function detectCardType(value: string, patterns: CardPattern[] = customPatterns): CardType | string {
    const cleanValue = value.replace(/\D/g, '');

    // Custom patterns take precedence; return the registered name on a match.
    for (const patternConfig of patterns) {
        if (patternConfig.pattern.test(cleanValue)) {
            return patternConfig.name;
        }
    }

    // Standard Types
    if (/^4/.test(cleanValue)) return CardType.VISA;
    if (/^5[1-5]/.test(cleanValue)) return CardType.MASTERCARD;
    if (/^3[47]/.test(cleanValue)) return CardType.AMEX;
    if (/^6(?:011|5)/.test(cleanValue)) return CardType.DISCOVER;

    // New Types
    if (/^62/.test(cleanValue)) return CardType.UNIONPAY;
    if (/^35/.test(cleanValue)) return CardType.JCB;
    if (/^(30|36|38)/.test(cleanValue)) return CardType.DINERS;

    return CardType.UNKNOWN;
}

/**
 * Validates a credit card number using the Luhn algorithm.
 * @param value The raw or masked credit card number
 * @returns True if valid, false otherwise
 */
export function validateCardNumber(value: string): boolean {
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) return false;

    let nCheck = 0;
    let bEven = false;

    for (let n = cleanValue.length - 1; n >= 0; n--) {
        let cDigit = parseInt(cleanValue.charAt(n), 10);

        if (bEven) {
            if ((cDigit *= 2) > 9) cDigit -= 9;
        }

        nCheck += cDigit;
        bEven = !bEven;
    }

    return (nCheck % 10) === 0;
}

/**
 * Applies a mask to a credit card number.
 * @param value The raw credit card number
 * @param patterns Custom patterns forwarded to {@link detectCardType}.
 * @returns The masked credit card number
 */
export function applyCreditCardMask(value: string, patterns: CardPattern[] = customPatterns): string {
    if (!value) return '';
    const cleanValue = value.replace(/\D/g, '');
    const cardType = detectCardType(cleanValue, patterns);

    if (cardType === CardType.AMEX) {
        // Amex: 4-6-5 format (15 digits)
        if (cleanValue.length <= 4) return cleanValue;
        if (cleanValue.length <= 10) return `${cleanValue.slice(0, 4)} ${cleanValue.slice(4)}`;
        return `${cleanValue.slice(0, 4)} ${cleanValue.slice(4, 10)} ${cleanValue.slice(10, 15)}`;
    } else if (cardType === CardType.DINERS) {
        // Diners Club: 14 digits, 4-6-4 grouping.
        if (cleanValue.length <= 4) return cleanValue;
        if (cleanValue.length <= 10) return `${cleanValue.slice(0, 4)} ${cleanValue.slice(4)}`;
        return `${cleanValue.slice(0, 4)} ${cleanValue.slice(4, 10)} ${cleanValue.slice(10, 14)}`;
    }

    // Default (Visa, MC, Discover, UnionPay, JCB, etc.): 4-4-4-4 format (16 digits)
    const groups = cleanValue.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleanValue;
}

/**
 * Removes the mask from a credit card number.
 * @param value The masked credit card number
 * @returns The raw credit card number
 */
export function unmaskCreditCard(value: string): string {
    return value.replace(/\D/g, '');
}
