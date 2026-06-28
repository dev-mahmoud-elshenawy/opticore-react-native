# Implementation Plan: Response Data Convenience

**Branch**: `034-response-data-convenience` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `.specify/specs/034-response-data-convenience/spec.md`

> **BLOCKED ON DECISION**: confirm the unwrapped surface (Option A `api.data.*` / B `*Data` / C `unwrap()`). This plan assumes **Option A**.

## Summary

Additively add an unwrapped accessor — `api.data.{get,post,put,patch,delete}` returning `Promise<T>` (the resolved `ApiResponse<T>.data`) — so the common case drops the `.data` papercut. Existing verbs and `request()` are unchanged (no break to 2.8.0). Lazy/side-effect-free like the rest of the facade. Ships **2.9.0 (minor, additive)**.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict)
**Primary Dependencies**: none new (delegates to `api.*` / `ApiClient.request`)
**Testing**: Jest (`jest-expo`) + RNTL
**Project Type**: Single (library)
**Constraints**: No change to existing verb return shapes; side-effect-free import; `T` defaults to `unknown`; ≥80% coverage on new code
**Scale/Scope**: ~1 file change (`src/facades/api.ts`) + tests + docs/version

## Constitution Check

- **Pure Infra / Spec-First / Strict TS / TDD / SOLID**: ✅
- **Non-breaking**: ✅ additive parallel surface → 2.9.0 minor.
- **Spec 028/030/032 respected**: verbs still private on `ApiClient`; lazy delegation; existing facade contract preserved.

**Result**: PASS (pending the option decision).

## Project Structure

```text
src/facades/api.ts        # EDIT: add `data` namespace (5 unwrapped verbs) to the exported `api`
test/facades/apiData.test.ts  # NEW: parity + unwrap + default-unknown + no-side-effect
src/index.ts              # EDIT: VERSION → 2.9.0
package.json              # EDIT: version → 2.9.0
README.md                 # EDIT: show api.data.* alongside api.*
docs/QUICK_START.md       # EDIT: Step 3 note on wrapped vs unwrapped
docs/api/INFRASTRUCTURE.md# EDIT: facades section — document api.data
CHANGELOG.md              # EDIT: 2.9.0 entry
CLAUDE.md                 # EDIT: header note/version/spec list/footer
```

## Design Detail (Option A)

Extend the existing `api` object with a `data` sub-object that reuses the same forwarding but returns `.data`:

```ts
const unwrap = <T>(p: Promise<ApiResponse<T>>): Promise<T> => p.then((r) => r.data);

export const api = {
  // ...existing request/get/post/put/patch/delete (unchanged, return ApiResponse<T>)...
  data: {
    get: <T = unknown>(url: string, config?: VerbConfig): Promise<T> =>
      unwrap(api.get<T>(url, config)),
    delete: <T = unknown>(url: string, config?: VerbConfig): Promise<T> =>
      unwrap(api.delete<T>(url, config)),
    post: <T = unknown>(url: string, data?: unknown, config?: VerbConfig): Promise<T> =>
      unwrap(api.post<T>(url, data, config)),
    put: <T = unknown>(url: string, data?: unknown, config?: VerbConfig): Promise<T> =>
      unwrap(api.put<T>(url, data, config)),
    patch: <T = unknown>(url: string, data?: unknown, config?: VerbConfig): Promise<T> =>
      unwrap(api.patch<T>(url, data, config)),
  },
} as const;
```

- Delegates to the existing verbs → guaranteed identical `request()` args (parity for free).
- Lazy: still no `getInstance()` at module load (the `data` methods only resolve when called).
- `unwrap` only touches the success path; rejections propagate unchanged.

> If Option B/C is chosen instead, replace the `data` namespace with `*Data` methods or a standalone `unwrap()` export, and adjust tests/docs accordingly.

## Test Strategy

- **Parity**: spy `ApiClient.getInstance().request`; assert `api.data.get('/x', cfg)` forwards the same config object as `api.get('/x', cfg)`.
- **Unwrap**: mock `request` to resolve `{ data: payload, ... }`; assert `api.data.get` resolves to `payload` (not the wrapper).
- **Typing**: `T` defaults to `unknown` (compile-level; covered by usage in tests).
- **No side effects**: extend/duplicate the existing `noSideEffects` assertion to cover `api.data`.
- Existing `api.test.ts` stays green (verbs unchanged).

## Migration Plan

- **2.9.0**: purely additive; `api.data.*` is opt-in. Existing `api.*` unchanged. Docs present both styles ("`api.get` → full response; `api.data.get` → just the payload").

## Complexity Tracking

> None.
