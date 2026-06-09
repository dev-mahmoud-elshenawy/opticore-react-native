# Feature Specification: Consumer Integration Fixes

**Feature Branch**: `028-consumer-integration-fixes`
**Created**: 2026-06-08
**Status**: Implemented (release pending — version bump deferred; more changes batched)
**Input**: Production-integration feedback from a consuming team using OptiCore in a React Navigation app.

## Background

A colleague integrating OptiCore into a production app (using React Navigation, not
expo-router) reported four blockers. All four were reproduced and confirmed against the
current `main`:

1. The package forces a hard dependency on `expo-router`; any app not using expo-router
   fails the Metro build. They had to stub the module and redirect the import via Metro.
2. Installation produced a peer-dependency conflict requiring `--legacy-peer-deps`.
3. The README/docs use `apiClient.get()` / `apiClient.post()`, but those methods are not
   available in the current TypeScript typings.
4. Some API calls executed before `CoreSetup.init()` completed; they had to add a delay
   workaround to make services wait for setup.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Use OptiCore without expo-router (Priority: P1)

A developer whose app uses React Navigation (or no router) installs `opticore-react-native`
and imports `ApiClient`, `Logger`, hooks, etc. from the main entry. The app builds and runs
with **no** expo-router installed and **no** Metro stubs or `--legacy-peer-deps`.

**Why this priority**: This is a hard build/install blocker. It prevents adoption by the
majority of RN apps that do not use expo-router. Fixing it unblocks installation itself.

**Independent Test**: In a fresh RN app without expo-router, `npm install opticore-react-native`
completes with no peer conflict, and a Metro/tsc build of code importing from
`opticore-react-native` succeeds without resolving expo-router.

**Acceptance Scenarios**:

1. **Given** an app without `expo-router`, **When** it imports anything from
   `opticore-react-native` (main entry), **Then** the bundler never attempts to resolve
   `expo-router` and the build succeeds.
2. **Given** an app installing OptiCore with a strict package manager (npm 7+), **When**
   `expo-router` is absent, **Then** installation completes without a peer-dependency error
   and without `--legacy-peer-deps`.
3. **Given** an app that DOES use expo-router, **When** it imports from
   `opticore-react-native/navigation`, **Then** `useRouteHelper` works exactly as before.

---

### User Story 2 - Call ApiClient via the documented `request()` + `HttpMethod` enum (Priority: P1)

A developer follows the docs and performs network calls through the single public entry point
`apiClient.request({ method: HttpMethod.GET, url: '/users' })` (and `POST`/`PUT`/`DELETE`/`PATCH`
via the enum). The verb-specific methods remain **private** implementation details that
`request()` dispatches to. The docs match this enum-based public API and type-check.

**Why this priority**: The documented examples (`apiClient.get()`, `apiClient.post()`) do not
match the public typings — the verb methods are private. Per the chosen design, the public API
is the enum-based `request()`; the fix is to correct the documentation, not to widen the API
surface. High-frequency surface (network calls).

**Independent Test**: A TypeScript consumer can call `apiClient.request({ method, url, data })`
for each `HttpMethod` value and receive a typed `ApiResponse<T>`; `npm run test:types` passes.
The verb methods are NOT part of the public typings.

**Acceptance Scenarios**:

1. **Given** a configured `ApiClient`, **When**
   `apiClient.request<User[]>({ method: HttpMethod.GET, url: '/users' })` is called,
   **Then** it compiles and resolves to `ApiResponse<User[]>`.
2. **Given** the same client, **When** `request()` is called with `HttpMethod.POST/PUT/DELETE/PATCH`,
   **Then** each compiles and dispatches to the corresponding private verb method.
3. **Given** the public typings, **When** a consumer tries `apiClient.get(...)` directly,
   **Then** it is NOT available (verb methods stay private/internal by design).

---

### User Story 3 - Services never run before setup completes (Priority: P1)

A developer wraps their app in `OptiCoreProvider`. Any child component that issues an API
call (even in its first effect, which mounts before the provider's effects) observes a
fully-configured `ApiClient` (baseURL, auth, interceptors) — no delay workaround needed.

**Why this priority**: Silent misconfiguration (calls firing with no baseURL/auth) is a
correctness bug that is hard to diagnose. Affects every app that calls APIs on mount.

**Independent Test**: A child component that calls the network in its mount effect sees the
configured client; `CoreSetup.isInitialized()` returns `true` synchronously before children
render.

**Acceptance Scenarios**:

1. **Given** `OptiCoreProvider` with a config, **When** a child fires an API call in its
   first `useEffect`, **Then** `CoreSetup` is already initialized and the singletons are
   configured.
2. **Given** the provider has rendered once, **When** `CoreSetup.isInitialized()` is called,
   **Then** it returns `true`.
3. **Given** repeated re-renders / StrictMode double-invocation, **When** the provider runs,
   **Then** setup runs effectively once (idempotent) and disposal still occurs on unmount.

---

### User Story 4 - Docs match the real API (Priority: P2)

A developer reading the README and `docs/` finds import paths and API examples that match
the shipped typings (navigation subpath, ApiClient verb methods).

**Why this priority**: Documentation drift caused two of the four reports. Lower priority
than the code fixes but required to close the loop.

**Independent Test**: README/docs reference `opticore-react-native/navigation` for routing
and `apiClient.get/post/...`; examples align with the public typings.

**Acceptance Scenarios**:

1. **Given** the README, **When** a reader follows the navigation example, **Then** it uses
   the `/navigation` subpath import.
2. **Given** the network docs, **When** a reader copies an `apiClient.get()` example, **Then**
   it matches the public API.

### Edge Cases

- App imports `opticore-react-native/navigation` **without** expo-router installed → build
  fails to resolve expo-router (expected — navigation is opt-in and documents the peer).
  A clear runtime/error message is preferred over a cryptic resolver failure.
- `CoreSetup.init()` called multiple times (provider re-mount) → idempotent; last config wins.
- `apiClient.request()` called before `configure()` → behaves as today (uses defaults),
  but with US3 the provider configures before children render.
- `request()` called with an unsupported/invalid `method` → throws
  `Unsupported HTTP method` (existing behavior, preserved).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The main entry (`opticore-react-native`) MUST NOT statically or dynamically
  import `expo-router`. No symbol reachable from the main barrel may resolve `expo-router`.
- **FR-002**: Navigation helpers (`useRouteHelper`, `NavigationParams`) MUST be exposed via a
  dedicated `opticore-react-native/navigation` subpath export only.
- **FR-003**: `expo-router` is a **required** peer (navigation is a first-class, universally-used
  feature) declared with an open `>=4.0.0` range so an SDK-aligned install satisfies it without
  `--legacy-peer-deps`. It MUST remain bundle-isolated to the `/navigation` subpath (FR-001/002)
  so the main entry never forces expo-router resolution. (Decision revised from "optional": all
  OptiCore consumers use navigation.)
- **FR-004**: The public `ApiClient` network API MUST be the enum-based
  `request<T>({ method: HttpMethod, url, data?, headers? })` returning `Promise<ApiResponse<T>>`.
  The verb methods (`get`/`post`/`put`/`delete`/`patch`) MUST remain private/internal; the
  documentation MUST be corrected to use the enum-based `request()` API (docs fix, not an API
  change).
- **FR-005**: `OptiCoreProvider` MUST configure all singletons (`CoreSetup`, `StorageManager`,
  platform adapters, `ConnectivityManager`) synchronously **before** rendering children, so
  child mount effects observe configured services.
- **FR-006**: Provider setup MUST be idempotent across re-renders and React StrictMode
  double-invocation; disposal MUST still run on unmount.
- **FR-007**: `CoreSetup` MUST expose a public `isInitialized()` method for imperative
  (non-React) call sites to check readiness.
- **FR-008**: README and `docs/` MUST be updated to reflect the navigation subpath import and
  the enum-based `apiClient.request({ method: HttpMethod.X, ... })` network API (replacing the
  incorrect `apiClient.get()/post()` examples).
- **FR-009**: Changes MUST preserve existing behavior for expo-router consumers who migrate to
  the `/navigation` subpath import (no behavioral change to `useRouteHelper`).
- **FR-010**: `ApiClient.request()` MUST **fail fast** — throw a clear, actionable error — when
  called before the client is configured (`configure()` / `CoreSetup.init()`), instead of
  silently issuing a request with no baseURL/auth. `ApiClient` MUST also expose
  `isInitialized()` so imperative call sites can guard gracefully. This makes "no service runs
  before setup completes" an enforced guarantee, not just a documented expectation.
- **FR-011**: No consumer MUST need `--legacy-peer-deps` to install OptiCore on an SDK-aligned
  app. REQUIRED peers are `react`, `react-native`, `expo`, `expo-router` — all open `>=` ranges
  any aligned RN+Expo app satisfies. `typescript` MUST be an **optional** peer — it is a
  build-time tool and OptiCore ships its own `.d.ts`, so a TS consumer's typed-coding experience
  is unaffected by its optionality.
- **FR-012**: When an optional native peer is absent and OptiCore falls back to its in-memory
  adapter, it MUST emit a one-time `__DEV__`-only `console.warn` naming the missing peer and the
  install command — never throw, and stay silent in production. Graceful degradation must remain
  visible, not silent.

### Key Entities

- **ApiClient**: network singleton; public API is the enum-based `request()`. Verb methods
  stay private (no API surface change); docs corrected to match.
- **OptiCoreProvider**: React provider; changes setup timing from effect to render-phase.
- **CoreSetup**: configuration singleton; gains `isInitialized()`.
- **navigation subpath**: new public entry point for routing helpers.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A React-Navigation app installs OptiCore with **0** peer-dependency errors and
  **0** uses of `--legacy-peer-deps`.
- **SC-002**: A bundle that imports only from the main entry contains **0** references to
  `expo-router`.
- **SC-003**: `apiClient.request()` type-checks for every `HttpMethod` value in
  `npm run test:types`; docs examples use the enum-based API exclusively.
- **SC-004**: A child component issuing a network call in its first mount effect observes a
  configured client in **100%** of renders (verified by test).
- **SC-005**: `npm run validate` passes (type-check, lint, tests) with ≥80% coverage maintained.
- **SC-006**: No regression for existing expo-router consumers using the `/navigation` subpath.
