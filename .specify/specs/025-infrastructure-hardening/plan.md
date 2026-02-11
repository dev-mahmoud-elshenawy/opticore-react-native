# Implementation Plan: Infrastructure Hardening

**Branch**: `feature/025-infrastructure-hardening` | **Date**: 2026-02-11 | **Spec**: spec.md

## Summary

Five stability fixes across infrastructure: (1) SecureStorage init-guard pattern (ready Promise), (2) CoreProvider stops disposing singletons on unmount, (3) ThemeShadows changed from CSS strings to RN shadow objects, (4) ThemeManager idempotent listener setup, (5) ThemeManager uses Logger instead of console.warn. One **breaking change**: ThemeShadows type changes from `string` to `ThemeShadowValue` object — justified because CSS shadow strings never worked on React Native.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)
**Primary Dependencies**: React 19, React Native 0.81, expo-secure-store
**Testing**: Jest ^29 + React Native Testing Library ^12
**Target Platform**: iOS & Android

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| Pure Infrastructure | PASS | All components are infrastructure |
| TypeScript Strict | PASS | ThemeShadowValue fully typed |
| Breaking Change | JUSTIFIED | CSS shadow strings never worked on RN — this fixes, not breaks |

## Source Code Structure

```
src/
├── infrastructure/storage/
│   └── SecureStorage.ts         [MODIFY] Add ready Promise init guard
├── providers/
│   └── CoreProvider.tsx         [MODIFY] Remove singleton dispose calls
├── theme/
│   ├── types.ts                 [MODIFY] ThemeShadowValue RN object type
│   ├── defaultThemes.ts         [MODIFY] Update shadow values
│   └── ThemeManager.ts          [MODIFY] Idempotent listener, Logger

test/
├── infrastructure/storage/
│   └── SecureStorage.test.ts    [MODIFY] Init guard tests
├── providers/
│   └── CoreProvider.test.tsx    [MODIFY] Singleton safety tests
└── theme/
    ├── ThemeManager.test.ts     [MODIFY] Listener tests
    └── defaultThemes.test.ts    [MODIFY] Shadow format tests
```

## Approach

1. **SecureStorage Init Guard**: Add `private readyPromise: Promise<void>` initialized in constructor from `this.loadKeys()`. All public methods (`get`, `set`, `remove`, `clear`) do `await this.readyPromise` as their first line. If `loadKeys()` fails, the promise resolves anyway (log warning, continue with empty keys) so the storage is usable.

2. **CoreProvider Singleton Safety**: Remove `connectivityManager.dispose()` and `lifecycleManager.dispose()` from cleanup effects. Replace with no-op or remove the listener the provider itself added. Singletons outlive any single React tree.

3. **ThemeShadowValue**: New type: `{ shadowColor: string; shadowOffset: { width: number; height: number }; shadowOpacity: number; shadowRadius: number; elevation: number }`. `ThemeShadows` changes from `{ sm: string; md: string; lg: string }` to `{ sm: ThemeShadowValue; md: ThemeShadowValue; lg: ThemeShadowValue }`. Update `defaultThemes.ts` light/dark shadows.

4. **ThemeManager Listener Fix**: In `setupAppearanceListener()`, first check `if (this.appearanceListener)` → remove old before adding new. This makes the method idempotent. Remove the duplicate call in `init()` since constructor already calls it.

5. **ThemeManager Logger**: Replace all `console.warn(...)` with `Logger.getInstance().warn(...)`. Respects production mode suppression.
