# Implementation Plan: Hooks Configurability & Fixes

**Branch**: `feature/024-hooks-configurability` | **Date**: 2026-02-11 | **Spec**: spec.md

## Summary

Three targeted fixes to the hooks module: (1) `useResponsive` accepts optional breakpoints param and reads from ConfigContext (Spec 018 dependency), (2) `useSafeCall` gets isMounted guard to prevent state updates after unmount, (3) `useFormState`'s `handleSubmit` wrapped in `useCallback` for referential stability. All backward compatible.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)
**Primary Dependencies**: React 19
**Testing**: Jest ^29 + React Native Testing Library ^12
**Target Platform**: iOS & Android

## Constitution Check

| Principle           | Status | Notes                     |
| ------------------- | ------ | ------------------------- |
| Pure Infrastructure | PASS   | Hooks are infrastructure  |
| TypeScript Strict   | PASS   | Breakpoints type explicit |
| Backward Compat     | PASS   | All new params optional   |

## Source Code Structure

```
src/
├── hooks/
│   ├── useResponsive.ts     [MODIFY] Accept param, read from ConfigContext
│   └── useSafeCall.ts       [MODIFY] Add isMounted guard
├── forms/
│   └── useFormState.ts      [MODIFY] Wrap handleSubmit in useCallback

test/
├── hooks/
│   ├── useResponsive.test.ts [MODIFY] Custom breakpoint tests
│   └── useSafeCall.test.ts   [MODIFY] Unmount guard tests
└── forms/
    └── useFormState.test.ts  [MODIFY] Memoization tests
```

## Approach

1. **useResponsive**: Add `Breakpoints` interface `{ small?: number; medium?: number; large?: number }`. Hook signature: `useResponsive(overrides?: Partial<Breakpoints>)`. Internally reads ConfigContext via `useConfig()` (from Spec 018). Merge order: `overrides > context > defaults`. If Spec 018 not yet implemented, use optional import / try-catch pattern so the hook still works standalone.

2. **useSafeCall**: Add `const isMounted = useRef(true)` + `useEffect(() => () => { isMounted.current = false }, [])`. Before each `setState` call, check `if (isMounted.current)`. This prevents the "Can't perform a React state update on an unmounted component" warning.

3. **useFormState**: Wrap the `handleSubmit` function returned to the consumer in `useCallback` with `[form.handleSubmit]` as dependency. This ensures the reference is stable across re-renders, preventing unnecessary re-renders of memoized child components.
