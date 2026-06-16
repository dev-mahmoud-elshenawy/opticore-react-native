import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import type { Theme } from './types';
import { useTheme } from './useTheme';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Build a theme-aware `StyleSheet` from the active theme, memoized per theme.
 *
 * Pass a factory that maps the {@link Theme} to a `StyleSheet.create` object.
 * The result is recomputed when the active theme changes (e.g. light↔dark) or
 * when the factory identity changes — so a factory that closes over props/state
 * stays correct. `StyleSheet.create` is cheap, so calling on every render is fine;
 * pass a `useCallback`-stable factory if you want to skip recomputation. Pairs
 * naturally with semantic typography — spread a variant: `...theme.typography.body`.
 *
 * @example
 * ```tsx
 * const styles = useThemedStyles((t) => ({
 *   card: { backgroundColor: t.colors.card, padding: t.spacing.md, borderRadius: t.borderRadius.lg },
 *   title: { color: t.colors.text, ...t.typography.h2 },
 * }));
 *
 * return <View style={styles.card}><Text style={styles.title}>Hi</Text></View>;
 * ```
 */
export function useThemedStyles<T extends NamedStyles<T> | NamedStyles<unknown>>(
    factory: (theme: Theme) => T,
): T {
    const { theme } = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme, factory]);
}
