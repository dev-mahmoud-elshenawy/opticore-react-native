import type {
  ThemeColors,
  ThemeSpacing,
  ThemeBorderRadius,
  ThemeTypography,
  ThemeTextVariant,
} from '../theme/types';

/**
 * A Tailwind `fontSize` token: either a bare size (number) or the
 * `[size, { lineHeight, fontWeight }]` tuple Tailwind/NativeWind use to carry
 * line-height and weight alongside the size.
 */
export type TailwindFontSize =
  | number
  | [number, { lineHeight: number; fontWeight: string }];

/** Convert a semantic text variant into Tailwind's tuple fontSize form. */
function variantToFontSize(variant: ThemeTextVariant): TailwindFontSize {
  // Tailwind expects fontWeight as a string; RN's union also allows numeric
  // weights, so coerce.
  return [
    variant.fontSize,
    { lineHeight: variant.lineHeight, fontWeight: String(variant.fontWeight) },
  ];
}

/** OptiCore theme tokens needed to build a Tailwind preset. */
export interface TailwindPresetInput {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  typography: ThemeTypography;
}

/**
 * Minimal shape of a Tailwind/NativeWind preset. Declared locally so this
 * module needs **no** `tailwindcss` dependency.
 */
export interface TailwindThemePreset {
  theme: {
    extend: {
      colors: Record<string, string>;
      spacing: Record<string, number>;
      borderRadius: Record<string, number>;
      fontSize: Record<string, TailwindFontSize>;
    };
  };
}

/**
 * Build a Tailwind/NativeWind preset from OptiCore theme tokens, so a consuming
 * app's `className` utilities (`bg-card`, `p-md`, `rounded-lg`, `text-lg`,
 * `text-body`, `text-caption`, `text-h1`) use the **same** design system as the
 * core theme. Semantic variants (`text-body`, `text-h1`, …) carry line-height and
 * weight; the raw scale (`text-xs … text-xxl`) carries size only.
 *
 * Pure data — the core has no Tailwind/NativeWind dependency. Opt-in only, via
 * the `opticore-react-native/tailwind` subpath.
 *
 * @example
 * ```js
 * // tailwind.config.js (consuming app)
 * import { createTailwindPreset } from 'opticore-react-native/tailwind';
 * import { lightTheme } from 'opticore-react-native';
 * export default {
 *   presets: [createTailwindPreset(lightTheme)],
 *   content: ['./src/**\/*.{ts,tsx}'],
 * };
 * ```
 */
export function createTailwindPreset(theme: TailwindPresetInput): TailwindThemePreset {
  return {
    theme: {
      extend: {
        colors: { ...theme.colors },
        spacing: { ...theme.spacing },
        borderRadius: { ...theme.borderRadius },
        fontSize: {
          // Raw numeric scale → text-xs … text-xxl (backward compatible).
          ...theme.typography.sizes,
          // Semantic variants → text-body, text-caption, text-h1, … (size + lineHeight + weight).
          h1: variantToFontSize(theme.typography.h1),
          h2: variantToFontSize(theme.typography.h2),
          h3: variantToFontSize(theme.typography.h3),
          title: variantToFontSize(theme.typography.title),
          body: variantToFontSize(theme.typography.body),
          bodySmall: variantToFontSize(theme.typography.bodySmall),
          caption: variantToFontSize(theme.typography.caption),
          label: variantToFontSize(theme.typography.label),
          button: variantToFontSize(theme.typography.button),
        },
      },
    },
  };
}
