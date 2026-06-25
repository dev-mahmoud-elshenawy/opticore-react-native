# Feature Specification: Status-Code-Aware Transient Retry Handling

**Feature Branch**: `030-transient-retry-handling`
**Created**: 2026-06-25
**Status**: Draft
**Input**: User description: "Fix the axios/React Query status-code handling so transient errors (429, 503) are retried with backoff that honors `Retry-After`, instead of being silently dropped as user-actionable 4xx."

## Context / Problem

OptiCore's error pipeline normalizes every failed request into an `ApiError`
(`src/infrastructure/network/interceptors/ErrorInterceptor.ts` →
`src/infrastructure/network/ApiError.ts`). `ApiError.isActionable` is computed as
`status >= 400 && status < 500`, and `createQueryClient` uses that single flag to
decide retries: actionable errors are never retried.

This conflates two unrelated questions:

- **"Must the user change something?"** (validation `422`, permission `403`, not-found `404`) — correctly NOT retried.
- **"Is this transient and safe to retry?"** (`429 Too Many Requests`, `503 Service Unavailable`, `408`, network/timeout).

Because `429` and `408` are in the `4xx` band, they are currently treated as
user-actionable and **never retried**, even though they are the textbook cases
for backoff-and-retry. Servers also commonly send a `Retry-After` header telling
the client exactly how long to wait; OptiCore ignores it entirely.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Rate-limited request recovers automatically (Priority: P1)

A consumer app makes an API call that hits a rate limit (`429`) or a brief server
overload (`503`). Instead of immediately surfacing an error to the user, OptiCore
retries the request with exponential backoff, and — when the server provides a
`Retry-After` header — waits exactly that long before retrying.

**Why this priority**: This is the core correctness gap. Today a `429`/`503`
fails instantly and is shown to the user as a permanent error, producing avoidable
failures and a poor UX on flaky networks and rate-limited APIs.

**Independent Test**: Configure a mock that returns `429` once then `200`. A query
using the OptiCore query client succeeds after one automatic retry. Verify the
retry delay matches `Retry-After` when present, and falls back to exponential
backoff when absent.

**Acceptance Scenarios**:

1. **Given** a request that returns `429` then `200`, **When** the query runs, **Then** OptiCore retries and the query resolves successfully without surfacing an error.
2. **Given** a `429` response with header `Retry-After: 2`, **When** the retry is scheduled, **Then** the delay before retry is ~2000ms (not the default backoff curve).
3. **Given** a `429` response with header `Retry-After: <HTTP-date 3s in future>`, **When** the retry is scheduled, **Then** the delay is ~3000ms.
4. **Given** a `503` response repeated beyond the max retry count, **When** retries are exhausted, **Then** the final `ApiError` is surfaced with its user-facing message.

---

### User Story 2 - User-actionable errors still fail fast (Priority: P1)

A request fails with a genuinely user-actionable status (`400`, `401`, `403`,
`404`, `409`, `422`). OptiCore does NOT retry it — retrying would waste requests
and delay the error the user needs to see.

**Why this priority**: The fix must not regress existing correct behavior. The
distinction between "transient" and "actionable" is the whole point; both halves
must hold.

**Independent Test**: A query that returns `422` fails immediately with zero
retries; a query that returns `403` fails immediately with zero retries.

**Acceptance Scenarios**:

1. **Given** a request that returns `422`, **When** the query runs, **Then** it fails immediately with `failureCount === 0` (no retries).
2. **Given** a request that returns `403`, **When** the query runs, **Then** it fails immediately and `ApiError.isActionable === true`.
3. **Given** a request that returns `401`, **When** a token-refresh strategy is configured, **Then** the existing single-shot refresh-and-replay in `AuthInterceptor` still runs (unchanged) and React Query does not additionally retry.

---

### User Story 3 - Typed error surface for query consumers (Priority: P3)

A consumer reads `error` off a hook created by `createQueryHook` and can narrow it
to `RenderError`/`ApiError` to access `status`, `isActionable`, `isRetryable`,
`retryAfterMs`, and `userMessage` without a manual cast.

**Why this priority**: Quality-of-life and type-safety improvement. Runtime
behavior is already correct via `instanceof` checks; this only sharpens the public
types. Non-blocking.

**Independent Test**: A `tsd` type test asserts the `error` field of a
`createQueryHook` result is assignable to `RenderError` (or the chosen error type),
exposing `status` without a cast.

**Acceptance Scenarios**:

1. **Given** a hook from `createQueryHook`, **When** a consumer accesses `result.error?.status`, **Then** it type-checks without an explicit cast.

---

### Edge Cases

- **Malformed `Retry-After`** (e.g. `"soon"`, negative, absurdly large): ignore the header and fall back to exponential backoff. Clamp any honored delay to a sane max (reuse the existing 30s cap).
- **`Retry-After` as HTTP-date in the past**: treat as `0`/minimal delay, do not produce a negative delay.
- **`429` on a mutation**: mutations are retried too, but with the lower mutation retry budget (currently 1). Transient classification applies equally.
- **Network error / timeout (`408`, status `0`, status `-1`)**: must remain retryable (already are for `0`/`-1`; `408` must move into the retryable set).
- **Cancellations** (`axios.isCancel`): never reclassified, never retried (existing behavior preserved).
- **Non-`ApiError` failures** thrown from a `queryFn` (e.g. a plain `Error` from a repository): retry policy falls back to the current count-based behavior; no regression.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: `ApiError` MUST expose a boolean `isRetryable` that is `true` for transient statuses (`408`, `429`, all `5xx`) and for connectivity failures (status `0` and `-1`), and `false` for non-transient `4xx` (`400/401/403/404/409/422`, etc.).
- **FR-002**: `ApiError` MUST expose an optional `retryAfterMs: number | undefined`, parsed from the response `Retry-After` header, supporting both the delta-seconds form (`Retry-After: 120`) and the HTTP-date form. Malformed values MUST yield `undefined`.
- **FR-003**: `isActionable` MUST continue to mean "the user must change something" and MUST NOT be `true` for transient statuses `408` and `429` (they are not the user's fault). `400/401/403/404/409/422` remain actionable.
- **FR-004**: The React Query client (`createQueryClient`) retry predicate MUST retry when the error `isRetryable` and the attempt count is under the limit, and MUST NOT retry when the error is actionable/non-retryable. Behavior for non-`ApiError`/non-`RenderError` errors MUST be unchanged (count-based).
- **FR-005**: The React Query `retryDelay` MUST use `error.retryAfterMs` when present (clamped to the existing 30s max), and fall back to the current exponential backoff (`min(1000·2^n, 30000)`) otherwise. Applies to both queries and mutations.
- **FR-006**: `ErrorInterceptor` MUST extract the `Retry-After` header from the error response and make it available to `ApiError` for parsing, without coupling `ApiError` to the Axios error shape at its call site.
- **FR-007**: All new fields MUST be additive and backward compatible — no breaking change to `ApiError`'s public constructor or to `createQueryClient`'s signature/overridability (consumer overrides still win).
- **FR-008**: Existing `AuthInterceptor` 401 single-flight refresh-and-replay behavior MUST remain unchanged.
- **FR-009** _(P3)_: `createQueryHook` SHOULD type its result error channel so consumers can access `RenderError`/`ApiError` fields without a manual cast.

### Key Entities

- **ApiError**: Normalized API failure. Gains `isRetryable: boolean` and `retryAfterMs?: number` alongside existing `status`, `url`, `data`, `isActionable`, `severity`, `userMessage`.
- **Retry policy (createQueryClient)**: Pure functions `retry(failureCount, error)` and `retryDelay(attempt, error)` that read the `ApiError` contract — they do not inspect raw status codes.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A request returning `429`/`503` once then `200` resolves successfully with no error surfaced to the user, in an automated test.
- **SC-002**: When `Retry-After` is present and valid, the scheduled retry delay is within ±10% of the header value (subject to the 30s clamp), verified by an automated test.
- **SC-003**: `400/401/403/404/409/422` responses produce zero React Query retries (verified per status), with no change versus current behavior for those codes.
- **SC-004**: 100% of new branches in `ApiError` classification and `Retry-After` parsing are covered by unit tests; overall suite stays ≥80% coverage and all existing tests continue to pass.
- **SC-005**: `npm run validate` (type-check + lint + format:check + test) passes; public API type tests (`tsd`) pass.
