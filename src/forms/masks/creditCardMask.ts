
import { CardType } from '../types';

/**
 * Detects the credit card type based on the number.
 * @param value The raw credit card number
 * @returns The detected card type or UNKNOWN
 */
export function detectCardType(value: string): CardType {
    const cleanValue = value.replace(/\D/g, '');

    if (/^4/.test(cleanValue)) return CardType.VISA;
    if (/^5[1-5]/.test(cleanValue)) return CardType.MASTERCARD;
    if (/^3[47]/.test(cleanValue)) return CardType.AMEX;
    if (/^6(?:011|5)/.test(cleanValue)) return CardType.DISCOVER;

    return CardType.UNKNOWN;
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
    } else {
        // Default (Visa, MC, Discover, etc.): 4-4-4-4 format (16 digits)
        const groups = cleanValue.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleanValue;
    }
}

/**
 * Removes the mask from a credit card number.
 * @param value The masked credit card number
 * @returns The raw credit card number
 */
export function unmaskCreditCard(value: string): string {
    return value.replace(/\D/g, '');
}
