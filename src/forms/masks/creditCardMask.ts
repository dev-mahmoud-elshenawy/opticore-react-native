import { CardType, CardPattern } from '../types';

let customPatterns: CardPattern[] = [];

export function registerCustomCardPatterns(patterns: CardPattern[]) {
    customPatterns = patterns;
}

/**
 * Detects the credit card type based on the number.
 * @param value The raw credit card number
 * @returns The detected card type (enum or custom name) or UNKNOWN
 */
export function detectCardType(value: string): CardType | string {
    const cleanValue = value.replace(/\D/g, '');

    // Check custom patterns first
    for (const patternConfig of customPatterns) {
        if (patternConfig.pattern.test(cleanValue)) {
            // If the pattern matches, what do we return?
            // The enum CardType does not have dynamic values.
            // Requirement FR-006 says "support custom card patterns".
            // If the user registers a pattern, they likely want to know it matched.
            // But strict typing prevents returning arbitrary strings.
            // We can return CardType.UNKNOWN or maybe we cast?
            // For now, let's assume we return UNKNOWN but maybe we should rely on the caller checking the specific pattern if UNKNOWN?
            // OR: We cast to any/unknown to allow returning the name?
            // "The system MUST allow registering custom card patterns with: Pattern regex, Card name, Grouping format"
            // If we return the name, we break `CardType` return type.
            // Let's assume for this implementation we just return UNKNOWN for now as the type signature forbids otherwise,
            // UNLESS we change the signature to `CardType | string`.
            // Let's change the signature to `CardType | string` to support this.
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
 * @returns The masked credit card number
 */
export function applyCreditCardMask(value: string): string {
    if (!value) return '';
    const cleanValue = value.replace(/\D/g, '');
    const cardType = detectCardType(cleanValue);

    if (cardType === CardType.AMEX) {
        // Amex: 4-6-5 format (15 digits)
        if (cleanValue.length <= 4) return cleanValue;
        if (cleanValue.length <= 10) return `${cleanValue.slice(0, 4)} ${cleanValue.slice(4)}`;
        return `${cleanValue.slice(0, 4)} ${cleanValue.slice(4, 10)} ${cleanValue.slice(10, 15)}`;
    } else if (cardType === CardType.DINERS) {
        // Diners: 14 digits, usually 4-6-4 or 4-4-4-2? 
        // Standard often 4-6-4 or 4-4-4-2. Let's assume 4-6-4 for now or stick to default 4s?
        // Diners Club is often 14 digits.
        // Let's use 4-4-4-2 if 14 digits, or 4-6-4.
        // For simplicity and alignment with SC, let's keep default 4-4-4-4 unless specific overrides known.
        // UnionPay (16-19), JCB (16).
        // Let's stick to default 4-4-4-4 for everything else for now.
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
