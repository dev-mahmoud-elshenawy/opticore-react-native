# Plan 036 — Client Store Factory (`createClientStore`)

> Implementation plan for [spec.md](./spec.md). Additive, non-breaking → target 3.1.0.

## Technical Approach

A thin wrapper over zustand's React `create` that composes the `persist` (optional) and
`devtools` middleware, returning a `UseBoundStore<StoreApi<T>>`. Persistence delegates to the
existing `createPersistStorage()` so no new storage code is introduced. Plain `set` semantics
(no immer) so it is a true drop-in for raw `create` — this is the deliberate difference from
`createBaseStore` (which keeps immer + returns a vanilla store).

Middleware mutator-tuple typing is bridged with localized `any` casts at the boundary only
(same pattern already used in `BaseStore.ts`); the public surface stays typed via `T`.

## File Structure

| File                                                     | Change                                          |
| -------------------------------------------------------- | ----------------------------------------------- |
| `src/state/createClientStore.ts`                         | NEW — `createClientStore` + `ClientStoreConfig` |
| `src/state/index.ts`                                     | `export * from './createClientStore'`           |
| `test/state/createClientStore.test.ts`                   | NEW — unit tests                                |
| `CHANGELOG.md`, `README.md`, `CLAUDE.md`, `package.json` | 3.1.0 docs + version                            |

No changes to `createBaseStore`, `createCrudStore`, `StoreConfig`, `persistStorage`, or any
existing export's behavior.

## Test Strategy

Jest (`jest-expo`), test under `test/state/`:

- hook is callable + `getState()` returns initial state
- actions update state (plain `set`)
- `persist:false` performs no storage writes
- `persist:true` writes via `StorageManager.local.set` and honors `partialize`

`devtools` defaulted off in tests to avoid redux-devtools connection noise.

## Migration Plan

Demo (`opticore-news-demo`) stores `savedStore` / `preferencesStore` / `newsFilterStore`
switch from raw `create` + hand-wired `persist` to `createClientStore`, dropping their direct
`zustand` import. Package is rebuilt (`npm run build`) so the `file:` linked demo resolves the
new export from `dist/`. No behavior change — same hook names, same shapes, same storage keys.

## Rollback

Pure addition. Reverting the export line + deleting `createClientStore.ts` fully removes it; the
demo stores revert to the previous raw-zustand form.
