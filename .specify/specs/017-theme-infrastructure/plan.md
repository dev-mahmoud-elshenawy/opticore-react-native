# Implementation Plan: Theme Infrastructure

**Branch**: `feature/017-theme-infrastructure`
**Date**: 2026-02-05
**Spec**: [spec.md](./spec.md)
**Dependencies**: Spec 014, LocalStorage, Color utilities

## Summary

Provide theme management with light/dark/system modes, theme persistence, system theme detection, and color utilities. No UI components, pure logic and React context.

**Technical Approach**: Singleton ThemeManager, React Context ThemeProvider, useTheme hook, color manipulation utilities, default light/dark themes following Material Design.

## Technical Context

- **No New Dependencies**: Uses existing infrastructure
- **Integration**: LocalStorage (persistence), React Native Appearance API
- **Pattern**: Singleton manager, React Context, Observer pattern
- **Target**: 80%+ test coverage, WCAG AA color contrast

## Module Structure

```
src/theme/
├── index.ts                 # Public exports (30 lines)
├── ThemeManager.ts          # Singleton manager (180 lines)
├── ThemeProvider.tsx        # React context (80 lines)
├── useTheme.ts              # React hook (60 lines)
├── colorUtils.ts            # Color utilities (100 lines)
├── defaultThemes.ts         # Light/dark defaults (150 lines)
└── types.ts                 # Type definitions (120 lines)
```

## Public API

```typescript
// Singleton
export class ThemeManager {
  static getInstance(): ThemeManager;
  configure(config: ThemeConfig): void;
  registerTheme(name: string, theme: Theme): void;
  setTheme(name: string): void;
  setMode(mode: ThemeMode): void;
  getTheme(): Theme;
  getMode(): ThemeMode;
  getActiveMode(): 'light' | 'dark';
  addThemeListener(callback: ThemeListener): () => void;
  dispose(): void;
}

// Provider & Hook
export function ThemeProvider(props: ThemeProviderProps): JSX.Element;
export function useTheme(): ThemeHookReturn;

// Color Utils
export function lighten(color: string, amount: number): string;
export function darken(color: string, amount: number): string;
export function alpha(color: string, opacity: number): string;
export function contrast(color: string): 'light' | 'dark';
```

## Default Themes

- **Light Theme**: Material Design light palette
- **Dark Theme**: Material Design dark palette
- Both WCAG AA compliant for text contrast

## Integration Flow

```
User sets mode
    ↓
ThemeManager.setMode('dark')
    ↓
LocalStorage.persist(mode)
    ↓
ThemeManager notifies listeners
    ↓
ThemeProvider re-renders
    ↓
useTheme returns new theme
    ↓
Components update styles
```

## Implementation Phases

**Phase 1: Types & Defaults** (1-2 hours)
- Type definitions
- Default light theme
- Default dark theme

**Phase 2: Color Utils** (1-2 hours)
- lighten, darken, alpha
- contrast calculation
- hex/rgb conversion

**Phase 3: Manager & Provider** (2-3 hours)
- ThemeManager singleton
- Appearance API integration
- ThemeProvider context
- useTheme hook

**Phase 4: Tests** (1-2 hours)
- Manager tests
- Hook tests
- Color util tests

## Verification

```bash
npm test test/theme  # All tests pass
npm run type-check   # 0 errors
```

## Success Criteria

- ✅ TypeScript strict mode: 0 errors
- ✅ Test coverage: 80%+
- ✅ All 23 tasks completed
- ✅ System theme detection works
- ✅ WCAG AA color contrast verified
