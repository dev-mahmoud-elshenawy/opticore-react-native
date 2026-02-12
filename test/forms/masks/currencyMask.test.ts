import { applyCurrencyMask, unmaskCurrency } from '../../../src/forms/masks/currencyMask';

describe('Currency Mask', () => {
    describe('applyCurrencyMask', () => {
        test('should format USD correctly by default (en-US)', () => {
            const result = applyCurrencyMask(1234.56);
            expect(result).toBe('$1,234.56');
        });

        test('should format EUR correctly for de-DE', () => {
            const result = applyCurrencyMask(1234.56, { locale: 'de-DE', currency: 'EUR' });
            // Expect 1.234,56 € (with space)
            expect(result).toBe('1.234,56 €');
        });

        test('should format EUR correctly for fr-FR', () => {
            const result = applyCurrencyMask(1234.56, { locale: 'fr-FR', currency: 'EUR' });
            // Expect 1 234,56 €
            expect(result).toBe('1 234,56 €');
        });

        test('should format JPY correctly for ja-JP', () => {
            const result = applyCurrencyMask(1234, { locale: 'ja-JP', currency: 'JPY', precision: 0 });
            // Expect ¥1,234
            expect(result).toBe('¥1,234');
        });

        test('should format BRL correctly for pt-BR', () => {
            const result = applyCurrencyMask(1234.56, { locale: 'pt-BR', currency: 'BRL' });
            // Expect R$ 1.234,56
            expect(result).toBe('R$ 1.234,56');
        });

        test('should fallback to en-US behavior for unknown locale', () => {
            const result = applyCurrencyMask(1234.56, { locale: 'xx-XX' });
            expect(result).toBe('$1,234.56');
        });

        // Arabian Locales
        test('should format EGP correctly for ar-EG', () => {
            const result = applyCurrencyMask(1234.56, { locale: 'ar-EG', currency: 'EGP' });
            expect(result).toBe('1,234.56 EGP');
        });

        test('should format SAR correctly for ar-SA', () => {
            const result = applyCurrencyMask(1234.56, { locale: 'ar-SA', currency: 'SAR' });
            expect(result).toBe('1,234.56 SAR');
        });

        test('should format AED correctly for ar-AE', () => {
            const result = applyCurrencyMask(1234.56, { locale: 'ar-AE', currency: 'AED' });
            expect(result).toBe('1,234.56 AED');
        });
    });

    describe('unmaskCurrency', () => {
        test('should parse USD string to number (en-US)', () => {
            expect(unmaskCurrency('$1,234.56', { locale: 'en-US' })).toBe(1234.56);
        });

        test('should parse EUR string to number (de-DE)', () => {
            // German uses comma as decimal
            expect(unmaskCurrency('1.234,56 €', { locale: 'de-DE' })).toBe(1234.56);
        });

        test('should parse EUR string to number (fr-FR)', () => {
            // French uses comma as decimal
            expect(unmaskCurrency('1 234,56 €', { locale: 'fr-FR' })).toBe(1234.56);
        });

        test('should parse JPY string to number (ja-JP)', () => {
            expect(unmaskCurrency('¥1,234', { locale: 'ja-JP' })).toBe(1234);
        });

        test('should parse BRL string to number (pt-BR)', () => {
            expect(unmaskCurrency('R$ 1.234,56', { locale: 'pt-BR' })).toBe(1234.56);
        });

        test('should parse EGP string to number (ar-EG)', () => {
            expect(unmaskCurrency('1,234.56 EGP', { locale: 'ar-EG' })).toBe(1234.56);
        });

        test('should handle empty or invalid input', () => {
            expect(unmaskCurrency('')).toBe(0);
            expect(unmaskCurrency('abc')).toBe(0);
        });
    });
});
