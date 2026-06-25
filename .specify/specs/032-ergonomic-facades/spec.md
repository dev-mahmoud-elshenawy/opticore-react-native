# Feature Specification: Ergonomic Facades + Verb Sugar

**Feature Branch**: `032-ergonomic-facades`
**Created**: 2026-06-25
**Status**: Draft
**Input**: Reduce call-site friction without growing the feature surface. Add ready-to-use facades (`api`, `storage`, `logger`) so consumers stop writing `.getInstance()` everywhere, and add public verb sugar (`api.get/post/put/patch/delete`) over the enum-based `request()`. Pure addition — non-breaking. Ship as 2.8.0.

## Context / Problem

OptiCore's *adoption* story is excellent (one CLI for peers, one `OptiCoreProvider`, graceful native fallbacks). The weak spot is *day-to-day ergonomics*:

1. **`.getInstance()` boilerplate on every call** — `ApiClient.getInstance().request(...)`, `StorageManager.getInstance().secure.get(...)`, `Logger.getInstance().info(...)`. Repeated ceremony with no added meaning; it's the friction hit on every line.
2. **Enum-verbose requests** — the common case is `request({ method: HttpMethod.GET, url: '/users' })` instead of the `api.get('/users')` muscle-memory from axios/ky. The verb methods on `ApiClient` are intentionally **private** (spec 028), so consumers are pushed to the verbose form.

This spec adds a thin **ergonomic layer** that removes both, while leaving every existing API (singletons, `request()`, `HttpMethod`) untouched for advanced use.

**Reconciliation with spec 028:** `ApiClient`'s own verb methods stay private. The new verb sugar lives on a separate `api` facade object and delegates to the **public** `request()`. We are adding public convenience, not re-exposing private internals.

**Constraints carried from prior specs:**
- **Side-effect-free import** (spec 030): facades must resolve the singleton **lazily per call** (or via getters), never at module load.
- **`request()` fails fast** before `configure()`/`CoreSetup.init()` (spec 028): the facade inherits that — calling `api.get(...)` before init throws the same init guard, which is correct.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Use singletons without `.getInstance()` (Priority: P1)

A consumer imports `api`, `storage`, `logger` from the package root and uses them directly. Each delegates to the corresponding singleton, so behavior is identical to calling `.getInstance()` manually.

**Why this priority**: This is the friction hit on every line; removing it is the headline ergonomic win and the reason for the spec.

**Independent Test**: Spy on `ApiClient.getInstance()` / `StorageManager.getInstance()` / `Logger.getInstance()`; call facade members; assert delegation with identical arguments/return values.

**Acceptance Scenarios**:

1. **Given** the provider has configured OptiCore, **When** the consumer calls `logger.info('x', meta)`, **Then** it calls `Logger.getInstance().info('x', meta)` and returns the same result.
2. **Given** configured OptiCore, **When** the consumer reads `storage.secure` / `storage.local`, **Then** it returns the live `StorageManager.getInstance().secure` / `.local` instances.
3. **Given** OptiCore is **not** yet configured, **When** the consumer calls `api.get('/x')`, **Then** it throws the same "called before initialization" error that `request()` throws today (no new failure mode).

---

### User Story 2 - Verb sugar over `request()` (Priority: P1)

A consumer calls `api.get/post/put/patch/delete` with a URL (and body where applicable) instead of building a `RequestConfig` with `HttpMethod`.

**Why this priority**: Removes the second-biggest friction (enum verbosity) for the 90% case while keeping `request()` for advanced use.

**Independent Test**: Spy on `ApiClient.getInstance().request`; call each verb; assert it forwards the correct `method`, `url`, `data`, and pass-through config (`headers`/`params`/`signal`), and returns `ApiResponse<T>`.

**Acceptance Scenarios**:

1. **Given** configured OptiCore, **When** `api.get<User[]>('/users', { params: { page: 1 } })`, **Then** `request` is called with `{ method: HttpMethod.GET, url: '/users', params: { page: 1 } }` and the result is `ApiResponse<User[]>`.
2. **When** `api.post('/users', body, { headers })`, **Then** `request` is called with `{ method: HttpMethod.POST, url: '/users', data: body, headers }`.
3. **When** `api.delete('/users/1')`, **Then** `request` is called with `{ method: HttpMethod.DELETE, url: '/users/1' }`.
4. **When** the consumer needs full control, **Then** `api.request(config)` still works (passthrough) — identical to `ApiClient.getInstance().request(config)`.

---

### User Story 3 - Import clarity (Priority: P2)

A consumer can find, in one place, what to import from the root barrel vs. a subpath, and the Quick Start shows the facade style as the default.

**Why this priority**: Removes the only real onboarding hesitation (barrel vs subpath) and makes the simpler style the first thing newcomers see.

**Independent Test**: README contains an import-map section; Quick Start examples use `api`/`storage`/`logger`; docs reference the facades.

**Acceptance Scenarios**:

1. **Given** the README, **When** a newcomer reads Quick Start, **Then** the default examples use the facades (with a note that singletons remain available).
2. **Given** the README, **When** a consumer is unsure where a symbol comes from, **Then** an import-map table answers it.

---

### Edge Cases

- Facade member accessed before `OptiCoreProvider` runs: `api.*` throws the existing init guard (correct); `logger.*` and `storage.*` resolve their singletons lazily (singletons exist; `getInstance()` is always safe to call).
- Importing the facades module must NOT call any `getInstance()` at module-evaluation time (side-effect-free guarantee).
- Name overlap: `api`/`storage`/`logger` are common identifiers — they are root-barrel exports; consumers may alias on import. Document this.
- `api.get`/`api.delete` with a request body: handled via the optional config (advanced); the common signatures stay `(url, config?)`.
- Return shape consistency: verb sugar returns `ApiResponse<T>` (same as `request()`), NOT an unwrapped `T`, to keep one mental model.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Add `logger` facade exposing `debug/info/warn/error` that delegate to `Logger.getInstance()` with identical signatures and return values.
- **FR-002**: Add `storage` facade exposing `secure` and `local` (via lazy getters) that return the live `StorageManager.getInstance().secure` / `.local`.
- **FR-003**: Add `api` facade exposing `request<T>(config)` (passthrough to `ApiClient.getInstance().request`) plus verb sugar `get/post/put/patch/delete`.
- **FR-004**: Verb sugar MUST map to `request()` exactly: `get(url, cfg?)`/`delete(url, cfg?)` → `{ method, url, ...cfg }`; `post/put/patch(url, data?, cfg?)` → `{ method, url, data, ...cfg }`, where `cfg` is `Omit<RequestConfig, 'method' | 'url' | 'data'>` (`headers`, `params`, `signal`).
- **FR-005**: Verb sugar MUST return `Promise<ApiResponse<T>>` (same shape as `request()`), not an unwrapped `T`. `T` is caller-controlled per call (array, object, union, wrapper, primitive) and MUST default to `unknown` when omitted (`<T = unknown>`) — never `any`. The generic is compile-time only; the facade does not validate runtime shape.
- **FR-006**: Facades MUST resolve their singleton **lazily per call / via getters** — importing the facades module MUST NOT invoke any `getInstance()` at module-evaluation time (preserves side-effect-free import, spec 030).
- **FR-007**: Facades MUST NOT introduce a new pre-initialization failure mode — `api.*` inherits `request()`'s existing init guard; `storage`/`logger` behave exactly as their singletons do today.
- **FR-008**: Export `api`, `storage`, `logger` from the root barrel (`src/index.ts`) and also expose a `opticore-react-native/facades` subpath.
- **FR-009**: All existing APIs (`ApiClient`/`StorageManager`/`Logger` singletons, `request()`, `HttpMethod`, private verb methods) MUST remain unchanged. No breaking change.
- **FR-010**: Update README (Quick Start to facade style + an import-map table), `CHANGELOG.md` (2.8.0 entry), and bump version to 2.8.0.
- **FR-011**: New tests MUST cover delegation (US1), verb mapping + passthrough (US2), and the no-`getInstance()`-on-import guarantee (FR-006). Existing tests stay green; ≥80% coverage on the new module.

### Out of Scope

- Unwrapping responses to `T` (a `.data` shortcut) — deferred; would split the mental model.
- React hooks for the facades (`useApi()` etc.) — deferred; facades suffice.
- Any change to `request()` semantics, interceptors, or `RequestConfig`.
- The error-handling decision-tree doc and any further error changes (separate effort).
- Making `ApiClient`'s private verb methods public (explicitly NOT done — see spec 028).

### Key Entities

- **`api`**: facade object — `request` passthrough + `get/post/put/patch/delete` sugar over `ApiClient.getInstance().request`.
- **`storage`**: facade with lazy `secure`/`local` getters over `StorageManager.getInstance()`.
- **`logger`**: facade delegating `debug/info/warn/error` to `Logger.getInstance()`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A consumer can perform an HTTP call, a storage read, and a log line **without writing `.getInstance()` or `HttpMethod`** — verified by the Quick Start examples compiling/running.
- **SC-002**: Importing `opticore-react-native/facades` triggers **zero** `getInstance()` calls at module load (verified by test).
- **SC-003**: Each verb maps to the correct `request()` arguments (verified by spy tests for all five verbs + passthrough).
- **SC-004**: No public signature of existing APIs changes; full type-check + suite pass; new module coverage ≥80%.
- **SC-005**: README Quick Start uses facades and includes an import-map table; CHANGELOG 2.8.0 entry present; version is 2.8.0.
