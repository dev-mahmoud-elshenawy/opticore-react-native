import { lightTheme, darkTheme } from '../../src/theme/defaultThemes';

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
    });

    describe('Theme Consistency', () => {
        it('should have matching keys in both themes', () => {
            const lightKeys = Object.keys(lightTheme.colors).sort();
            const darkKeys = Object.keys(darkTheme.colors).sort();
            expect(lightKeys).toEqual(darkKeys);
        });
    });
});
