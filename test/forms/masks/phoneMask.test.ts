import { applyPhoneMask, unmaskPhone } from '../../../src/forms/masks/phoneMask';
import { PhoneFormat } from '../../../src/forms/types';

describe('Phone Mask', () => {
  describe('applyPhoneMask', () => {
    test('should format US phone numbers correctly (default)', () => {
      expect(applyPhoneMask('1234567890')).toBe('(123) 456-7890');
      // Partial input: leading separator '(' is added before first digit group
      expect(applyPhoneMask('123')).toBe('(123');
      expect(applyPhoneMask('123456')).toBe('(123) 456');
    });

    test('should handle empty input', () => {
      expect(applyPhoneMask('')).toBe('');
      expect(applyPhoneMask(null as any)).toBe('');
    });

    test('should format international phone numbers (legacy format)', () => {
      expect(applyPhoneMask('1234567890', { format: PhoneFormat.INTERNATIONAL })).toBe(
        '+1 234 567 890'
      );
    });

    // Locale Tests
    test('should format GB phone numbers', () => {
      // GB: ##### ######
      expect(applyPhoneMask('07911123456', { locale: 'GB' })).toBe('07911 123456');
    });

    test('should format DE phone numbers', () => {
      // DE: #### ########
      expect(applyPhoneMask('015112345678', { locale: 'DE' })).toBe('0151 12345678');
    });

    test('should format FR phone numbers', () => {
      // FR: ## ## ## ## ##
      expect(applyPhoneMask('0612345678', { locale: 'FR' })).toBe('06 12 34 56 78');
    });

    test('should format JP phone numbers', () => {
      // JP: ###-####-####
      expect(applyPhoneMask('09012345678', { locale: 'JP' })).toBe('090-1234-5678');
    });

    test('should format BR phone numbers', () => {
      // BR: (##) #####-####
      expect(applyPhoneMask('11912345678', { locale: 'BR' })).toBe('(11) 91234-5678');
    });

    // Arabian Locale Tests
    test('should format EG phone numbers', () => {
      // EG: ### #### ####
      expect(applyPhoneMask('01012345678', { locale: 'EG' })).toBe('010 1234 5678');
    });

    test('should format SA phone numbers', () => {
      // SA: ### ### ####
      expect(applyPhoneMask('0501234567', { locale: 'SA' })).toBe('050 123 4567');
    });

    test('should format AE phone numbers', () => {
      // AE: ### ### ####
      expect(applyPhoneMask('0501234567', { locale: 'AE' })).toBe('050 123 4567');
    });

    test('should fallback to US for unknown locale', () => {
      expect(applyPhoneMask('1234567890', { locale: 'XX' })).toBe('(123) 456-7890');
    });
  });

  describe('unmaskPhone', () => {
    test('should return only digits', () => {
      expect(unmaskPhone('(123) 456-7890')).toBe('1234567890');
      expect(unmaskPhone('+1 (234) 567-8900')).toBe('12345678900');
      expect(unmaskPhone('07911 123456')).toBe('07911123456');
    });
  });
});
