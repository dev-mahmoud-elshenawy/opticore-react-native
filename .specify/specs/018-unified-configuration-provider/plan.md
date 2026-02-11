# Implementation Plan: Unified Configuration & Provider

**Branch**: `feature/018-unified-configuration-provider` | **Date**: 2026-02-11 | **Spec**: spec.md

## Summary

Expand `CoreConfig` to include optional sections for theme, offline, responsive, forms, and error classification. Extend `CoreSetup.init()` to delegate each section to its subsystem. Create a unified `OptiCoreProvider` that composes QueryProvider + ThemeProvider and exposes a `ConfigContext` for hooks to read dynamic config. All changes are additive and backward compatible.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)
**Primary Dependencies**: React 19, React Native 0.81, Zustand ^5, @tanstack/react-query ^5
**Testing**: Jest ^29 + React Native Testing Library ^12
**Target Platform**: iOS & Android

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| Pure Infrastructure | PASS | Config/provider are infrastructure |
| TypeScript Strict | PASS | All new types explicit, no `any` |
| TDD Required | PASS | Tests first each phase |
| 80%+ Coverage | PASS | Required on all new files |
| Zero Breaking Changes | PASS | Additive only |

## Source Code Structure

```
src/
├── config/
│   ├── types.ts                    [MODIFY] Add theme, offline, responsive, forms, errorClassification to CoreConfig
│   └── CoreSetup.ts               [MODIFY] Expand init() to delegate to ThemeManager, OfflineSyncManager
├── providers/
│   ├── OptiCoreProvider.tsx        [NEW] Unified provider
│   ├── ConfigContext.tsx           [NEW] React context for runtime config
│   ├── useConfig.ts               [NEW] Hook to consume ConfigContext
│   └── index.ts                   [MODIFY] Export new provider, deprecate CoreProvider
├── hooks/
│   └── useResponsive.ts           [MODIFY] Read breakpoints from ConfigContext
└── index.ts                       [MODIFY] Export new public APIs

test/
├── providers/
│   └── OptiCoreProvider.test.tsx   [NEW]
├── config/
│   └── CoreSetup.expanded.test.ts [NEW]
└── hooks/
    └── useResponsive.context.test.ts [NEW]
```

## Approach

1. **Expand CoreConfig** (`src/config/types.ts`): Add optional `theme?`, `offline?`, `responsive?`, `forms?`, `errorClassification?` sections. Import types from their respective modules to avoid duplication.

2. **CoreSetup Delegation** (`src/config/CoreSetup.ts`): After existing API/Logger blocks, add guarded blocks for `config.theme` → `ThemeManager.configure()` + `registerTheme()` + `init()`, `config.offline` → `OfflineSyncManager.configure()`. Responsive/forms are stored in config for context delivery, not singleton init.

3. **ConfigContext** (`src/providers/ConfigContext.tsx`): React context carrying `{ breakpoints, forms, features }`. Default value uses current hardcoded breakpoints (360/768/1024) so hooks work outside provider.

4. **OptiCoreProvider** (`src/providers/OptiCoreProvider.tsx`): On mount calls `CoreSetup.init(config)`. Composes `ConfigContext.Provider` > `QueryProvider` > `ThemeProvider` > children. Does NOT dispose singletons on unmount. Only cleans up its own listeners.

5. **useResponsive** (`src/hooks/useResponsive.ts`): Reads breakpoints from `useConfig()` context, merges with param if provided, falls back to defaults.

6. **Deprecation**: `CoreProvider` retained as deprecated alias via JSDoc `@deprecated` annotation.
