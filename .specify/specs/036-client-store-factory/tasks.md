# Tasks 036 — Client Store Factory (`createClientStore`)

> Checklist for [spec.md](./spec.md) / [plan.md](./plan.md). Each task < 30 min.

## Phase 1 — Core implementation

- [x] Add `src/state/createClientStore.ts` with `createClientStore` + `ClientStoreConfig`
- [x] Wire optional `persist` middleware via `createPersistStorage<T>()`
- [x] Honor `partialize`; default `devtools` to `__DEV__`
- [x] Export from `src/state/index.ts`

## Phase 2 — Tests

- [x] Add `test/state/createClientStore.test.ts`
- [x] Cover: hook usage, action updates, no-persist isolation, persist + partialize
- [x] All tests pass

## Phase 3 — Verify (package)

- [x] `npm run type-check` clean
- [x] eslint clean on new files
- [x] prettier clean on new files
- [ ] `npm run build` — emit `createClientStore` into `dist/`

## Phase 4 — Demo migration

- [x] `savedStore.ts` → `createClientStore` (drop direct `zustand` import)
- [x] `preferencesStore.ts` → `createClientStore`
- [x] `newsFilterStore.ts` → `createClientStore`

## Phase 5 — Docs (package)

- [x] `CHANGELOG.md` — 3.1.0 entry
- [x] `README.md` + `docs/api/STATE.md` — `createClientStore` in state section
- [x] `CLAUDE.md` — version + spec 036 line
- [x] `package.json` — bump to 3.1.0
