
import { applyCreditCardMask, unmaskCreditCard, detectCardType } from '../../src/forms/masks/creditCardMask';
import { CardType } from '../../src/forms/types';

describe('Credit Card Mask', () => {
    describe('detectCardType', () => {
        test('should detect Visa', () => {
            expect(detectCardType('4111')).toBe(CardType.VISA);
        });

        test('should detect Mastercard', () => {
            expect(detectCardType('5100')).toBe(CardType.MASTERCARD);
        });

        test('should detect Amex', () => {
            expect(detectCardType('3400')).toBe(CardType.AMEX);
            expect(detectCardType('3700')).toBe(CardType.AMEX);
        });

        test('should detect Discover', () => {
            expect(detectCardType('6011')).toBe(CardType.DISCOVER);
        });

        test('should return unknown for others', () => {
            expect(detectCardType('9999')).toBe(CardType.UNKNOWN);
        });
    });

    describe('applyCreditCardMask', () => {
        test('should format Visa (groups of 4)', () => {
            expect(applyCreditCardMask('4111222233334444')).toBe('4111 2222 3333 4444');
        });

        test('should format Amex (4-6-5)', () => {
            expect(applyCreditCardMask('371122222233333')).toBe('3711 222222 33333');
        });

        test('should handle empty input', () => {
            expect(applyCreditCardMask('')).toBe('');
        });
    });

    describe('unmaskCreditCard', () => {
        test('should return only digits', () => {
            expect(unmaskCreditCard('4111 2222 3333 4444')).toBe('4111222233334444');
        });
    });
});
