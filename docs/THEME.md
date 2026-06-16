# Theme Engine

A dynamic, type-safe theming system with dark mode, typography, spacing, shadows, and runtime switching.

---

## Setup

Pass theme config to `OptiCoreProvider`:

```typescript
import { OptiCoreProvider } from 'opticore-react-native';

<OptiCoreProvider
  config={{
    api: { baseURL: '...' },
    theme: {
      defaultMode: 'system',   // respect OS dark mode
      persistMode: true,       // remember user's choice
    },
  }}
>
  <App />
</OptiCoreProvider>
```

---

## useTheme

The primary hook for consuming theme values in components.

```typescript
import { useTheme } from 'opticore-react-native/theme';

const {
  theme,           // full Theme object
  mode,            // 'light' | 'dark' | 'system'
  activeMode,      // 'light' | 'dark' (resolved — 'system' maps to actual mode)
  isDark,          // boolean
  isLight,         // boolean
  setMode,         // (mode: ThemeMode) => void
  toggleMode,      // () => void
  colors,          // shortcut for theme.colors
  spacing,         // shortcut for theme.spacing
  typography,      // shortcut for theme.typography
  borderRadius,    // shortcut for theme.borderRadius
} = useTheme();
```

### Example

```typescript
function ProfileCard() {
  const { colors, spacing, typography, isDark, toggleMode } = useTheme();

  return (
    <View style={{
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: 12,
    }}>
      <Text style={{ color: colors.text, ...typography.h3 }}>
        John Doe
      </Text>
      <Text style={{ color: colors.textSecondary, ...typography.body }}>
        @johndoe
      </Text>
      <Switch
        value={isDark}
        onValueChange={toggleMode}
      />
    </View>
  );
}
```

---

## useThemedStyles

Build a theme-aware `StyleSheet` from a factory, **memoized per theme** — so it's safe to call on
every render and updates automatically on light↔dark switches. Pairs with semantic typography:
spread a variant straight into a style.

```tsx
import { useThemedStyles } from 'opticore-react-native';

function ProfileCard() {
  const styles = useThemedStyles((t) => ({
    card: { backgroundColor: t.colors.card, padding: t.spacing.md, borderRadius: t.borderRadius.lg },
    title: { color: t.colors.text, ...t.typography.h2 },
    subtitle: { color: t.colors.textSecondary, ...t.typography.caption },
  }));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Jane Doe</Text>
      <Text style={styles.subtitle}>@jane</Text>
    </View>
  );
}
```

The factory receives the full `Theme` (`colors`, `spacing`, `typography`, `borderRadius`,
`shadows`). Styles recompute when the active theme changes **or** when the factory identity changes
— so an inline factory closing over props/state stays correct. `StyleSheet.create` is cheap, so
that's fine; pass a `useCallback`-stable factory if you want to skip recomputation.

---

## useTextStyle

A ready-to-use `<Text>` style for a single semantic typography variant, with the theme's text color
applied (memoized per theme/variant/overrides). Lighter than `useThemedStyles` when you just need
one text style.

```tsx
import { useTextStyle } from 'opticore-react-native';

<Text style={useTextStyle('h1')}>Title</Text>
<Text style={useTextStyle('caption', { color: theme.colors.textSecondary })}>meta</Text>
```

The `variant` is one of the semantic typography names (`'body'`, `'h1'`, `'caption'`, …); `overrides`
merge last.

---

## Theme Structure

```typescript
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
    warning: string;
    border: string;
  };
  typography: {
    fontFamily: string;

    // Semantic variants (recommended) — each is { fontSize, fontWeight, lineHeight }.
    // Read a token (typography.body.fontSize) or spread it (style={typography.body}).
    h1: ThemeTextVariant;         // 32 / '700' / 40
    h2: ThemeTextVariant;         // 28 / '700' / 36
    h3: ThemeTextVariant;         // 24 / '600' / 32
    title: ThemeTextVariant;      // 20 / '600' / 28
    body: ThemeTextVariant;       // 14 / '400' / 20
    bodySmall: ThemeTextVariant;  // 12 / '400' / 16
    caption: ThemeTextVariant;    // 12 / '400' / 16
    label: ThemeTextVariant;      // 12 / '500' / 16
    button: ThemeTextVariant;     // 14 / '600' / 20

    // Raw scale (backward compatible) — the tokens the variants are built from.
    sizes: { xs; sm; md; lg; xl; xxl; h1; h2; h3 };  // numbers
    weights: { regular; medium; semibold; bold };    // RN weight strings
  };
  spacing: {
    xs: number;   // 4
    sm: number;   // 8
    md: number;   // 16
    lg: number;   // 24
    xl: number;   // 32
    xxl: number;  // 48
  };
  borderRadius: {
    sm: number;   // 4
    md: number;   // 8
    lg: number;   // 16
    full: number; // 999
  };
  shadows: {
    sm: object;   // React Native shadow props
    md: object;
    lg: object;
  };
}
```

---

## Built-in Themes

```typescript
import { lightTheme, darkTheme } from 'opticore-react-native/theme';
```

### lightTheme

| Token | Value |
|---|---|
| `primary` | `#007AFF` |
| `background` | `#FFFFFF` |
| `surface` | `#F2F2F7` |
| `text` | `#000000` |
| `textSecondary` | `#6E6E73` |

### darkTheme

| Token | Value |
|---|---|
| `primary` | `#0A84FF` |
| `background` | `#000000` |
| `surface` | `#1C1C1E` |
| `text` | `#FFFFFF` |
| `textSecondary` | `#98989D` |

---

## Custom Themes

### createTheme

```typescript
import { createTheme } from 'opticore-react-native/theme';

const brandTheme = createTheme({
  colors: {
    primary: '#6C63FF',
    secondary: '#FF6584',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    border: '#E5E7EB',
  },
  // Semantic variants are { fontSize, fontWeight, lineHeight }; override only what you need.
  typography: {
    h1: { fontSize: 36, fontWeight: '700', lineHeight: 44 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  },
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
  },
  borderRadius: {
    sm: 6, md: 12, lg: 20, full: 999,
  },
});
```

### Register and Use

```typescript
// Register via CoreConfig
theme: {
  customThemes: {
    brand: brandTheme,
    compact: compactTheme,
  },
}

// Register programmatically
ThemeManager.getInstance().registerTheme('brand', brandTheme);

// Switch to custom theme
ThemeManager.getInstance().setMode('light'); // must be 'light' or 'dark'
// Custom themes extend the active mode — register as light or dark variant
```

---

## ThemeManager

Direct access to the theme engine, outside React.

```typescript
import { ThemeManager } from 'opticore-react-native/theme';

const manager = ThemeManager.getInstance();
```

### API

```typescript
// Get current theme and mode
const theme = manager.getTheme();
const mode = manager.getMode();          // 'light' | 'dark' | 'system'
const active = manager.getActiveMode();  // 'light' | 'dark'

// Change mode
manager.setMode('dark');
manager.setMode('system');
manager.toggleMode();

// Listen to changes
const unsubscribe = manager.addThemeListener((theme, mode) => {
  console.warn('Theme changed to:', mode);
});
unsubscribe(); // cleanup

// Register custom themes
manager.registerTheme('brand', brandTheme);
manager.unregisterTheme('brand');
```

---

## Dark Mode Patterns

### Follow System (recommended)

```typescript
theme: { defaultMode: 'system', followSystem: true }
// Automatically switches when OS dark mode changes
```

### User Toggle

```typescript
function ThemeToggle() {
  const { isDark, toggleMode } = useTheme();

  return (
    <TouchableOpacity onPress={toggleMode}>
      <Text>{isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}</Text>
    </TouchableOpacity>
  );
}
```

### Conditional Styling

```typescript
const { isDark, colors } = useTheme();

const styles = {
  container: {
    backgroundColor: colors.background,
    // Or manual conditional:
    borderWidth: isDark ? 0 : 1,
    borderColor: colors.border,
  },
};
```

---

## Color Utilities

```typescript
import { colorUtils } from 'opticore-react-native/theme';

colorUtils.hexToRgb('#6C63FF');           // { r: 108, g: 99, b: 255 }
colorUtils.rgbToHex(108, 99, 255);        // '#6c63ff'
colorUtils.lighten('#6C63FF', 0.2);       // lighter shade
colorUtils.darken('#6C63FF', 0.2);        // darker shade
```

---

## Notes

- **Shadows** use React Native's native shadow props — not CSS strings — works correctly on iOS and Android
- **`persistMode`** saves the user's mode preference to AsyncStorage and restores it on app launch
- `ThemeManager` is a singleton — `getInstance()` is safe to call anywhere
- `useTheme` only re-renders the component when the theme actually changes

---

## See Also

- [Configuration → theme](./CONFIGURATION.md#theme--optional) — Theme config options
- [Color Utilities](./api/UTILITIES.md#color-utilities) — Standalone color helpers
