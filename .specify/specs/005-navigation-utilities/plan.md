# Implementation Plan: Navigation Utilities

**Branch**: `005-navigation-utilities` | **Date**: 2026-02-02 | **Spec**: [spec.md](./spec.md)

## Summary

Provide a `useRouteHelper` hook wrapping Expo Router's `useRouter` for programmatic navigation with plain string routes. No route path definitions, no route guards — this is a core library used across many projects.

**Technical Approach**: Thin wrapper around Expo Router's `useRouter` hook. Accept plain `string` routes and optional `Record<string, string | number>` params. Use `dismissAll()` + `replace()` for reliable stack reset.

## Technical Context

**Language/Version**: TypeScript 5.9.2 (strict mode)
**Primary Dependencies**:

- expo-router ^6.0.21 (file-based navigation)
- React 18.2.0

**Testing**: Jest ^29.7.0, React Native Testing Library ^12.4.3
**Target Platform**: React Native 0.81+, Expo SDK 54+
**Project Type**: npm package (library)
**Constraints**: Must work with Expo Router; must NOT define app-specific routes

## Constitution Check

- ✅ **Pure Infrastructure**: Navigation helper only, zero app-specific logic
- ✅ **TypeScript Strict Mode**: All types clean
- ✅ **SOLID Principles**: Single responsibility — navigation only
- ✅ **Zero Bugs**: Safe back() at root, reliable reset()
- ✅ **Test-Driven**: 80%+ coverage

## Implementation Phases

### Phase 1: RouteHelper Hook

- Create `useRouteHelper` hook wrapping `useRouter`
- `push(route: string, params?)` — navigate to route
- `replace(route: string, params?)` — replace current screen
- `back()` — safe back (no-op at root)
- `reset(route: string, params?)` — `dismissAll()` + `replace()`
- Export `NavigationParams` type

### Phase 2: Testing & Documentation

- Unit tests for all 4 navigation functions
- Edge case tests (back at root, reset empty stack, params/no params)
- Usage example

## File Inventory

| # | File | Action |
|---|------|--------|
| 1 | `src/navigation/RouteHelper.ts` | **Rewrite** — plain string routes, fix reset() |
| 2 | `src/navigation/index.ts` | **Rewrite** — export RouteHelper only |
| 3 | `test/navigation/RouteHelper.test.ts` | **Rewrite** — updated tests |
| 4 | `examples/navigation/UsageExample.tsx` | **Rewrite** — simplified example |
| 5 | `src/navigation/NavigationTypes.ts` | **Delete** |
| 6 | `src/navigation/RouteGuard.tsx` | **Delete** |
| 7 | `test/navigation/RouteGuard.test.tsx` | **Delete** |

**Total**: 4 files kept, 3 files deleted
