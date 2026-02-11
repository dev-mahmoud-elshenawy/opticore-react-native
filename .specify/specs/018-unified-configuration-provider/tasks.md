# Tasks: Unified Configuration & Provider

**Spec**: 018 | **Branch**: `feature/018-unified-configuration-provider`

---

## Phase 1: Expand CoreConfig Types [US1]

- [ ] T001 [US1] Add `ResponsiveConfig` interface to `src/config/types.ts` with `breakpoints?: { small?: number; medium?: number; large?: number }`
- [ ] T002 [US1] Add `FormsConfig` interface to `src/config/types.ts` with `defaultPhoneFormat?`, `defaultCurrency?`, `customCardPatterns?`
- [ ] T003 [US1] Add `ErrorClassificationConfig` interface to `src/config/types.ts` with `customRules?`
- [ ] T004 [US1] Add `CoreThemeConfig` interface extending `ThemeConfig` with `customThemes?: Record<string, Theme>`
- [ ] T005 [US1] Expand `CoreConfig` interface with optional `theme?`, `offline?`, `responsive?`, `forms?`, `errorClassification?`
- [ ] T006 [US1] Run `npm run type-check` — verify 0 errors

**Checkpoint**: CoreConfig type is expanded. No runtime changes yet.

---

## Phase 2: CoreSetup Delegation [US1]

- [ ] T007 [US1] Write tests in `test/config/CoreSetup.expanded.test.ts` for theme delegation (configure + registerTheme + init)
- [ ] T008 [US1] Write tests for offline delegation (configure)
- [ ] T009 [US1] Write tests for minimal config (only `api`) — verify no errors when optional sections omitted
- [ ] T010 [US1] Modify `src/config/CoreSetup.ts` — add theme delegation block: `if (config.theme)` → `ThemeManager.configure()` + iterate `customThemes` + `init()`
- [ ] T011 [US1] Modify `src/config/CoreSetup.ts` — add offline delegation block: `if (config.offline)` → `OfflineSyncManager.configure()`
- [ ] T012 [US1] Modify `src/config/CoreSetup.ts` — store `responsive`, `forms`, `errorClassification` in config for context delivery
- [ ] T013 [US1] Run tests — verify all new + existing tests pass

**Checkpoint**: `CoreSetup.init()` delegates to all subsystems.

---

## Phase 3: ConfigContext & OptiCoreProvider [US2]

- [ ] T014 [P] [US2] Create `src/providers/ConfigContext.tsx` with `ConfigContextValue` type and default values (breakpoints: 360/768/1024)
- [ ] T015 [P] [US2] Create `src/providers/useConfig.ts` hook that reads from ConfigContext
- [ ] T016 [US2] Write tests in `test/providers/OptiCoreProvider.test.tsx` — basic rendering, context provision, theme context, query context
- [ ] T017 [US2] Write tests for unmount behavior — verify singletons NOT disposed
- [ ] T018 [US2] Write tests for empty config — verify defaults work
- [ ] T019 [US2] Create `src/providers/OptiCoreProvider.tsx` — compose ConfigContext.Provider > QueryProvider > ThemeProvider
- [ ] T020 [US2] Implement mount logic: call `CoreSetup.init(config)` in useEffect
- [ ] T021 [US2] Implement cleanup: remove only provider's own listeners, NOT dispose singletons
- [ ] T022 [US2] Memoize ConfigContext value with `useMemo` to prevent unnecessary re-renders
- [ ] T023 [US2] Run tests — verify all pass

**Checkpoint**: OptiCoreProvider composes all providers with single config.

---

## Phase 4: useResponsive Context Integration [US3]

- [ ] T024 [US3] Write tests in `test/hooks/useResponsive.context.test.ts` — custom breakpoints via param
- [ ] T025 [US3] Write tests — custom breakpoints via ConfigContext
- [ ] T026 [US3] Write tests — outside provider uses defaults
- [ ] T027 [US3] Write tests — param takes precedence over context
- [ ] T028 [US3] Modify `src/hooks/useResponsive.ts` — accept optional `Partial<Breakpoints>` param
- [ ] T029 [US3] Modify `src/hooks/useResponsive.ts` — read from `useConfig()`, merge param > context > defaults
- [ ] T030 [US3] Retain exported `breakpoints` constant for backward compat
- [ ] T031 [US3] Run tests — verify all new + existing hook tests pass

**Checkpoint**: useResponsive reads config from context.

---

## Phase 5: Exports & Deprecation

- [ ] T032 [P] Modify `src/providers/index.ts` — export OptiCoreProvider, ConfigContext, useConfig
- [ ] T033 [P] Add `@deprecated` JSDoc to CoreProvider export in `src/providers/index.ts`
- [ ] T034 Modify `src/index.ts` — export OptiCoreProvider, useConfig, ConfigContext
- [ ] T035 Run full test suite: `npm test`
- [ ] T036 Run `npm run type-check` — verify 0 errors
- [ ] T037 Run `npm run lint` — verify 0 errors

**Checkpoint**: All exports clean, CoreProvider deprecated.

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 (types before implementation)
- Phase 2 → Phase 3 (CoreSetup before Provider that calls it)
- Phase 3 → Phase 4 (ConfigContext before useResponsive reads it)
- Phase 4 → Phase 5 (everything before exports)
- Tasks marked [P] within a phase can run in parallel
