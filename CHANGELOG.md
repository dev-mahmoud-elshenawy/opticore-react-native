# 📌 Changelog

All notable changes to this project are documented here. Each release includes details about new features, improvements, bug fixes, and any breaking changes, helping users and developers track the evolution of **OptiCore**.

## 🔄 Versioning Strategy

We follow **Semantic Versioning (SemVer)** to indicate the nature of changes:

- 🚀 **MAJOR**: Breaking changes that may affect compatibility.
- 🌟 **MINOR**: New features or improvements that are backward compatible.
- 🛠 **PATCH**: Bug fixes and minor improvements that are backward compatible.

Each section lists the changes in **chronological order**, with the **most recent release at the top**. Where applicable, links to relevant discussions or issues are provided.

---

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