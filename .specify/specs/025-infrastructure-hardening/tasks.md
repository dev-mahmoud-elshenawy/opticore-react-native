# Tasks: Infrastructure Hardening

**Spec**: 025 | **Branch**: `feature/025-infrastructure-hardening`

---

## Phase 1: SecureStorage Init Guard [US1]

- [x] T001 [US1] Write test: `get('existing_key')` immediately after `getInstance()` → returns stored value (not null)
- [x] T002 [US1] Write test: `set('key', 'value')` immediately after `getInstance()` → waits for init, then writes
- [x] T003 [US1] Write test: `loadKeys()` failure → graceful fallback, `get()` returns null (no crash)
- [x] T004 [US1] Write test: after init completes, operations execute immediately (no delay)
- [x] T005 [US1] Modify `src/infrastructure/storage/SecureStorage.ts` — add `private readyPromise: Promise<void>`
- [x] T006 [US1] Initialize `readyPromise` in constructor from `this.loadKeys().catch()`
- [x] T007 [US1] Add `await this.readyPromise` as first line in `get()`, `set()`, `remove()`, `clear()`
- [x] T008 [US1] Run tests — verify init guard + existing storage tests pass

**Checkpoint**: SecureStorage race condition fixed. ✅

---

## Phase 2: CoreProvider Singleton Safety [US2]

- [x] T009 [US2] Write test: mount CoreProvider, unmount, verify ConnectivityManager still works
- [x] T010 [US2] Write test: mount CoreProvider, unmount, verify LifecycleManager still works
- [x] T011 [US2] Write test: external listener added before CoreProvider mount still fires after unmount
- [x] T012 [US2] Modify `src/providers/CoreProvider.tsx` — remove `connectivityManager.dispose()` from cleanup
- [x] T013 [US2] Modify `src/providers/CoreProvider.tsx` — remove `lifecycleManager.dispose()` from cleanup
- [x] T014 [US2] Replace with no-op cleanup or remove the specific listener the provider added
- [x] T015 [US2] Run tests — verify singleton safety + existing provider tests pass

**Checkpoint**: Singletons survive provider unmount. ✅

---

## Phase 3: Theme Shadows RN Format [US3]

- [x] T016 [US3] Add `ThemeShadowValue` type to `src/theme/types.ts`: `{ shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation }`
- [x] T017 [US3] Change `ThemeShadows` type from `{ [key: string]: string }` to `{ [key: string]: ThemeShadowValue }`
- [x] T018 [US3] Write test: `lightTheme.shadows.md` has all required RN shadow properties
- [x] T019 [US3] Write test: `darkTheme.shadows.md` has correct elevated opacity values
- [x] T020 [US3] Write test: shadow values are spreadable on a View style
- [x] T021 [US3] Update `src/theme/defaultThemes.ts` lightTheme shadows to RN objects
- [x] T022 [US3] Update `src/theme/defaultThemes.ts` darkTheme shadows to RN objects
- [x] T023 [US3] Run `npm run type-check` — verify 0 errors (any consuming code using old string type will surface)
- [x] T024 [US3] Run tests — verify shadow format tests pass

**Checkpoint**: Shadows work on React Native. ✅

---

## Phase 4: ThemeManager Fixes [US4, US5]

- [x] T025 [US4] Write test: `init()` called twice → only 1 appearance listener exists
- [x] T026 [US4] Write test: `dispose()` then `init()` → exactly 1 listener
- [x] T027 [US4] Modify `src/theme/ThemeManager.ts` — make `setupAppearanceListener()` idempotent (remove old before adding new)
- [x] T028 [US4] Remove duplicate `setupAppearanceListener()` call from `init()` (constructor already calls it)
- [x] T029 [US5] Modify `src/theme/ThemeManager.ts` — replace all `console.warn(...)` with `Logger.getInstance().warn(...)`
- [x] T030 [US5] Write test: ThemeManager warning in production mode → no output (Logger suppresses)
- [x] T031 Run tests — verify listener + Logger integration

**Checkpoint**: ThemeManager stable. ✅

---

## Phase 5: Polish & Verification

- [x] T032 Run full test suite: `npm test`
- [x] T033 Run `npm run type-check` — verify 0 errors in src/
- [x] T034 Run `npm run lint` — 0 errors in modified files
- [x] T035 Verify coverage: all modified files pass
- [ ] T036 Document ThemeShadows breaking change in CHANGELOG.md

**Checkpoint**: Infrastructure hardening complete. ✅

---

## Dependencies

- Phase 1 independent (can start immediately)
- Phase 2 independent (can run parallel with Phase 1)
- Phase 3 independent (can run parallel with Phase 1, 2)
- Phase 4 independent (can run parallel with Phase 1, 2, 3)
- All → Phase 5

**Note**: Phases 1-4 touch completely different files and can all run in parallel.
