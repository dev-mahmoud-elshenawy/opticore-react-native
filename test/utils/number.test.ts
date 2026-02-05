import { toInt, toDouble, clamp, random } from '../../src/utils/number';

describe('Number Utilities', () => {
  describe('toInt', () => {
    it('parses valid integer string', () => {
      expect(toInt('123')).toBe(123);
    });

    it('parses float string to int', () => {
      expect(toInt('123.45')).toBe(123);
    });

    it('returns fallback for invalid string', () => {
      expect(toInt('abc', 0)).toBe(0);
    });

    it('returns fallback for NaN input', () => {
      expect(toInt(NaN, 0)).toBe(0);
    });

    it('returns value if already number', () => {
      expect(toInt(123)).toBe(123);
    });
  });

  describe('toDouble', () => {
    it('parses valid float string', () => {
      expect(toDouble('123.45')).toBe(123.45);
    });

    it('returns fallback for invalid string', () => {
      expect(toDouble('abc', 0)).toBe(0);
    });

    it('returns value if already number', () => {
      expect(toDouble(123.45)).toBe(123.45);
    });
  });

  describe('clamp', () => {
    it('returns value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('clamps to min', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('clamps to max', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('random', () => {
    it('returns value within range', () => {
      const val = random(1, 10);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(10);
    });

    it('returns integer', () => {
      const val = random(1, 10);
      expect(Number.isInteger(val)).toBe(true);
    });
  });
});
