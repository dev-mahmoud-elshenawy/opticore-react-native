
import { applyCurrencyMask, unmaskCurrency } from '../../src/forms/masks/currencyMask';

describe('Currency Mask', () => {
    describe('applyCurrencyMask', () => {
        test('should format USD correctly by default', () => {
            // Note: non-breaking space might be used by Intl not normal space
            const result = applyCurrencyMask(1234.56);
            expect(result).toContain('1,234.56');
            expect(result).toContain('$');
        });

        test('should handle custom currency', () => {
            const result = applyCurrencyMask(1234.56, { currency: 'EUR', locale: 'de-DE' });
            expect(result).toContain('1.234,56');
            expect(result).toContain('€');
        });

        test('should handle custom precision', () => {
            const result = applyCurrencyMask(1234.567, { precision: 3 });
            expect(result).toContain('1,234.567');
        });
    });

    describe('unmaskCurrency', () => {
        test('should parse currency string to number', () => {
            expect(unmaskCurrency('$1,234.56')).toBe(1234.56);
        });

        test('should handle empty or invalid input', () => {
            expect(unmaskCurrency('')).toBe(0);
            expect(unmaskCurrency('abc')).toBe(0);
        });
    });
});
