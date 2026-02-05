import { hexToRgb, rgbToHex, lighten, darken } from '../../src/utils/color';

describe('Color Utilities', () => {
  describe('hexToRgb', () => {
    it('converts hex to rgb object', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('handles short hex', () => {
      expect(hexToRgb('#F00')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('returns null for invalid hex', () => {
      expect(hexToRgb('invalid')).toBeNull();
    });
  });

  describe('rgbToHex', () => {
    it('converts rgb to hex string', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    });

    it('clamps values', () => {
      expect(rgbToHex(300, -10, 0)).toBe('#ff0000');
    });
  });

  describe('lighten', () => {
    it('lightens color', () => {
      // Simple implementation test
      // If passing #000000 and 10%, expecting lighter
      const result = lighten('#000000', 10);
      expect(result).not.toBe('#000000');
    });
  });

  describe('darken', () => {
    it('darkens color', () => {
      const result = darken('#ffffff', 10);
      expect(result).not.toBe('#ffffff');
    });
  });
});
