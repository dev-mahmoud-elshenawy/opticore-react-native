# Implementation Plan: Status-Code-Aware Transient Retry Handling

**Branch**: `030-transient-retry-handling` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `.specify/specs/030-transient-retry-handling/spec.md`

## Summary

Split the overloaded "actionable" signal into two orthogonal facts on `ApiError`:
`isActionable` (user must fix something) and `isRetryable` (transient, safe to
retry). Parse the `Retry-After` header into `retryAfterMs`. Teach the React Query
client to retry on `isRetryable` and to honor `retryAfterMs` in `retryDelay`. All
changes are additive and backward compatible.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)
**Primary Dependencies**: `axios` ^1.13, `@tanstack/react-query` ^5 (peer)
**Storage**: N/A
**Testing**: Jest (`jest-expo` preset) + RN Testing Library; `tsd` for public API types
**Target Platform**: iOS 13.4+ / Android 5.0+ (library; no app)
**Project Type**: Single project (infrastructure library)
**Performance Goals**: No measurable overhead — classification + header parse are O(1) per failed request
**Constraints**: Zero breaking changes to public API; consumer `QueryClientConfig` overrides must still win; no `any`, no `console.log`, no `!!`
**Scale/Scope**: ~4 source files touched, ~3 new test files

## Constitution Check

_GATE: Must pass before implementation. Re-check after design._

- **Pure Infrastructure Library**: PASS — generic HTTP retry semantics, zero app-specific logic.
- **Specification-First**: PASS — this spec/plan/tasks set precedes code.
- **TypeScript Strict Mode**: PASS — new fields are explicitly typed; `Retry-After` parsing narrows `unknown` headers safely.
- **Test-Driven Development**: PASS — tests authored first per task ordering; ≥80% coverage maintained.
- **Zero Bugs / Error Handling**: PASS — malformed headers degrade gracefully to backoff; no throw paths added.
- **SOLID**: PASS — `ApiError` owns classification (SRP); retry policy depends on the `ApiError` abstraction, not raw status codes (DIP). No interface changes forced on existing implementers (additive only).

No violations → Complexity Tracking table omitted.

## Design Decisions

### 1. Classification lives in `ApiError`, not the retry predicate

The retry predicate stays a thin reader of the error contract (DIP). Add two
static helpers + two instance fields:

```ts
// ApiError.ts
private static readonly NON_TRANSIENT_4XX = new Set([400, 401, 403, 404, 405, 409, 410, 422]);

public readonly isRetryable: boolean;
public readonly retryAfterMs?: number;

private static getIsRetryable(status: number): boolean {
  if (status === 0 || status === -1) return true;   // connectivity / unknown
  if (status === 408 || status === 429) return true; // transient 4xx
  if (status >= 500) return true;                    // server errors
  return false;                                       // other 4xx, 2xx/3xx
}
```

`isActionable` is **redefined** to exclude transient 4xx:

```ts
isActionable: status >= 400 && status < 500
  && status !== 408 && status !== 429
```

(Update the `super(...)` call in the constructor accordingly.)

### 2. `Retry-After` parsing — interceptor extracts, `ApiError` parses

`ErrorInterceptor` reads `error.response.headers['retry-after']` (a `string |
undefined`) and passes it to `ApiError` as a new **optional 6th positional param**
`retryAfterHeader?: string` (backward compatible — existing 5-arg call sites
unaffected). `ApiError` parses it into `retryAfterMs`:

```ts
private static parseRetryAfter(header?: string): number | undefined {
  if (!header) return undefined;
  const trimmed = header.trim();
  // delta-seconds form
  if (/^\d+$/.test(trimmed)) {
    const ms = Number(trimmed) * 1000;
    return Number.isFinite(ms) ? Math.min(ms, RETRY_AFTER_MAX_MS) : undefined;
  }
  // HTTP-date form
  const dateMs = Date.parse(trimmed);
  if (Number.isNaN(dateMs)) return undefined;
  const delta = dateMs - Date.now();
  return Math.min(Math.max(delta, 0), RETRY_AFTER_MAX_MS);
}
```

`RETRY_AFTER_MAX_MS = 30000` to align with the existing backoff cap.

> Note: `Date.now()` is used in production source (not a workflow script) — this
> is normal app/runtime code and unaffected by any sandbox restriction.

Rationale for keeping parse in `ApiError`: it owns all status/retry semantics in
one place, and the interceptor stays a dumb shape-adapter (it only knows where the
header lives in the Axios object).

### 3. Retry policy reads the contract

```ts
// createQueryClient.ts
const isRetryable = (error: unknown): boolean => {
  if (error instanceof ApiError) return error.isRetryable;
  if (error instanceof RenderError) return !error.isActionable; // pre-existing fallback semantics
  return true; // plain errors: let count-based limit decide
};

retry: (failureCount, error) =>
  isRetryable(error) && failureCount < DEFAULT_MAX_RETRIES,

retryDelay: (attempt, error) => {
  if (error instanceof ApiError && error.retryAfterMs !== undefined) {
    return Math.min(error.retryAfterMs, MAX_BACKOFF_MS);
  }
  return Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
}
```

Mutations use the same `isRetryable`/`retryDelay` with their lower count (`< 1`).
Consumer overrides via `overrides.defaultOptions` still spread last and win.

### 4. P3 typing (optional, can land separately)

Change `createQueryHook` generic error type from `Error` to `RenderError` (or a
new exported `ApiQueryError = RenderError`), and add a `tsd` assertion. Gated as
P3 so it can be dropped without affecting P1.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/030-transient-retry-handling/
├── spec.md
├── plan.md      # this file
└── tasks.md
```

### Source Code (files touched)

```text
src/infrastructure/network/
├── ApiError.ts                       # + isRetryable, retryAfterMs, parse + classify helpers; redefine isActionable
└── interceptors/ErrorInterceptor.ts  # extract Retry-After header, pass to ApiError

src/query/
├── createQueryClient.ts              # retry predicate reads isRetryable; retryDelay honors retryAfterMs
└── createQueryHook.ts                # (P3) sharpen error type

test/
├── infrastructure/network/ApiError.test.ts                 # classification + Retry-After parsing
├── infrastructure/network/interceptors/ErrorInterceptor.test.ts  # header extraction passthrough
└── query/createQueryClient.test.ts                         # retry + retryDelay behavior per status
test-d/  (or existing tsd location)                         # (P3) error-type assertion
```

**Structure Decision**: Single-project library layout. Tests live under the
top-level `test/` tree mirroring `src/` (per `jest.config.js` `roots: ['<rootDir>/test']`),
NOT co-located with source.

## Test Strategy

- **Unit (ApiError)**: table-driven over statuses → assert `{ isActionable, isRetryable, severity }`. Separate `describe` for `Retry-After`: integer seconds, HTTP-date future, HTTP-date past, malformed, missing, over-cap clamp.
- **Unit (ErrorInterceptor)**: mock an Axios error with `response.headers['retry-after']`; assert resulting `ApiError.retryAfterMs`. Re-assert cancellation passthrough and network/timeout (`408`) classification.
- **Unit (createQueryClient)**: invoke the `retry`/`retryDelay` functions directly with synthetic `ApiError`s — `429`→retry, `422`→no retry, `503`→retry, plain `Error`→count-based; `retryDelay` returns `retryAfterMs` when set, backoff otherwise, clamped at 30s. Assert consumer overrides still win.
- **Type (tsd, P3)**: `createQueryHook` result `error` exposes `status` without cast.

Verify each test fails before the corresponding implementation lands (TDD order in tasks.md).

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Redefining `isActionable` changes UI behavior for `408`/`429` consumers relied on | Documented in CHANGELOG as a behavior fix; `408`/`429` were mis-flagged as user-fixable. Severity for these stays non-critical. |
| `Date.parse` locale/format edge cases for HTTP-date | Only accept finite parse results; clamp negative→0; otherwise fall back to backoff. |
| Over-large `Retry-After` (e.g. `3600`) stalls UX | Clamp to 30s `RETRY_AFTER_MAX_MS`. |
| Hidden coupling: retry predicate importing `ApiError` into `src/query` | `src/query` already imports from `src/error`; importing `ApiError` from `src/infrastructure/network` is a permitted downward dependency (no cycle). Verify with build. |

## Migration / Backward Compatibility

- `ApiError` constructor gains an **optional** trailing param → all existing call sites compile unchanged.
- `createQueryClient` signature unchanged; defaults shift only for transient codes.
- No export removals. CHANGELOG entry under a new minor version documents the `429`/`503`/`Retry-After` behavior change. Version bump handled at release per existing workflow.
