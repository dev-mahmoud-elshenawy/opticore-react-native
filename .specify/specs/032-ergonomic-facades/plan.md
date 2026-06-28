# Implementation Plan: Ergonomic Facades + Verb Sugar

**Branch**: `032-ergonomic-facades` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `.specify/specs/032-ergonomic-facades/spec.md`

## Summary

Add a thin, side-effect-free **facade layer** — `api`, `storage`, `logger` — that removes `.getInstance()` boilerplate, plus public verb sugar (`api.get/post/put/patch/delete`) over the enum-based `request()`. Pure addition: every existing API stays unchanged. Facades resolve singletons lazily (per-call methods / getters) so importing them triggers no `getInstance()` and preserves the side-effect-free import guarantee. Verb sugar returns `ApiResponse<T>` (same shape as `request()`). New root-barrel exports + a `opticore-react-native/facades` subpath. Ships as **2.8.0 (minor, non-breaking)**.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict)
**Primary Dependencies**: none new (delegates to existing `ApiClient`/`StorageManager`/`Logger`)
**Storage**: N/A
**Testing**: Jest (`jest-expo`) + RNTL
**Target Platform**: iOS 13.4+, Android API 21+
**Project Type**: Single (infrastructure library)
**Performance Goals**: N/A (thin delegation; negligible overhead)
**Constraints**: No public signature change; side-effect-free import (spec 030); inherit `request()` init guard (spec 028); no `any`/`!!`; ≥80% coverage on new module
**Scale/Scope**: One new `src/facades/` folder (4 files) + barrel/subpath wiring + docs/version

## Constitution Check

_GATE: Must pass before implementation._

- **Pure Infrastructure**: ✅ Generic ergonomic layer, no app logic.
- **Specification-First**: ✅ spec + plan + tasks generated one-pass, single gate (new flow).
- **TypeScript Strict**: ✅ Generics preserved (`get<T>` → `ApiResponse<T>`); no `any`.
- **TDD / 80%+**: ✅ Delegation + verb-mapping + no-side-effect tests written with the code.
- **Zero Bugs**: ✅ No new failure modes; facades inherit existing guards.
- **SOLID**: ✅ Facade pattern; thin delegation; existing singletons untouched (OCP).
- **Non-breaking**: ✅ Additive only → 2.8.0 minor.
- **Spec 028 respected**: ✅ Verb sugar is on the facade, delegating to public `request()`; `ApiClient` verbs stay private.
- **Spec 030 respected**: ✅ No `getInstance()` at module load.

**Result**: PASS — no Complexity Tracking entries.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/032-ergonomic-facades/
├── spec.md
├── plan.md
└── tasks.md
```

### Source Code (repository root)

```text
src/facades/
├── api.ts          # NEW: `api` — request passthrough + get/post/put/patch/delete sugar
├── storage.ts      # NEW: `storage` — lazy secure/local getters
├── logger.ts       # NEW: `logger` — debug/info/warn/error delegation
└── index.ts        # NEW: re-exports api, storage, logger

src/index.ts        # EDIT: `export * from './facades'`
package.json        # EDIT: add "./facades" to exports; version 2.7.0 → 2.8.0
src/index.ts        # EDIT: VERSION → 2.8.0

test/facades/
├── api.test.ts     # NEW: verb mapping + passthrough + init-guard inheritance
├── storage.test.ts # NEW: lazy getter delegation
├── logger.test.ts  # NEW: method delegation
└── noSideEffects.test.ts  # NEW: importing facades calls no getInstance()

docs / meta:
├── README.md       # EDIT: Quick Start → facade style; add import-map table
├── CHANGELOG.md    # EDIT: 2.8.0 entry
└── CLAUDE.md       # EDIT: version/footer/spec list/header note (self-updating rule)
```

**Structure Decision**: New `src/facades/` module, mirrored tests in `test/facades/`. Facades are exported from the root barrel (the whole point — frictionless import) AND via a dedicated subpath for tree-shaking parity with other modules.

## Design Detail

### `logger` (src/facades/logger.ts)

```ts
import { Logger } from '../infrastructure/logger/Logger';

export const logger = {
  debug: (m: string, ...a: unknown[]) => Logger.getInstance().debug(m, ...a),
  info: (m: string, ...a: unknown[]) => Logger.getInstance().info(m, ...a),
  warn: (m: string, ...a: unknown[]) => Logger.getInstance().warn(m, ...a),
  error: (m: string, e?: Error, ...a: unknown[]) => Logger.getInstance().error(m, e, ...a),
} as const;
```

Lazy: each call resolves the singleton; nothing runs at import.

### `storage` (src/facades/storage.ts)

```ts
import { StorageManager } from '../infrastructure/storage/StorageManager';
import type { IStorage } from '...';

export const storage = {
  get secure(): IStorage {
    return StorageManager.getInstance().secure;
  },
  get local(): IStorage {
    return StorageManager.getInstance().local;
  },
} as const;
```

Getters keep it lazy and always return the live instances (so a reconfigure is reflected).

### `api` (src/facades/api.ts)

```ts
import { ApiClient } from '../infrastructure/network/ApiClient';
import { HttpMethod } from '../infrastructure'; // canonical enum
import type { RequestConfig } from '../types/Api.types';
import type { ApiResponse } from '../infrastructure/network/ApiResponse';

type VerbConfig = Omit<RequestConfig, 'method' | 'url' | 'data'>; // headers, params, signal

export const api = {
  request: <T = unknown>(config: RequestConfig): Promise<ApiResponse<T>> =>
    ApiClient.getInstance().request<T>(config),

  get: <T = unknown>(url: string, config?: VerbConfig): Promise<ApiResponse<T>> =>
    ApiClient.getInstance().request<T>({ method: HttpMethod.GET, url, ...config }),

  delete: <T = unknown>(url: string, config?: VerbConfig): Promise<ApiResponse<T>> =>
    ApiClient.getInstance().request<T>({ method: HttpMethod.DELETE, url, ...config }),

  post: <T = unknown>(url: string, data?: unknown, config?: VerbConfig): Promise<ApiResponse<T>> =>
    ApiClient.getInstance().request<T>({ method: HttpMethod.POST, url, data, ...config }),

  put: <T = unknown>(url: string, data?: unknown, config?: VerbConfig): Promise<ApiResponse<T>> =>
    ApiClient.getInstance().request<T>({ method: HttpMethod.PUT, url, data, ...config }),

  patch: <T = unknown>(url: string, data?: unknown, config?: VerbConfig): Promise<ApiResponse<T>> =>
    ApiClient.getInstance().request<T>({ method: HttpMethod.PATCH, url, data, ...config }),
} as const;
```

- `T` is fully caller-controlled **per call** — array, object, union, wrapper, primitive — and defaults to `unknown` when omitted (safe; forces narrowing instead of `any`).
- The generic is compile-time only; the facade does NOT validate the runtime shape (use Zod at the call site if you need that — same as axios).
- Inherits `request()`'s init guard automatically (it calls the same method).
- Returns `ApiResponse<T>` for one consistent mental model with `request()`.

### Barrel + subpath

- `src/index.ts`: add `export * from './facades';` (after the namespace exports). Confirm no existing `api`/`storage`/`logger` export collisions in the barrel.
- `package.json` `exports`: add `"./facades": { "types": "./dist/facades/index.d.ts", "default": "./dist/facades/index.js" }` matching the existing subpath shape.

## Test Strategy

- **US1 (logger/storage delegation)**: spy on `Logger.getInstance`/`StorageManager.getInstance` and the methods; assert identical args + return.
- **US2 (api)**: spy on `ApiClient.getInstance().request`; for each verb assert `{ method, url, data?, ...cfg }`; assert `api.request` passthrough; assert calling `api.get` before `configure()` throws the existing init error.
- **FR-006 (no side effects)**: in a fresh module registry, `jest.spyOn(...,'getInstance')` then `import('../../src/facades')` and assert the spies were **not** called at import.
- Full suite stays green; new module coverage ≥80%.

## Migration Plan

- **2.8.0**: purely additive. Existing code is unaffected; facades are opt-in. README/Quick Start switch to the facade style as the recommended default, with a note that singletons remain fully supported. No deprecations.

## Complexity Tracking

> No Constitution Check violations — section intentionally empty.
