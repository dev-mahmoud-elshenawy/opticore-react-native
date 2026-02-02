# Tasks: Navigation Utilities (Revised)

**Organization**: Simplified scope — RouteHelper only

## Phase 1: Cleanup

- [x] T001 Delete `src/navigation/NavigationTypes.ts`
- [x] T002 Delete `src/navigation/RouteGuard.tsx`
- [x] T003 Delete `test/navigation/RouteGuard.test.tsx`

## Phase 2: Implementation

- [x] T004 Rewrite `src/navigation/RouteHelper.ts` — plain string routes, fix reset() with dismissAll
- [x] T005 Rewrite `src/navigation/index.ts` — export RouteHelper only

## Phase 3: Testing

- [x] T006 Rewrite `test/navigation/RouteHelper.test.ts` — all 4 functions + edge cases

## Phase 4: Documentation

- [x] T007 Rewrite `examples/navigation/UsageExample.tsx` — simplified example
- [x] T008 Update `src/index.ts` — add navigation export

## Phase 5: Verification

- [x] T009 Run type-check — 0 errors
- [x] T010 Run tests — all passing, 80%+ coverage
- [x] T011 Run lint — 0 errors
