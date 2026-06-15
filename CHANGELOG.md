# 📌 Changelog

All notable changes to this project are documented here. Each release includes details about new features, improvements, bug fixes, and any breaking changes, helping users and developers track the evolution of **OptiCore**.

## 🔄 Versioning Strategy

We follow **Semantic Versioning (SemVer)** to indicate the nature of changes:

- 🚀 **MAJOR**: Breaking changes that may affect compatibility.
- 🌟 **MINOR**: New features or improvements that are backward compatible.
- 🛠 **PATCH**: Bug fixes and minor improvements that are backward compatible.

Each section lists the changes in **chronological order**, with the **most recent release at the top**. Where applicable, links to relevant discussions or issues are provided.

---

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
- **`opticore-install-peers` on Windows** no longer fails with `exit null` (`spawnSync` now uses `shell: true`); the CLI also surfaces the real spawn error.

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

- README doc links converted from absolute branch URLs (`/blob/develop/`) to relative paths — links now resolve correctly on any branch, tag, or npm package page.

---

## 🔌 [1.1.0] — Dynamic adapter system, optional native peers

Native modules were pinned `dependencies` in `1.0.0`, causing cross-SDK crashes (`ClassNotFoundException: AnyTypeProvider`). `1.1.0` makes them optional peers resolved at runtime through adapters.

### ✨ Added

- **Adapter system** (`/adapters`) — `SecureStorage`, `LocalStorage`, `Connectivity`, `Device`, `Clipboard` interfaces with a resolver chain: **override → Expo module → bare peer → memory**.
- **`OptiCoreProvider config.adapters`** — inject custom adapters (MMKV, Keychain, Jest doubles) without forking.
- **Expo Go-safe** — `nativeModulePresent()` / `loadOptionalNativeModule()` probe before `require()`, so importing OptiCore never red-boxes in Expo Go.
- Platform utils: `getDeviceModel()`, `getUniqueDeviceId()`, `configurePlatformAdapters()`.
- `npx opticore-install-peers` CLI (`bin/install-peers.mjs`) + `withOptiCoreMetroConfig` Metro helper.

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