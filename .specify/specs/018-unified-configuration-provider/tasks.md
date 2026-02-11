# Tasks: Unified Configuration & Provider

**Spec**: 018 | **Branch**: `feature/018-unified-configuration-provider`

---

## Phase 1: Expand CoreConfig Types [US1]

- [x] T001 [US1] Add `ResponsiveConfig` interface to `src/config/types.ts` with `breakpoints?: { small?: number; medium?: number; large?: number }`
- [x] T002 [US1] Add `FormsConfig` interface to `src/config/types.ts` with `defaultPhoneFormat?`, `defaultCurrency?`, `customCardPatterns?`
- [x] T003 [US1] Add `ErrorClassificationConfig` interface to `src/config/types.ts` with `customRules?`
- [x] T004 [US1] Add `CoreThemeConfig` interface extending `ThemeConfig` with `customThemes?: Record<string, Theme>`
- [x] T005 [US1] Expand `CoreConfig` interface with optional `theme?`, `offline?`, `responsive?`, `forms?`, `errorClassification?`
- [x] T006 [US1] Run `npm run type-check` — verify 0 errors

**Checkpoint**: CoreConfig type is expanded. No runtime changes yet.

---

## Phase 2: CoreSetup Delegation [US1]

- [x] T007 [US1] Write tests in `test/config/CoreSetup.expanded.test.ts` for theme delegation (configure + registerTheme + init)
- [x] T008 [US1] Write tests for offline delegation (configure)
- [x] T009 [US1] Write tests for minimal config (only `api`) — verify no errors when optional sections omitted
- [x] T010 [US1] Modify `src/config/CoreSetup.ts` — add theme delegation block: `if (config.theme)` → `ThemeManager.configure()` + iterate `customThemes` + `init()`
- [x] T011 [US1] Modify `src/config/CoreSetup.ts` — add offline delegation block: `if (config.offline)` → `OfflineSyncManager.configure()`
- [x] T012 [US1] Modify `src/config/CoreSetup.ts` — store `responsive`, `forms`, `errorClassification` in config for context delivery
- [x] T013 [US1] Run tests — verify all new + existing tests pass

**Checkpoint**: `CoreSetup.init()` delegates to all subsystems.

---

## Phase 3: ConfigContext & OptiCoreProvider [US2]

- [x] T014 [P] [US2] Create `src/providers/ConfigContext.tsx` with `ConfigContextValue` type and default values (breakpoints: 360/768/1024)
- [x] T015 [P] [US2] Create `src/providers/useConfig.ts` hook that reads from ConfigContext
- [x] T016 [US2] Write tests in `test/providers/OptiCoreProvider.test.tsx` — basic rendering, context provision, theme context, query context
- [x] T017 [US2] Write tests for unmount behavior — verify singletons NOT disposed
- [x] T018 [US2] Write tests for empty config — verify defaults work
- [x] T019 [US2] Create `src/providers/OptiCoreProvider.tsx` — compose ConfigContext.Provider > QueryProvider > ThemeProvider
- [x] T020 [US2] Implement mount logic: call `CoreSetup.init(config)` in useEffect
- [x] T021 [US2] Implement cleanup: remove only provider's own listeners, NOT dispose singletons
- [x] T022 [US2] Memoize ConfigContext value with `useMemo` to prevent unnecessary re-renders
- [x] T023 [US2] Run tests — verify all pass

**Checkpoint**: OptiCoreProvider composes all providers with single config.

---

## Phase 4: useResponsive Context Integration [US3]

- [x] T024 [US3] Write tests in `test/hooks/useResponsive.context.test.tsx` — custom breakpoints via param
- [x] T025 [US3] Write tests — custom breakpoints via ConfigContext
- [x] T026 [US3] Write tests — outside provider uses defaults
- [x] T027 [US3] Write tests — param takes precedence over context
- [x] T028 [US3] Modify `src/hooks/useResponsive.ts` — accept optional `Partial<Breakpoints>` param
- [x] T029 [US3] Modify `src/hooks/useResponsive.ts` — read from `useConfig()`, merge param > context > defaults
- [x] T030 [US3] Retain exported `breakpoints` constant for backward compat
- [x] T031 [US3] Run tests — verify all new + existing hook tests pass

**Checkpoint**: useResponsive reads config from context.

---

## Phase 5: Exports & Deprecation

- [x] T032 [P] Modify `src/providers/index.ts` — export OptiCoreProvider, ConfigContext, useConfig
- [x] T033 [P] Add `@deprecated` JSDoc to CoreProvider export in `src/providers/index.ts`
- [x] T034 Modify `src/index.ts` — export OptiCoreProvider, useConfig, ConfigContext
- [x] T035 Run full test suite: `npm test`
- [x] T036 Run `npm run type-check` — verify 0 errors
- [x] T037 Run `npm run lint` — verify 0 errors

**Checkpoint**: All exports clean, CoreProvider deprecated.

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 (types before implementation)
- Phase 2 → Phase 3 (CoreSetup before Provider that calls it)
- Phase 3 → Phase 4 (ConfigContext before useResponsive reads it)
- Phase 4 → Phase 5 (everything before exports)
- Tasks marked [P] within a phase can run in parallel
