# 📌 Changelog

All notable changes to this project are documented here. Each release includes details about new features, improvements, bug fixes, and any breaking changes, helping users and developers track the evolution of **OptiCore**.

## 🔄 Versioning Strategy

We follow **Semantic Versioning (SemVer)** to indicate the nature of changes:

- 🚀 **MAJOR**: Breaking changes that may affect compatibility.
- 🌟 **MINOR**: New features or improvements that are backward compatible.
- 🛠 **PATCH**: Bug fixes and minor improvements that are backward compatible.

Each section lists the changes in **chronological order**, with the **most recent release at the top**. Where applicable, links to relevant discussions or issues are provided.

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