import { lightTheme, darkTheme } from '../../src/theme/defaultThemes';
import type { ThemeShadowValue, ThemeTextVariant, ThemeTypography } from '../../src/theme/types';

const TEXT_VARIANT_KEYS: Array<keyof ThemeTextVariant> = ['fontSize', 'fontWeight', 'lineHeight'];

const SEMANTIC_VARIANTS: Array<
  keyof Pick<
    ThemeTypography,
    'h1' | 'h2' | 'h3' | 'title' | 'body' | 'bodySmall' | 'caption' | 'label' | 'button'
  >
> = ['h1', 'h2', 'h3', 'title', 'body', 'bodySmall', 'caption', 'label', 'button'];

function assertTextVariant(variant: ThemeTextVariant) {
  for (const key of TEXT_VARIANT_KEYS) {
    expect(variant[key]).toBeDefined();
  }
  expect(typeof variant.fontSize).toBe('number');
  expect(typeof variant.fontWeight).toBe('string');
  expect(typeof variant.lineHeight).toBe('number');
}

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
      expect(darkTheme.shadows.md.shadowOpacity).toBeGreaterThan(
        lightTheme.shadows.md.shadowOpacity
      );
    });
  });

  describe('Semantic typography variants', () => {
    it('should expose every standard semantic variant as a text-style object', () => {
      for (const key of SEMANTIC_VARIANTS) {
        assertTextVariant(lightTheme.typography[key]);
      }
    });

    it('should let consumers read body.fontSize without knowing the size scale', () => {
      expect(lightTheme.typography.body.fontSize).toBe(14);
      expect(lightTheme.typography.body.fontWeight).toBe('400');
      expect(lightTheme.typography.body.lineHeight).toBe(20);
    });

    it('should map heading variants to the heading size scale', () => {
      expect(lightTheme.typography.h1.fontSize).toBe(lightTheme.typography.sizes.h1);
      expect(lightTheme.typography.h2.fontSize).toBe(lightTheme.typography.sizes.h2);
      expect(lightTheme.typography.h3.fontSize).toBe(lightTheme.typography.sizes.h3);
      expect(lightTheme.typography.h1.fontWeight).toBe(lightTheme.typography.weights.bold);
    });

    it('should keep the raw size/weight scale for backward compatibility', () => {
      expect(lightTheme.typography.sizes.md).toBe(14);
      expect(lightTheme.typography.weights.bold).toBe('700');
      expect(lightTheme.typography.fontFamily).toBe('System');
    });

    it('should expose the same semantic variants on the dark theme', () => {
      for (const key of SEMANTIC_VARIANTS) {
        assertTextVariant(darkTheme.typography[key]);
      }
      expect(darkTheme.typography.body.fontSize).toBe(lightTheme.typography.body.fontSize);
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
