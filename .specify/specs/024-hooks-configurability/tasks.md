# Tasks: Hooks Configurability & Fixes

**Spec**: 024 | **Branch**: `feature/024-hooks-configurability`

---

## Phase 1: useResponsive Configurable Breakpoints [US1]

- [ ] T001 [US1] Write test: `useResponsive()` with no params → uses defaults (360/768/1024) (existing behavior)
- [ ] T002 [US1] Write test: `useResponsive({ small: 375, medium: 640, large: 1280 })` with width 700 → `isMedium: true`
- [ ] T003 [US1] Write test: partial breakpoints `{ small: 375 }` merges with defaults for medium/large
- [ ] T004 [US1] Write test: outside OptiCoreProvider → uses defaults without error
- [ ] T005 [US1] Add `Breakpoints` interface to `src/hooks/useResponsive.ts`
- [ ] T006 [US1] Modify `useResponsive()` signature — accept optional `Partial<Breakpoints>` param
- [ ] T007 [US1] Implement merge logic: overrides > context > defaults
- [ ] T008 [US1] Retain exported `breakpoints` constant for backward compat
- [ ] T009 [US1] Run tests — verify all new + existing pass

**Checkpoint**: useResponsive accepts custom breakpoints.

---

## Phase 2: useSafeCall isMounted Guard [US2]

- [ ] T010 [US2] Write test: async call completes while mounted → state updated normally
- [ ] T011 [US2] Write test: component unmounts during async call → no state update, no React warning
- [ ] T012 [US2] Write test: component unmounts during async rejection → no error state update
- [ ] T013 [US2] Modify `src/hooks/useSafeCall.ts` — add `const isMounted = useRef(true)`
- [ ] T014 [US2] Add cleanup: `useEffect(() => () => { isMounted.current = false }, [])`
- [ ] T015 [US2] Guard all `setState` calls with `if (isMounted.current)`
- [ ] T016 [US2] Run tests — verify guard works + existing tests pass

**Checkpoint**: useSafeCall safe on unmount.

---

## Phase 3: useFormState Memoization [US3]

- [ ] T017 [US3] Write test: `handleSubmit` reference is stable across re-renders
- [ ] T018 [US3] Write test: memoized child receiving `handleSubmit` doesn't re-render unnecessarily
- [ ] T019 [US3] Modify `src/forms/useFormState.ts` — wrap `handleSubmit` in `useCallback`
- [ ] T020 [US3] Run tests — verify memoization + existing form tests pass

**Checkpoint**: handleSubmit referentially stable.

---

## Phase 4: Polish

- [ ] T021 Run full test suite: `npm test`
- [ ] T022 Run `npm run type-check` — verify 0 errors
- [ ] T023 Run `npm run lint` — verify 0 errors
- [ ] T024 Verify coverage: 80%+ on modified hook files

**Checkpoint**: Hooks fixes complete.

---

## Dependencies

- Phase 1 depends on Spec 018 (ConfigContext) for context-aware breakpoints, but works standalone with defaults if 018 not yet merged
- Phases 1, 2, 3 can run in parallel (different files, no dependencies)
- All → Phase 4
