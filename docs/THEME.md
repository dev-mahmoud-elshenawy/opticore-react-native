# 🎨 Theme Engine

OptiCore's Theme Engine provides a fully dynamic, type-safe theming system with dark mode, typography, spacing, shadows, and runtime switching.

---

## Quick Setup

```typescript
import { OptiCoreProvider } from 'opticore-react-native';
import { lightTheme, darkTheme } from 'opticore-react-native/theme';

<OptiCoreProvider
  config={{ api: { baseURL: '...' } }}
  theme={lightTheme}
>
  <App />
</OptiCoreProvider>
```

---

## useTheme Hook

```typescript
import { useTheme } from 'opticore-react-native/theme';

function MyComponent() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text, fontSize: theme.typography.body }}>
        Hello World
      </Text>
      <Button onPress={toggleTheme} title={isDark ? 'Light Mode' : 'Dark Mode'} />
    </View>
  );
}
```

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
    h1: number;
    h2: number;
    h3: number;
    body: number;
    caption: number;
    small: number;
  };
  spacing: {
    xs: number;    // 4
    sm: number;    // 8
    md: number;    // 16
    lg: number;    // 24
    xl: number;    // 32
    xxl: number;   // 48
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  shadows: {
    sm: object;
    md: object;
    lg: object;
  };
}
```

---

## Custom Theme

```typescript
import { createTheme } from 'opticore-react-native/theme';

const brandTheme = createTheme({
  colors: {
    primary: '#6C63FF',
    secondary: '#FF6584',
    background: '#FAFAFA',
    text: '#1A1A2E',
    // ... rest of colors
  },
  typography: {
    h1: 32,
    body: 16,
    // ...
  },
});
```

---

## ThemeManager (Programmatic)

```typescript
import { ThemeManager } from 'opticore-react-native/theme';

const manager = ThemeManager.getInstance();

// Switch theme at runtime
manager.setTheme(darkTheme);

// Get current theme
const current = manager.getTheme();

// Listen for theme changes
manager.addListener((theme) => {
  console.warn('Theme changed:', theme.colors.primary);
});
```

---

## Dynamic Scaling

```typescript
import { useResponsive } from 'opticore-react-native/hooks';

function ResponsiveComponent() {
  const { scale, isTablet, screenWidth } = useResponsive();

  return (
    <Text style={{ fontSize: scale(16) }}>
      Scales with screen size
    </Text>
  );
}
```

---

## Built-in Themes

| Theme | Description |
|---|---|
| `lightTheme` | Clean light theme with blue primary |
| `darkTheme` | Dark theme optimized for OLED displays |

---

## Notes

- Shadows use React Native's native shadow props (not CSS strings) — works on iOS and Android
- Theme changes trigger re-renders only in components using `useTheme`
- `ThemeManager` is a singleton — safe to call `getInstance()` anywhere
