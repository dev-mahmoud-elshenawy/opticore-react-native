# Implementation Plan: Official Test Utilities

**Branch**: `035-testing-utilities` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `.specify/specs/035-testing-utilities/spec.md`

## Summary

Ship `createMemoryAdapters()` and `resetOptiCore()` at a new `opticore-react-native/testing`
subpath (NOT in the main barrel — mirrors `navigation`, keeps test code out of prod bundles).
`createMemoryAdapters()` returns Map-backed in-memory implementations of all five adapter
interfaces (override-merge supported). `resetOptiCore()` best-effort-resets cross-test state
(adapter fallback warnings, in-memory storage, extra logger transports). No test-framework
imports. Additive, non-breaking; **no version bump** (batched per the current directive —
CHANGELOG under `[Unreleased]`).

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict)
**Primary Dependencies**: none new (implements existing `OptiCoreAdapters` interfaces)
**Testing**: Jest (`jest-expo`)
**Project Type**: Single (library)
**Constraints**: no Jest/RNTL imports in `src/testing/`; not in main barrel; `resetOptiCore()` never throws; isolated Maps per call; no `any`/`!!`; ≥80% coverage on new code
**Scale/Scope**: new `src/testing/` (≈3 files) + subpath wiring + minimal `__resetForTest()` hooks where needed + docs

## Constitution Check

- **Pure Infra / Spec-First / Strict TS / TDD / SOLID**: ✅
- **Non-breaking**: ✅ additive; new subpath only.
- **Spec 028/030 parity**: subpath kept out of main barrel (like navigation); no side-effects at import.

**Result**: PASS.

## Project Structure

```text
src/testing/
├── createMemoryAdapters.ts   # NEW: Map-backed doubles for all 5 adapter interfaces
├── resetOptiCore.ts          # NEW: best-effort cross-test reset
└── index.ts                  # NEW: re-export both

package.json                  # EDIT: add "./testing" subpath to exports
src/index.ts                  # UNCHANGED (deliberately NOT re-exporting testing)

# Minimal additive reset hooks ONLY where a safe reset doesn't already exist:
src/infrastructure/logger/Logger.ts            # maybe add __resetForTest() (clear transports)
src/infrastructure/storage/LocalStorage.ts     # memory clear path (if needed)
# (reuse src/adapters/registry.ts _resetAdapterWarnings — already exported)

test/testing/
├── createMemoryAdapters.test.ts   # NEW: round-trip, isolation, overrides
├── resetOptiCore.test.ts          # NEW: warnings/storage/transports reset; safe-when-unconfigured
└── notInBarrel.test.ts            # NEW: testing utils absent from main barrel

docs/TESTING.md                # EDIT: use createMemoryAdapters()/resetOptiCore()
README.md                      # EDIT: add ./testing to the import-map
CHANGELOG.md                   # EDIT: [Unreleased] entry
CLAUDE.md                      # EDIT: spec list + (no version change)
```

**Structure Decision**: A dedicated `src/testing/` module exposed only via the `./testing`
subpath. This is the established pattern for non-prod/optional surfaces (navigation).

## Design Detail

### `createMemoryAdapters(overrides?)`

```ts
import type { OptiCoreAdapters /* the 5 adapter types */ } from '../adapters/interfaces';

export function createMemoryAdapters(overrides: Partial<OptiCoreAdapters> = {}): OptiCoreAdapters {
  const secureMap = new Map<string, string>();
  const localMap = new Map<string, string>();
  return {
    secureStorage: {
      setItemAsync: async (k, v) => void secureMap.set(k, v),
      getItemAsync: async (k) => secureMap.get(k) ?? null,
      deleteItemAsync: async (k) => void secureMap.delete(k),
    },
    localStorage: {
      setItem: async (k, v) => void localMap.set(k, v),
      getItem: async (k) => localMap.get(k) ?? null,
      removeItem: async (k) => void localMap.delete(k),
      clear: async () => void localMap.clear(),
    },
    connectivity: {
      fetch: async () => ({ isConnected: true /* ...ConnectivitySnapshot defaults */ }),
      addEventListener: () => () => {}, // no-op unsubscribe
    },
    device: {
      getSystemVersion: () => 'test',
      getModel: () => 'test-device',
      getUniqueId: async () => 'test-unique-id',
    },
    clipboard: (() => {
      let buf = '';
      return {
        setString: (v) => {
          buf = v;
        },
        getString: async () => buf,
      };
    })(),
    ...overrides, // named override replaces the whole adapter; others stay in-memory
  };
}
```

- Maps are created **inside** the function → isolation per call (FR-002).
- Exact method shapes match `interfaces.ts` (verify `ConnectivitySnapshot` required fields during impl).

### `resetOptiCore()`

```ts
import { _resetAdapterWarnings } from '../adapters/registry';

export async function resetOptiCore(): Promise<void> {
  try {
    _resetAdapterWarnings();
  } catch {
    /* unconfigured — ignore */
  }
  try {
    Logger.getInstance().clearTransports();
  } catch {
    /* ignore */
  }
  try {
    await StorageManager.getInstance().clearAll();
  } catch {
    /* ignore */
  }
  // async because clearAll() is async; each step guarded so it never throws
  // when OptiCore was not configured. (Logger.clearTransports already exists —
  // no __resetForTest() needed.)
}
```

- Wrapped per-step so it's safe before any provider ran (FR-003).
- Add `__resetForTest()` to a singleton only if no safe public reset exists (FR-004).

### Subpath wiring

- `package.json` exports: add `"./testing": { types/react-native/import/require → ./dist/testing/index.* }` (match existing shape).
- Do NOT add to `src/index.ts`.

## Test Strategy

- **US1**: round-trip set/get on secure+local; `connectivity.fetch()` connected; override replaces one adapter, others remain in-memory; two factory calls are isolated.
- **US2**: trigger a fallback warning → `resetOptiCore()` → warning fires again; write storage → reset → empty; add a logger transport → reset → gone; calling `resetOptiCore()` with no provider does not throw.
- **US3**: assert `opticore-react-native` main barrel does NOT export `createMemoryAdapters`/`resetOptiCore` (import the barrel, check keys); subpath does.
- Full suite green; new module coverage ≥80%; grep guard: no `jest`/`@testing-library` import in `src/testing/`.

## Migration Plan

- Additive; opt-in via the `./testing` subpath. No version bump now — CHANGELOG `[Unreleased]`; released with the batch bump.

## Complexity Tracking

> None.
