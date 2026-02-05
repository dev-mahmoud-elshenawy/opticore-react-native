# Spec 017: Theme Infrastructure

## Overview

**Priority**: P2 - HIGH
**Effort**: 4-5 hours
**Dependencies**: Spec 014, LocalStorage, Color utilities
**Status**: Not Started

## Problem Statement

Modern mobile apps are expected to support dark mode and theming. Users expect apps to respect system preferences and remember their choice. Currently, consuming apps must build their own theme management, persistence, and system detection. This is repetitive and often inconsistent.

## Objectives

1. **Theme management** - Centralized theme state
2. **Mode support** - Light, dark, system-follow modes
3. **Persistence** - Remember user preference
4. **System detection** - Follow OS dark mode setting
5. **Extensibility** - Custom themes support
6. **No UI** - Pure logic, works with any UI approach

## User Stories

### US-017.1: Theme Manager (P1)
**As a** developer
**I want** a centralized theme manager
**So that** I can control app theming from one place

**Acceptance Criteria**:
- [ ] Singleton pattern (ThemeManager.getInstance())
- [ ] Register custom themes
- [ ] Set active theme
- [ ] Get current theme
- [ ] Theme change listeners

**Example Usage**:
```typescript
const manager = ThemeManager.getInstance();

// Register custom theme
manager.registerTheme('brand', {
  name: 'brand',
  mode: 'light',
  colors: {
    primary: '#FF6B00',
    background: '#FFFFFF',
    // ...
  },
});

// Set theme
manager.setTheme('brand');
```

### US-017.2: Light/Dark/System Modes (P1)
**As a** developer
**I want** to support light, dark, and system modes
**So that** users can choose their preference

**Acceptance Criteria**:
- [ ] Set mode: 'light' | 'dark' | 'system'
- [ ] Get current mode
- [ ] Get resolved mode (actual light/dark when system)
- [ ] System mode follows OS preference
- [ ] Updates when OS preference changes

**Example Usage**:
```typescript
// Set to follow system
manager.setMode('system');

// Check resolved mode
const activeMode = manager.getActiveMode(); // 'light' or 'dark'

// Set explicit mode
manager.setMode('dark');
```

### US-017.3: Theme Persistence (P1)
**As a** developer
**I want** theme preference to persist
**So that** users don't have to set it every session

**Acceptance Criteria**:
- [ ] Mode saved to LocalStorage
- [ ] Loads saved preference on init
- [ ] Configurable storage key
- [ ] Works offline

**Example Usage**:
```typescript
manager.configure({
  persistMode: true,
  storageKey: 'app_theme_mode',
});

// User sets dark mode
manager.setMode('dark');
// App restarts...
// Mode is still 'dark'
```

### US-017.4: Theme Provider & Hook (P1)
**As a** developer
**I want** a React provider and hook for theming
**So that** I can use themes in components

**Acceptance Criteria**:
- [ ] ThemeProvider context wrapper
- [ ] useTheme hook returns theme and controls
- [ ] Re-renders on theme changes
- [ ] Provides all theme values

**Example Usage**:
```typescript
// App.tsx
<ThemeProvider defaultMode="system">
  <App />
</ThemeProvider>

// Component.tsx
function MyComponent() {
  const { theme, mode, setMode, toggleMode, colors } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello</Text>
      <Button title="Toggle Dark Mode" onPress={toggleMode} />
    </View>
  );
}
```

### US-017.5: Color Utilities (P2)
**As a** developer
**I want** color manipulation utilities
**So that** I can derive colors from theme

> **Note**: Some color utilities already exist in `src/utils/color.ts` from Spec 007.
> This user story focuses on re-exporting and extending existing utilities for theme context.

**Acceptance Criteria**:
- [ ] Re-export existing: hexToRgb, rgbToHex from src/utils/color.ts
- [ ] Add: lighten(color, amount)
- [ ] Add: darken(color, amount)
- [ ] Add: alpha(color, opacity)
- [ ] Add: contrast(color) → 'light' | 'dark'
- [ ] Works with hex, rgb, rgba

**Example Usage**:
```typescript
const { colors } = useTheme();

// Derive colors (utilities available from theme exports)
import { lighten, alpha, contrast } from 'opticore-react-native/theme';

const hoverColor = lighten(colors.primary, 0.1);
const disabledColor = alpha(colors.primary, 0.5);
const textColor = contrast(colors.background) === 'dark'
  ? '#FFFFFF'
  : '#000000';
```

### US-017.6: Default Themes (P2)
**As a** developer
**I want** sensible default light and dark themes
**So that** I can start quickly without configuration

**Acceptance Criteria**:
- [ ] Default light theme included
- [ ] Default dark theme included
- [ ] Follows Material Design guidelines
- [ ] Accessible color contrast

## Technical Approach

### Architecture

```
src/theme/
├── index.ts                 # Public exports
├── ThemeManager.ts          # Singleton manager
├── ThemeProvider.tsx        # React context provider
├── useTheme.ts              # React hook
├── colorUtils.ts            # Color manipulation
├── defaultThemes.ts         # Light/dark defaults
└── types.ts                 # Type definitions
```

### Class Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    ThemeManager                          │
│─────────────────────────────────────────────────────────│
│ - instance: ThemeManager                                │
│ - themes: Map<string, Theme>                            │
│ - mode: ThemeMode                                       │
│ - listeners: Set<ThemeListener>                         │
│─────────────────────────────────────────────────────────│
│ + getInstance(): ThemeManager                           │
│ + configure(config): void                               │
│ + registerTheme(name, theme): void                      │
│ + setTheme(name): void                                  │
│ + setMode(mode): void                                   │
│ + getTheme(): Theme                                     │
│ + getMode(): ThemeMode                                  │
│ + getActiveMode(): 'light' | 'dark'                     │
│ + addThemeListener(callback): () => void                │
│ + dispose(): void                                       │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
    ┌─────────────┐                 ┌─────────────┐
    │LocalStorage │                 │ Appearance  │
    │             │                 │ (RN API)    │
    │ persist()   │                 │             │
    │ restore()   │                 │ getScheme() │
    └─────────────┘                 │ addListener │
       (existing)                   └─────────────┘
                                       (RN built-in)
```

### Public API

```typescript
// ============== SINGLETON ==============

export class ThemeManager {
  static getInstance(): ThemeManager;

  // Configuration
  configure(config: ThemeConfig): void;

  // Theme Registration
  registerTheme(name: string, theme: Theme): void;
  unregisterTheme(name: string): void;
  getRegisteredThemes(): string[];

  // Theme Control
  setTheme(name: string): void;
  setMode(mode: ThemeMode): void;

  // Getters
  getTheme(): Theme;
  getMode(): ThemeMode;
  getActiveMode(): 'light' | 'dark';

  // Listeners
  addThemeListener(callback: ThemeListener): () => void;

  // Cleanup
  dispose(): void;
}

// ============== PROVIDER ==============

export function ThemeProvider(props: ThemeProviderProps): JSX.Element;

export interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  themes?: Record<string, Theme>;
  lightTheme?: Theme;
  darkTheme?: Theme;
}

// ============== HOOK ==============

export function useTheme(): ThemeHookReturn;

export interface ThemeHookReturn {
  // Current theme
  theme: Theme;

  // Mode
  mode: ThemeMode;
  activeMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;

  // Shortcuts
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: ThemeBorderRadius;

  // Status
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
}

// ============== COLOR UTILS ==============

export function lighten(color: string, amount: number): string;
export function darken(color: string, amount: number): string;
export function alpha(color: string, opacity: number): string;
export function contrast(color: string): 'light' | 'dark';
export function hexToRgb(hex: string): { r: number; g: number; b: number };
export function rgbToHex(r: number, g: number, b: number): string;

// ============== TYPES ==============

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  name: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
}

export interface ThemeColors {
  // Primary
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Secondary
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;

  // Backgrounds
  background: string;
  surface: string;
  card: string;

  // Text
  text: string;
  textSecondary: string;
  textDisabled: string;

  // Borders
  border: string;
  divider: string;

  // Status
  error: string;
  warning: string;
  success: string;
  info: string;

  // Extensible
  [key: string]: string;
}

export interface ThemeSpacing {
  xs: number;   // 4
  sm: number;   // 8
  md: number;   // 16
  lg: number;   // 24
  xl: number;   // 32
  xxl: number;  // 48
}

export interface ThemeTypography {
  fontFamily: string;
  sizes: {
    xs: number;   // 10
    sm: number;   // 12
    md: number;   // 14
    lg: number;   // 16
    xl: number;   // 20
    xxl: number;  // 24
    h1: number;   // 32
    h2: number;   // 28
    h3: number;   // 24
  };
  weights: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
  };
}

export interface ThemeBorderRadius {
  none: number;   // 0
  sm: number;     // 4
  md: number;     // 8
  lg: number;     // 12
  xl: number;     // 16
  full: number;   // 9999
}

export interface ThemeConfig {
  defaultMode?: ThemeMode;
  persistMode?: boolean;
  storageKey?: string;
  followSystem?: boolean;
}

export type ThemeListener = (theme: Theme, mode: ThemeMode) => void;
```

## Files to Create

```
src/theme/
├── index.ts                     # 30 lines
├── ThemeManager.ts              # 180 lines
├── ThemeProvider.tsx            # 80 lines
├── useTheme.ts                  # 60 lines
├── colorUtils.ts                # 100 lines
├── defaultThemes.ts             # 150 lines
└── types.ts                     # 120 lines

test/theme/
├── ThemeManager.test.ts         # 200 lines
├── ThemeProvider.test.tsx       # 150 lines
├── useTheme.test.ts             # 100 lines
├── colorUtils.test.ts           # 150 lines
└── defaultThemes.test.ts        # 50 lines

examples/theme/
└── ThemeExample.tsx             # Usage example
```

## Success Criteria

- [ ] TypeScript strict mode: 0 errors
- [ ] Test coverage: 80%+ for all new code
- [ ] JSDoc: 100% on public APIs
- [ ] Lint: 0 errors/warnings
- [ ] Build succeeds
- [ ] Integrates with LocalStorage
- [ ] System theme detection works
- [ ] Theme persists across restarts
- [ ] Example works in test app
- [ ] Accessible color contrast in defaults

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| System listener memory leak | Medium | Proper cleanup in dispose() |
| Storage async issues | Low | Handle with defaults |
| Color contrast accessibility | Medium | Test with WCAG guidelines |

## Out of Scope

- Styled-components integration
- CSS-in-JS specific utilities
- Animation/transition themes
- Font loading
- Dynamic theme generation

## Definition of Done

1. All user stories implemented
2. 80%+ test coverage
3. TypeScript strict mode passes
4. Default themes accessible (WCAG AA)
5. Example created
6. CLAUDE.md updated
