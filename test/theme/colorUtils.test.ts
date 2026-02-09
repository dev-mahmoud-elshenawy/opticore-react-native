import { alpha, contrast, lighten, darken, hexToRgb, rgbToHex } from '../../src/theme/colorUtils';

describe('Color Utils', () => {
    describe('alpha', () => {
        it('should convert hex to rgba with opacity', () => {
            expect(alpha('#000000', 0.5)).toBe('rgba(0, 0, 0, 0.5)');
            expect(alpha('#FFFFFF', 0)).toBe('rgba(255, 255, 255, 0)');
            expect(alpha('#FF0000', 1)).toBe('rgba(255, 0, 0, 1)');
        });

        it('should clamp opacity between 0 and 1', () => {
            expect(alpha('#000000', 1.5)).toBe('rgba(0, 0, 0, 1)');
            expect(alpha('#000000', -0.5)).toBe('rgba(0, 0, 0, 0)');
        });

        it('should return original string if invalid hex', () => {
            expect(alpha('invalid', 0.5)).toBe('invalid');
        });
    });

    describe('contrast', () => {
        it('should return dark for light backgrounds', () => {
            expect(contrast('#FFFFFF')).toBe('dark'); // White
            expect(contrast('#FFFF00')).toBe('dark'); // Yellow
        });

        it('should return light for dark backgrounds', () => {
            expect(contrast('#000000')).toBe('light'); // Black
            expect(contrast('#0000FF')).toBe('light'); // Blue
        });
    });

    describe('re-exports', () => {
        it('should re-export light/dark functions', () => {
            expect(lighten).toBeDefined();
            expect(darken).toBeDefined();
            expect(hexToRgb).toBeDefined();
            expect(rgbToHex).toBeDefined();
        });
    });
});
