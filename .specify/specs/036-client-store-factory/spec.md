# Spec 036 — Client Store Factory (`createClientStore`)

**Status**: Approved · **Target**: 3.1.0 (additive, non-breaking) · **Date**: 2026-06-29

## What

Add `createClientStore<T>(config, initializer)` to `src/state/` — a thin factory that
returns a **ready-to-use React hook** (zustand `create` flavor) for simple **client-only
UI state**, with optional OptiCore-backed persistence wired in.

## Why

`createCrudStore` (CRUD-over-API) and `createBaseStore` (returns a **vanilla** store needing
`StoreProvider` + `useStore`) don't fit simple client state (bookmarks, preferences, filters).
Today consumers reach for raw `import { create } from 'zustand'` and hand-wire `persist` +
`createPersistStorage()`. This factory closes that gap.

## Requirements

- FR1: Returns `UseBoundStore<StoreApi<T>>` — usable as a hook and via `.getState()`.
- FR2: `persist: true` wraps with zustand `persist` using `createPersistStorage<T>()`.
- FR3: `partialize` honored when persisting.
- FR4: `devtools` defaults to `__DEV__` (same resolution as `createBaseStore`).
- FR5: Plain `set` semantics (no immer) — drop-in for raw `create`.
- NFR: Additive only; exported from `src/state/index.ts`; 80%+ coverage; strict TS; 0 lint.

## Success

Demo's `savedStore`/`preferencesStore`/`newsFilterStore` can drop their direct `zustand`
import. `npm run validate` passes.

## Frontend Changes

N/A — library state utility, no UI.

## Risks

zustand middleware tuple typing → localized `any` casts at the middleware boundary (same as
`BaseStore.ts`); state stays typed via `T`.
