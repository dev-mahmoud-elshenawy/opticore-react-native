
import { applyPhoneMask, unmaskPhone } from '@/forms/masks/phoneMask';
import { PhoneFormat } from '@/forms/types';

describe('Phone Mask', () => {
    describe('applyPhoneMask', () => {
        test('should format US phone numbers correctly', () => {
            expect(applyPhoneMask('1234567890')).toBe('(123) 456-7890');
            expect(applyPhoneMask('123')).toBe('123');
            expect(applyPhoneMask('123456')).toBe('(123) 456');
        });

        test('should handle empty input', () => {
            expect(applyPhoneMask('')).toBe('');
            expect(applyPhoneMask(null as any)).toBe('');
        });

        test('should format international phone numbers', () => {
            expect(applyPhoneMask('1234567890', PhoneFormat.INTERNATIONAL)).toBe('+1234567890');
        });

        test('should strip non-numeric characters', () => {
            expect(applyPhoneMask('(123) abc 456-7890')).toBe('(123) 456-7890');
        });
    });

    describe('unmaskPhone', () => {
        test('should return only digits', () => {
            expect(unmaskPhone('(123) 456-7890')).toBe('1234567890');
            expect(unmaskPhone('+1 (234) 567-8900')).toBe('12345678900');
        });
    });
});
