import { useMemo } from 'react';
import type { TextStyle } from 'react-native';
import type { ThemeTextVariant, ThemeTypography } from './types';
import { useTheme } from './useTheme';

/** Names of the semantic text variants on the theme (`'body' | 'h1' | …`). */
export type TextVariantName = {
  [K in keyof ThemeTypography]: ThemeTypography[K] extends ThemeTextVariant ? K : never;
}[keyof ThemeTypography];

/**
 * A ready-to-use `<Text>` style for a semantic typography variant, with the
 * theme's text color applied. Memoized per theme/variant/overrides.
 *
 * @example
 * ```tsx
 * <Text style={useTextStyle('h1')}>Title</Text>
 * <Text style={useTextStyle('caption', { color: theme.colors.textSecondary })}>meta</Text>
 * ```
 */
export function useTextStyle(variant: TextVariantName, overrides?: TextStyle): TextStyle {
  const { theme } = useTheme();
  return useMemo(
    () => ({ color: theme.colors.text, ...theme.typography[variant], ...overrides }),
    [theme, variant, overrides],
  );
}
