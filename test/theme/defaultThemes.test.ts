import { lightTheme, darkTheme } from '../../src/theme/defaultThemes';
import type { ThemeShadowValue } from '../../src/theme/types';

const RN_SHADOW_KEYS: Array<keyof ThemeShadowValue> = [
    'shadowColor',
    'shadowOffset',
    'shadowOpacity',
    'shadowRadius',
    'elevation',
];

function assertRNShadow(shadow: ThemeShadowValue) {
    for (const key of RN_SHADOW_KEYS) {
        expect(shadow[key]).toBeDefined();
    }
    expect(typeof shadow.shadowColor).toBe('string');
    expect(typeof shadow.shadowOffset.width).toBe('number');
    expect(typeof shadow.shadowOffset.height).toBe('number');
    expect(typeof shadow.shadowOpacity).toBe('number');
    expect(typeof shadow.shadowRadius).toBe('number');
    expect(typeof shadow.elevation).toBe('number');
}

describe('Default Themes', () => {
    describe('Light Theme', () => {
        it('should have correct mode', () => {
            expect(lightTheme.mode).toBe('light');
        });

        it('should have required color structure', () => {
            expect(lightTheme.colors.primary).toBeDefined();
            expect(lightTheme.colors.background).toBeDefined();
            expect(lightTheme.colors.text).toBeDefined();
            expect(lightTheme.colors.error).toBeDefined();
        });

        it('should use standard spacing', () => {
            expect(lightTheme.spacing.md).toBe(16);
        });

        it('should have RN shadow objects for sm, md, lg', () => {
            assertRNShadow(lightTheme.shadows.sm);
            assertRNShadow(lightTheme.shadows.md);
            assertRNShadow(lightTheme.shadows.lg);
        });

        it('shadows should be spreadable onto a View style', () => {
            const style = { ...lightTheme.shadows.md };
            expect(style.shadowColor).toBeDefined();
            expect(style.elevation).toBeDefined();
        });
    });

    describe('Dark Theme', () => {
        it('should have correct mode', () => {
            expect(darkTheme.mode).toBe('dark');
        });

        it('should have required color structure', () => {
            expect(darkTheme.colors.primary).toBeDefined();
            expect(darkTheme.colors.background).toBeDefined();
            expect(darkTheme.colors.text).toBeDefined();
        });

        it('should share spacing with light theme', () => {
            expect(darkTheme.spacing).toEqual(lightTheme.spacing);
        });

        it('should have RN shadow objects with higher opacity for dark backgrounds', () => {
            assertRNShadow(darkTheme.shadows.sm);
            assertRNShadow(darkTheme.shadows.md);
            assertRNShadow(darkTheme.shadows.lg);
            // Dark theme shadows should have higher opacity than light theme
            expect(darkTheme.shadows.md.shadowOpacity).toBeGreaterThan(lightTheme.shadows.md.shadowOpacity);
        });
    });

    describe('Theme Consistency', () => {
        it('should have matching keys in both themes', () => {
            const lightKeys = Object.keys(lightTheme.colors).sort();
            const darkKeys = Object.keys(darkTheme.colors).sort();
            expect(lightKeys).toEqual(darkKeys);
        });

        it('should have matching shadow keys in both themes', () => {
            expect(Object.keys(lightTheme.shadows).sort()).toEqual(Object.keys(darkTheme.shadows).sort());
        });
    });
});
