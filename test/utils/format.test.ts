import { formatPhone, formatCurrency, formatPercentage } from '../../src/utils/format';

describe('Format Utilities', () => {
  describe('formatPhone', () => {
    it('formats 10-digit phone number', () => {
      expect(formatPhone('1234567890')).toBe('(123) 456-7890');
    });

    it('returns original if length is not 10', () => {
      expect(formatPhone('123')).toBe('123');
    });

    it('handles custom format (placeholder)', () => {
      // Basic implementation might fixed format (###) ###-#### or allow customization
      // For now testing default US format behavior on 10 digits
      expect(formatPhone('9876543210')).toBe('(987) 654-3210');
    });
  });

  describe('formatCurrency', () => {
    it('formats USD currency by default', () => {
      // Intl.NumberFormat behavior depends on locale (usually en-US in Jest/Node)
      // We expect output like "$1,234.56"
      const result = formatCurrency(1234.56);
      expect(result).toContain('$');
      expect(result).toContain('1,234.56');
    });

    it('handles different currency code', () => {
      const result = formatCurrency(1234.56, 'EUR');
      expect(result).toContain('€');
      // Position of € depends on locale, just check presence
    });
  });

  describe('formatPercentage', () => {
    it('formats decimal as percentage', () => {
      expect(formatPercentage(0.123)).toBe('12%');
    });

    it('handles decimals', () => {
      expect(formatPercentage(0.1234, 1)).toBe('12.3%');
    });
  });
});
