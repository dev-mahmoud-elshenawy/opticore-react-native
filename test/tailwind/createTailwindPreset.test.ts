import { createTailwindPreset } from '../../src/tailwind/createTailwindPreset';
import { lightTheme } from '../../src/theme/defaultThemes';

describe('createTailwindPreset', () => {
  it('maps OptiCore theme tokens into a Tailwind preset', () => {
    const preset = createTailwindPreset(lightTheme);

    expect(preset.theme.extend.colors.primary).toBe(lightTheme.colors.primary);
    expect(preset.theme.extend.spacing.md).toBe(lightTheme.spacing.md);
    expect(preset.theme.extend.borderRadius.lg).toBe(lightTheme.borderRadius.lg);
    expect(preset.theme.extend.fontSize.lg).toBe(lightTheme.typography.sizes.lg);
  });

  it('exposes semantic typography variants as fontSize tokens (text-body, text-caption, …)', () => {
    const preset = createTailwindPreset(lightTheme);
    const { fontSize } = preset.theme.extend;

    // Semantic variants become Tailwind's [size, { lineHeight, fontWeight }] tuple form.
    expect(fontSize.body).toEqual([
      lightTheme.typography.body.fontSize,
      {
        lineHeight: lightTheme.typography.body.lineHeight,
        fontWeight: lightTheme.typography.body.fontWeight,
      },
    ]);

    for (const key of ['h1', 'h2', 'h3', 'title', 'bodySmall', 'caption', 'label', 'button']) {
      expect(Array.isArray(fontSize[key])).toBe(true);
    }
  });

  it('keeps the raw numeric size scale (text-md, text-xl) for backward compatibility', () => {
    const preset = createTailwindPreset(lightTheme);
    expect(preset.theme.extend.fontSize.md).toBe(lightTheme.typography.sizes.md);
    expect(preset.theme.extend.fontSize.xl).toBe(lightTheme.typography.sizes.xl);
  });

  it('returns a fresh copy (no shared references with the theme)', () => {
    const preset = createTailwindPreset(lightTheme);
    expect(preset.theme.extend.colors).not.toBe(lightTheme.colors);
  });
});
