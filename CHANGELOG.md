# 📌 Changelog

All notable changes to this project are documented here. Each release includes details about new features, improvements, bug fixes, and any breaking changes, helping users and developers track the evolution of **OptiCore**.

## 🔄 Versioning Strategy

We follow **Semantic Versioning (SemVer)** to indicate the nature of changes:

- 🚀 **MAJOR**: Breaking changes that may affect compatibility.
- 🌟 **MINOR**: New features or improvements that are backward compatible.
- 🛠 **PATCH**: Bug fixes and minor improvements that are backward compatible.

Each section lists the changes in **chronological order**, with the **most recent release at the top**. Where applicable, links to relevant discussions or issues are provided.

---

## 🛠 [2.5.0] — Core hardening (round 2)

Another reliability pass from a full core review. Mostly fixes that remove sharp edges; one behavior change to call out below.

### ⚠️ Behavior change

- **Default offline conflict strategy is now `server-wins`** (was `client-wins`). On a sync conflict (409), OptiCore now keeps the **server's** data instead of overwriting it with your queued offline edit — so a stale offline write can't silently clobber a newer server change. If you relied on the old behavior, set `conflictStrategy: 'client-wins'` (or `ConflictStrategy.CLIENT_WINS`) explicitly. Conflict strategies are now exposed as the named `ConflictStrategy` constant.

### 🐞 Fixed

- **Auth tokens no longer leak into logs.** Request logging now redacts `Authorization`/`Cookie` headers (they were being sent to every log transport in full).
- **Offline data-loss fixes:** a queued request that hits repeated conflicts no longer exhausts its network-retry budget and gets dropped; replayed requests now attach a **fresh** auth token instead of the stale one captured when queued; and per-request `maxRetries` is now honored.
- **Secure storage is concurrency-safe** — rapid parallel `set`/`remove` calls no longer drop keys.
- **Validation:** async field validators no longer show a stale result when the value changes mid-check (and no more setState-after-unmount warnings).
- **`useAsyncState`** ignores an earlier in-flight result when a newer call supersedes it (no flicker of stale data).
- **Credit-card masking** caps at 16 digits (a pasted/overlong number no longer renders a broken 5th group).
- **Optional phone validation** (`phone({ required: false })`) now rejects a non-empty invalid number instead of accepting anything.
- **Request timeouts of `0`** ("no timeout") are now honored instead of being ignored.
- **Token-refresh failures** surface the original `401` to your code, not the refresh endpoint's error.
- **Logger `showTimestamp: false`** is now respected.
- **Android startup** no longer fires a spurious "app became active" lifecycle event.

### 🔧 Changed / Added

- **`request()` accepts `params`** (query parameters, properly serialized) and forwards a body on `DELETE`.
- **`useFormState`** now returns `control` and `register` (for `<Controller>` / uncontrolled inputs), and `reset()` accepts RHF's full options (`keepDirty`, `keepErrors`, …).
- **Tree-shaking enabled** (`sideEffects: false`) and a `react-native` export condition added — smaller bundles for apps using subpath imports.
- **Provider setup is idempotent** under React StrictMode; the theme system listener is cleaned up on unmount.

---

## 🛠 [2.4.0] — Core hardening

A reliability release. Everything keeps working as before — these fixes mostly remove sharp edges you may have hit. No changes needed in your app.

### 🐞 Fixed

- **Your production error logs work again.** With `isProduction: true`, your remote/Sentry log transport now receives errors (only noisy device-console logging is silenced in production).
- **Offline requests aren't lost.** Queued requests now reliably save to storage, so closing the app mid-queue no longer drops them.
- **Throttle now throttles.** `useThrottle` fires on the leading edge instead of behaving like a debounce.
- **No more "can't update an unmounted component" warnings** from `useConnectivity`.
- **`useConfig()` warns you** if you forget to wrap your app in `OptiCoreProvider` (instead of silently returning defaults).
- **Dark/light toggle works from system mode.** `toggleMode()` now flips off whatever you're actually showing.
- **Cancelled requests stay quiet.** Aborting a request (e.g. on screen unmount) no longer surfaces a spurious error; request timeouts are detected reliably.
- **Better automatic text-color contrast** from `contrast()` (now WCAG-accurate).
- **Diners Club cards** format correctly (4-6-4).
- **No premature validation errors** on empty fields before the user types.
- **Consistent storage behavior** — saving `null` is rejected on both local and secure storage.

### 🔧 Changed

- **More import paths available**: `opticore-react-native/config`, `/error`, `/infrastructure`, `/providers`, and `/query` now work as direct imports.
- **One `HttpMethod`** — use the `HttpMethod` enum (e.g. `HttpMethod.GET`) everywhere; the old string form (`'GET'`) for `RequestConfig.method` is gone.
- **`logger.clearTransports()` now fully silences the logger** until you add a transport back.
- **`lifecycle.addObserver(...)` returns an unsubscribe function** you can call to remove that observer.
- **`CoreProvider` is deprecated** (still works through v2.x; will be removed in v3.0) — prefer `OptiCoreProvider`.

---

## 🛠 [2.3.0] — Offline conflict fix, single-flight token refresh, request cancellation

### 🐞 Fixed

- **Offline sync now passes real server data to your conflict handler.** With
  `conflictStrategy: 'manual'` (or any merge logic), the `onConflict(local, server)`
  handler was receiving `undefined` for the server value on a `409` conflict, breaking
  manual and merge resolution — it now receives the actual server response. Queued
  request data is also no longer corrupted across conflict retries.

### ✨ Added

- **`ApiClient.request({ signal })`** — pass an `AbortSignal` to cancel an in-flight
  request (e.g. on unmount/navigation). Additive and backward compatible.

### 🔧 Changed

- **Single-flight token refresh** — when several requests hit `401` at once, your token
  refresh (`onTokenRefresh` / a custom `AuthStrategy`) now runs **once** and every request
  retries after it settles, instead of firing a separate refresh per request.
- **Jittered retry backoff for offline sync** — avoids a reconnect stampede when many
  clients come back online at the same time.
- **Documented the storage error contract** — `LocalStorage` / `SecureStorage` reads are
  best-effort (`get()` resolves `null` on miss/failure, never throws); writes are strict
  (`set` / `remove` / `clear` reject on failure).
- **Hook stability notes** for `useConnectivity` and `useFieldValidation` — pass a stable
  (memoized) `adapter` / `validator` to avoid needless re-subscription/re-validation.

---

## 🌟 [2.2.0] — Query/theme helpers, fixes, type guards

### ✨ Added

- **`createQueryHook(keyFn, fetcher, defaults?)`** — build a typed React Query hook from a key factory + fetcher, collapsing the repeated `useQuery({ queryKey, queryFn })` boilerplate.
- **`useApiMutation(mutationFn, options?)`** — `useMutation` wrapper that surfaces a ready-to-display `errorMessage` (via `toMessage`, preferring `RenderError.userMessage`).
- **`createQueryPersister(key?)`** — a React Query persister backed by OptiCore's local storage (structural match for `@tanstack/react-query-persist-client`), to persist/restore the query cache across restarts.
- **`useTextStyle(variant, overrides?)`** — a ready-to-use `<Text>` style for a semantic typography variant, with the theme's text color applied (companion to `useThemedStyles`).

### 🐞 Fixed

- **`theme.typography.*` variants now spread into RN `<Text>` styles without a type error** — `ThemeTextVariant.fontWeight` was typed `string` (not RN's `fontWeight` union), so `style={theme.typography.body}` / `{ ...theme.typography.h2 }` failed to type-check in consumer apps.
- **`QueryProvider` no longer wipes the React Query cache on re-render** when given an inline `config` — the client is now created once (was rebuilt whenever the `config` object identity changed).
- **`useThemedStyles` no longer goes stale** when the style factory closes over props/state — the factory is now a memo dependency.

### 🔧 Changed

- **`opticore-install-peers` now installs `@tanstack/react-query`** as part of the required peers — so `npx opticore-install-peers` (or `--required`) sets up React Query automatically; the manual `expo install @tanstack/react-query` step is no longer required.
- **Public-API type-stability guards** — breaking changes to the exported type surface are now caught before release.

## 🌟 [2.1.0] — Provider-wired React Query, theme-aware styles

### ✨ Added

- **`OptiCoreProvider` now wires React Query for you** — its default client uses `createQueryClient`'s OptiCore-aware defaults (incl. **error-aware retry**), so no second `QueryClientProvider` is needed. Inject a custom client via the new `queryClient` prop, or tune defaults via `config.query`. ([guide](./docs/REACT_QUERY.md#wiring-it-up))
- **`useThemedStyles(factory)`** — theme-aware `StyleSheet`, memoized per theme; recomputes on light↔dark switches and pairs with semantic typography (`...theme.typography.body`). ([guide](./docs/THEME.md#usethemedstyles))

### 🔧 Changed

- `createQueryClient` is now the single source of React Query defaults (adds `gcTime`, `retryDelay`, `refetchOnReconnect`, `refetchOnWindowFocus: false`, mutation retry). `QueryProvider` builds its default client from it — so the **default query retry is now error-aware** (skips actionable 4xx) instead of a blind 3 retries.

## 🚀 [2.0.0] — Semantic theming, React Query integration, leaner deps

> Upgrading from 1.x? See **[MIGRATION_v2.md](./MIGRATION_v2.md)**.

### 💥 Breaking

- `@tanstack/react-query` is now a required **peer** (`>=5`), no longer bundled — run `expo install @tanstack/react-query`.
- `ThemeTypography` gained nine required semantic-variant fields; only **full** custom `Theme` literals need updating (spread overrides are unaffected).

### ✨ Added

- **Semantic typography** — `theme.typography.body` / `h1` / `caption` / … as `ThemeTextVariant` style objects. ([guide](./docs/THEME.md))
- **React Query** — `createQueryClient()` with OptiCore-aware defaults + error-aware retry. ([guide](./docs/REACT_QUERY.md))
- **Tailwind/NativeWind preset** — `createTailwindPreset` now emits `text-body` / `text-h1` / … classes; `nativewind` + `tailwindcss` added as optional peers. ([guide](./docs/TAILWIND.md))
- **Store persistence** — `StoreConfig.persist` / `partialize` and `createPersistStorage()`. ([state docs](./docs/api/STATE.md#persistence))
- **`toMessage(error, fallback?)`** — user-facing message from any thrown value. ([errors docs](./docs/api/ERRORS.md))
- **`buildUrl(path, params?)`** — encoded query-string builder. ([utils docs](./docs/api/UTILITIES.md#url-utilities))
- **`ApiResult<T>`** — generic API response-body envelope. ([types docs](./docs/TYPES.md))

### 🔧 Changed

- `withOptiCoreMetroConfig` now also pins `@tanstack/react-query` / `@tanstack/query-core` to a single instance for `file:`/monorepo setups.

## 🌟 [1.2.0] — Consumer integration fixes

### 💥 Breaking

- **Navigation moved to a subpath.** Import `useRouteHelper` / `NavigationParams` from `opticore-react-native/navigation` (no longer the main entry) — this keeps `expo-router` out of the main bundle.

### 🔧 Fixed

- **No `--legacy-peer-deps` needed** on SDK-aligned installs. Required peers (`react`, `react-native`, `expo`, `expo-router`) use open `>=` ranges; `typescript` is now an **optional** peer (OptiCore ships its own `.d.ts`, so typed coding is unaffected). Also fixes the Metro build break for non-expo-router apps.
- **Init ordering** — `OptiCoreProvider` now configures singletons synchronously *before children render* (was in `useEffect`, which let an early API call hit an unconfigured client).
- **`ApiClient.request()` fails fast** with a clear error if called before `configure()` / `CoreSetup.init()`, instead of silently using axios defaults.
- **`opticore-install-peers` on Windows** no longer fails with `exit null`; the CLI also surfaces the real underlying error.

### ✨ Added

- `CoreSetup.isInitialized()` / `ApiClient.isInitialized()` for imperative readiness guards.
- One-time `__DEV__` warning when a missing optional native peer triggers the in-memory fallback (never throws; silent in production).
- `opticore-install-peers <name…>` installs specific peers (validated); `--required` / `--optional` / default still work.

### 📝 Docs

- Network examples use the enum API `apiClient.request({ method: HttpMethod.X, url })` (verb methods are private). Added an "optional native peers" table; navigation docs updated for the subpath + required `expo-router`. Documented `withOptiCoreMetroConfig` (monorepo / `file:` linking only — not needed for normal installs).

### 🧰 Internal

- Dev/test toolchain pinned to Expo SDK 54 (react 19.1, react-native 0.81, expo 54.0.32, expo-router 6.0).

---

## 🛠 [1.1.1] — Fix documentation links

### 🔧 Changed

- README doc links converted from absolute GitHub branch URLs to relative paths — links now resolve correctly on any branch, tag, or npm package page.

---

## 🔌 [1.1.0] — Dynamic adapter system, optional native peers

Native modules were pinned `dependencies` in `1.0.0`, causing cross-SDK crashes (`ClassNotFoundException: AnyTypeProvider`). `1.1.0` makes them optional peers resolved at runtime through adapters.

### ✨ Added

- **Adapter system** (`/adapters`) — `SecureStorage`, `LocalStorage`, `Connectivity`, `Device`, `Clipboard` interfaces with a resolver chain: **override → Expo module → bare peer → memory**.
- **`OptiCoreProvider config.adapters`** — inject custom adapters (MMKV, Keychain, Jest doubles) without forking.
- **Expo Go-safe** — `nativeModulePresent()` / `loadOptionalNativeModule()` probe before `require()`, so importing OptiCore never red-boxes in Expo Go.
- Platform utils: `getDeviceModel()`, `getUniqueDeviceId()`, `configurePlatformAdapters()`.
- `npx opticore-install-peers` CLI + `withOptiCoreMetroConfig` Metro helper.

### 🔧 Changed

- Native modules moved `dependencies → peerDependencies` (all optional); `expo-modules-core` no longer pinned.
- Peer ranges widened (`expo >=54`, `react >=19`, `react-native >=0.78`) — SDK 54/55/56+ all work.
- `StorageManager.configure()`, `ConnectivityManager.configure()`, and `useConnectivity(adapter?)` added for runtime adapter swaps.

### ⚠️ Breaking

- Native peers are no longer installed transitively — run `npx opticore-install-peers` after upgrading.
- All native access now flows through adapters (no direct top-level `import`s).

→ See [`MIGRATION_v1.1.md`](./MIGRATION_v1.1.md) for the step-by-step upgrade.

---

## 🎉 [1.0.0]

Initial release of **OptiCore React Native**.

Infrastructure · State · Errors · Hooks · Forms · Offline Sync · Theme · Navigation · Utilities — all covered.

→ See the [full documentation](./docs/INDEX.md) for details.

---

Stay updated with the latest enhancements and fixes! 🚀