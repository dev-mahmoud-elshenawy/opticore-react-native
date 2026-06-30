# ⚡ OptiCore React Native

**The Ultimate Infrastructure Library for React Native & Expo**

OptiCore is a **TypeScript-first**, production-ready infrastructure layer that eliminates boilerplate and accelerates development. One library. Every layer covered.

[![npm version](https://img.shields.io/npm/v/opticore-react-native?color=blue&label=npm)](https://www.npmjs.com/package/opticore-react-native)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.78+-61DAFB)](https://reactnative.dev/)
[![Tests](https://img.shields.io/badge/Tests-647%20passing-brightgreen)](docs/TESTING.md)
[![Coverage](https://img.shields.io/badge/Coverage-89%25+-brightgreen)](docs/TESTING.md)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Build](https://img.shields.io/badge/Build-Passing-teal)]()

<a href="https://www.buymeacoffee.com/m.elshenawy">
  <img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support%20My%20Work-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=0D1117" alt="Buy Me A Coffee"/>
</a>

---

## 🔥 Why OptiCore?

- **Zero Boilerplate** — ApiClient, Logger, Storage, State — all wired up in minutes

- **Type-Safe by Design** — Strict TypeScript with zero `any` tolerance

- **Offline-First Ready** — Built-in queue, sync engine, and conflict resolution

- **Extensible Architecture** — Interceptors, auth strategies, pluggable log transports

- **11 Custom Hooks** — Async state, debounce, keyboard, network, performance & more

- **Form Infrastructure** — Zod + React Hook Form with masks, validation, and i18n

- **Theme Engine** — Dynamic theming with dark mode, spacing, typography & shadows

- **Test-Ready** — Ship-in helpers (`createMemoryAdapters`, `resetOptiCore`) to mock OptiCore in your app's tests — no native modules, no hand-rolling

- **760 Tests Passing** — Battle-tested, production-grade quality

---

## 📦 Installation

```bash
npm install opticore-react-native
npx opticore-install-peers            # installs all peers, including React Query
```

> **v2.0.0**: `@tanstack/react-query` is now a **required peer** (no longer bundled). `npx opticore-install-peers` installs it for you (or `npx expo install @tanstack/react-query` manually). Theme typography also gained semantic variants (`theme.typography.body`…). See [`MIGRATION_v2.md`](MIGRATION_v2.md) for the upgrade.
>
> **v1.1.0**: native modules are now **peer dependencies** managed by your app's Expo SDK — not pinned by OptiCore. This eliminates the SDK-version crashes that affected `1.0.0` (`AnyTypeProvider`, duplicate `expo-modules-core`, etc.). See [`MIGRATION_v1.1.md`](MIGRATION_v1.1.md) for the upgrade.

### Peer Dependencies — one command

OptiCore ships a tiny CLI that installs every peer in one shot, using `expo install` to pick versions that match your Expo SDK:

```bash
npx opticore-install-peers
```

That installs the **required** peers (storage, connectivity, **React Query**) plus the optional Expo modules (clipboard, device). For finer control:

```bash
npx opticore-install-peers --required          # storage + network + React Query
npx opticore-install-peers --optional          # clipboard + device only
npx opticore-install-peers @tanstack/react-query  # only the named peer(s)
npx opticore-install-peers expo-device expo-clipboard
npx opticore-install-peers --dry-run           # show the command without running
```

Named peers are validated; an unknown name prints the list of installable peers.

Behind the scenes it detects Expo / Yarn / pnpm / npm and runs the right tool. Prefer to run the bundled installer script directly (same flags):

```bash
node node_modules/opticore-react-native/bin/install-peers.mjs            # required + optional
node node_modules/opticore-react-native/bin/install-peers.mjs --dry-run  # print the command only
```

> **Bare React Native (no Expo Go)?** The clipboard/device adapters also accept the
> bare peers `@react-native-clipboard/clipboard` and `react-native-device-info` as a
> fallback — but they only work in a custom dev build, not in Expo Go.

Any optional native peer you skip falls back to an **in-memory adapter** at runtime — useful for tests and SSR, never a substitute for real native storage in production. If you'd rather inject a custom adapter (MMKV, Keychain, a JS-only stub), see [Custom Adapters](#-custom-adapters) below.

### Optional native peers — what each is for

These are the peers `opticore-install-peers` manages. Every one is **optional** — skip any and OptiCore falls back to an in-memory implementation and logs a one-time `__DEV__` warning naming what to install. Nothing throws.

| Peer                                                                 | Enables                                       | If you don't install it                             |
| -------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------- |
| `expo-secure-store`                                                  | `StorageManager.secure` (Keychain / Keystore) | In-memory fallback — **not persistent, not secure** |
| `@react-native-async-storage/async-storage`                          | `StorageManager.local`                        | In-memory fallback — not persistent                 |
| `@react-native-community/netinfo`                                    | `ConnectivityManager`, `useConnectivity`      | In-memory fallback (assumes online)                 |
| `expo-clipboard` _(or `@react-native-clipboard/clipboard`)_          | Clipboard utilities                           | In-memory fallback                                  |
| `expo-device` + `expo-application` _(or `react-native-device-info`)_ | Device / app info                             | In-memory fallback (default values)                 |

> **Why optional?** Native modules are feature-gated — your app installs only what it uses, and OptiCore resolves the backend at runtime (consumer override → installed peer → in-memory fallback). The dev warning means a missing peer is never a _silent_ surprise.
>
> Two peers sit **outside** this CLI: `typescript` (optional — OptiCore ships its own `.d.ts`, so skipping it has no effect) and `expo-router` (required, install it with your navigation setup — only needed for the `opticore-react-native/navigation` subpath).

### Monorepo or local (`file:`) linking only — Metro config

**Normal npm install? Skip this.** A standard `npm install opticore-react-native` needs no Metro changes — `react`/`react-native` are peer deps, so there's only one copy.

In a **monorepo** or when consuming OptiCore via a **`file:` link** (e.g. local testing), the package's own `react` can get duplicated, causing the classic _"Invalid hook call"_. Wrap your Metro config to force React (and peer deps) to resolve from your app:

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withOptiCoreMetroConfig } = require('opticore-react-native/metro');

const config = getDefaultConfig(__dirname);
module.exports = withOptiCoreMetroConfig(config, __dirname);
```

> Tip: to test like a real consumer (no Metro tweak), install the packed tarball — `npm pack` then `npm install ../opticore-react-native-<version>.tgz` — instead of a `file:` link.

---

## 🚀 Quick Start

**Step 1 — Wrap your app root**

```typescript
import { OptiCoreProvider, LogLevel } from 'opticore-react-native';
import { StorageManager } from 'opticore-react-native';

export default function RootLayout() {
  return (
    <OptiCoreProvider
      config={{
        api: {
          baseURL: 'https://api.example.com',
          getAuthToken: () => storage.secure.get<string>('token'),
          onTokenRefresh: async () => {
            const newToken = await refreshToken();
            await storage.secure.set('token', newToken);
            return newToken;
          },
        },
        logger: { level: __DEV__ ? LogLevel.DEBUG : LogLevel.WARN },
        theme: { defaultMode: 'system' },
        offline: { syncOnReconnect: true },
        features: { debugMode: __DEV__ },
      }}
    >
      <Stack />
    </OptiCoreProvider>
  );
}
```

> `OptiCoreProvider` initializes all singletons, sets up React Query, wires theming, and handles cleanup — no extra setup needed.
>
> **This is the one setup path.** `CoreSetup.init()` is the internal step the provider
> calls for you; don't call it directly unless you're doing advanced/manual setup.

**Step 2 — Start using the library**

Use the **facades** (`api`, `storage`, `logger`) — no `.getInstance()`, no `HttpMethod` enum. The HTTP verbs return the **response body** directly:

```typescript
import { api, storage, logger } from 'opticore-react-native';
import { useAsyncState } from 'opticore-react-native/hooks';

// HTTP — verbs return the body (T) directly; auth token injected automatically.
const users = await api.get<User[]>('/users'); // User[]
const me = await api.get<User>('/users/me'); // User
const created = await api.post<Created>('/users', { name: 'Ali' });
await api.delete('/users/1');

// Storage — automatic JSON serialization
await storage.local.set('user', { id: 1, name: 'Ali' });

// Logging — level-filtered, transport-ready
logger.info('App ready', { userId: '123' });

// Async state in components
const { data, isLoading, error, run } = useAsyncState<User[]>();
run(() => api.get<User[]>('/users'));
```

> **One approach: `api.*`.** The verbs are the whole HTTP API. If you need to
> inspect `status`/`headers`, add a response interceptor:
> `api.onResponse(r => { console.log(r.status, r.headers); return r; })`.

**Where to import from**

| Symbol                                                                                                            | Import from                                                       |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Facades** — `api`, `storage`, `logger`, `connectivity`, `offline`, `themeControl`, `lifecycle`, `stateObserver` | `opticore-react-native` (root) or `…/facades`                     |
| `ApiClient`, `StorageManager`, `Logger`, `HttpMethod`                                                             | `opticore-react-native` (root) or `…/infrastructure`              |
| `OptiCoreProvider`, `useConfig`                                                                                   | `opticore-react-native` (root) or `…/providers`                   |
| Hooks (`useAsyncState`, …)                                                                                        | `opticore-react-native` (root) or `…/hooks`                       |
| Errors (`RenderError`, `Result`, `OptiCoreErrorBoundary`)                                                         | `opticore-react-native` (root) or `…/error`                       |
| `useRouteHelper`, `NavigationParams`                                                                              | **`opticore-react-native/navigation` only** (not the root barrel) |
| `createMemoryAdapters`, `resetOptiCore` (test helpers)                                                            | **`opticore-react-native/testing` only** (not the root barrel)    |
| Utilities · forms · theme · offline · state · query                                                               | root or the matching subpath                                      |

→ **[Full setup guide](docs/QUICK_START.md)** — auth, error handling, offline sync, theming and more.

---

## 🔌 Custom Adapters

OptiCore's native dependencies are accessed through **adapter interfaces**. The defaults auto-resolve the popular peers when installed; you can override any of them. Each capability prefers an **Expo module** (which ships inside Expo Go), then falls back to the bare React Native peer, then to an in-memory stub:

| Capability     | Preferred (Expo Go-safe)             | Fallback peer                               | Last resort |
| -------------- | ------------------------------------ | ------------------------------------------- | ----------- |
| Secure storage | `expo-secure-store`                  | —                                           | in-memory   |
| Local storage  | —                                    | `@react-native-async-storage/async-storage` | in-memory   |
| Connectivity   | —                                    | `@react-native-community/netinfo`           | in-memory   |
| Device info    | `expo-device` (+ `expo-application`) | `react-native-device-info`                  | in-memory   |
| Clipboard      | `expo-clipboard`                     | `@react-native-clipboard/clipboard`         | in-memory   |

### Why this matters

- **No SDK pinning** — your Expo SDK picks the native module versions, not OptiCore.
- **Plug in any backend** — MMKV for fast storage, Keychain for hardened secure storage, custom NetInfo for WebSocket-based reachability.
- **Works in unit tests + SSR** — missing peers degrade to in-memory adapters instead of crashing.
- **Works in Expo Go — even when bare native libs are installed.** See below.

### Example: MMKV for local storage

```ts
import { MMKV } from 'react-native-mmkv';
import {
  OptiCoreProvider,
  type LocalStorageAdapter,
} from 'opticore-react-native';

const mmkv = new MMKV();

const mmkvAdapter: LocalStorageAdapter = {
  setItem:    async (k, v) => { mmkv.set(k, v); },
  getItem:    async (k)    => mmkv.getString(k) ?? null,
  removeItem: async (k)    => { mmkv.delete(k); },
  clear:      async ()     => { mmkv.clearAll(); },
};

<OptiCoreProvider
  config={{
    api: { baseURL: 'https://api.example.com' },
    adapters: { localStorage: mmkvAdapter },
  }}>
  <App />
</OptiCoreProvider>;
```

### Available interfaces

```ts
import type {
  SecureStorageAdapter,
  LocalStorageAdapter,
  ConnectivityAdapter,
  ConnectivitySnapshot,
  DeviceAdapter,
  ClipboardAdapter,
  OptiCoreAdapters,
} from 'opticore-react-native';
```

Pass any subset via `config.adapters`. Anything you don't pass auto-resolves through the **override → Expo module → bare peer → memory** chain.

### Expo Go compatibility (even with native libs installed)

Bare React Native native libs (`@react-native-clipboard/clipboard`, `react-native-device-info`, `@react-native-community/netinfo`, …) call `TurboModuleRegistry.getEnforcing(...)` **at import time**. In Expo Go the native code isn't in the binary, so that call throws and surfaces as a red box — _just by importing the lib_, before you ever call it.

OptiCore avoids this by **probing the native registry without throwing** and only importing a bare peer when its native module is actually in the running binary. So OptiCore runs in Expo Go regardless of which native libs your `package.json` lists — clipboard/device/connectivity transparently use the Expo module or the in-memory fallback, and switch to full native functionality automatically in a development build.

The same guard is exported for **your own** native dependencies:

```ts
import { nativeModulePresent, loadOptionalNativeModule } from 'opticore-react-native';

// Boolean probe — never throws, works for any native module name.
if (nativeModulePresent('RNHaptic')) {
  /* safe to use react-native-haptic-feedback */
}

// Probe + load in one step; returns null in Expo Go instead of throwing.
const haptics = loadOptionalNativeModule(
  'RNHaptic',
  () => require('react-native-haptic-feedback').default
);
haptics?.trigger('impactLight'); // no-op in Expo Go, real haptics in a dev build
```

---

## 📖 Documentation

### Getting Started

| Guide                                         | Description                                                      |
| --------------------------------------------- | ---------------------------------------------------------------- |
| 🚀 **[Quick Start](docs/QUICK_START.md)**     | Install, configure, and make your first API call in 10 minutes   |
| 🏛 **[Architecture](docs/ARCHITECTURE.md)**   | Library layers, data flow, design patterns, and extension points |
| ⚙️ **[Configuration](docs/CONFIGURATION.md)** | Every `CoreConfig` option explained with examples                |
| 📑 **[Full Docs Index](docs/INDEX.md)**       | Central navigation hub for all documentation                     |
| 📱 **[Example App](https://github.com/dev-mahmoud-elshenawy/opticore-news-demo)** | OptiCore News — a full reference app built on OptiCore |

### API Reference

| Guide                                                              | Description                                                                                 |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| 🏗 **[Infrastructure](docs/api/INFRASTRUCTURE.md)**                | ApiClient, Logger, StorageManager, ConnectivityManager, LifecycleManager                    |
| 🗄 **[State Management](docs/api/STATE.md)**                       | AsyncState, BaseStore, CrudStore, ClientStore, StoreFactory, StateObserver                  |
| 🪝 **[Hooks](docs/api/HOOKS.md)**                                  | 11 custom hooks — useAsyncState, useDebounce, useKeyboard, useConnectivity & more           |
| ⚠️ **[Error Handling — Which Tool, When](docs/ERROR_HANDLING.md)** | Decision tree: `Result` vs throw `RenderError` vs `ApiError` vs `NonRenderError`            |
| ⚠️ **[Error Handling API](docs/api/ERRORS.md)**                    | RenderError, NonRenderError, ApiError, Result\<T,E\>, ErrorBoundary                         |
| 🛠 **[Utilities](docs/api/UTILITIES.md)**                          | 40+ pure functions — string, number, array, date, object, format, color, platform           |
| 🧭 **[Navigation](docs/api/NAVIGATION.md)**                        | useRouteHelper, Expo Router integration                                                     |
| 🔁 **[React Query](docs/REACT_QUERY.md)**                          | createQueryClient, createQueryHook, useApiMutation, createQueryPersister, error-aware retry |
| 🔷 **[Types](docs/TYPES.md)**                                      | All shared TypeScript types — ApiResponse, ApiResult, AsyncState, PaginatedResponse & more  |

### Feature Guides

| Guide                                            | Description                                                                                  |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| 🎨 **[Theme Engine](docs/THEME.md)**             | Dynamic theming, dark mode, semantic typography, useThemedStyles, useTextStyle, ThemeManager |
| 🌬 **[Tailwind / NativeWind](docs/TAILWIND.md)** | createTailwindPreset — theme-driven `className` tokens (`text-body`, `bg-card`)              |
| 📋 **[Forms](docs/FORMS.md)**                    | useFormState, Zod validation, input masks, field-level validation                            |
| 📡 **[Offline Sync](docs/OFFLINE.md)**           | Request queue, auto-sync on reconnect, conflict resolution                                   |

### Project Guides

| Guide                                 | Description                                                      |
| ------------------------------------- | ---------------------------------------------------------------- |
| 🔄 **[Migration](docs/MIGRATION.md)** | Migrate from Redux, MobX, plain Axios, AsyncStorage, console.log |
| 🧪 **[Testing](docs/TESTING.md)**     | Mock helpers, test patterns, coverage requirements               |
| ❓ **[FAQ](docs/FAQ.md)**             | Common questions, troubleshooting, platform notes                |

---

## ❗ Issues & Contributions

Found a bug or want a feature? Open an issue on **[GitHub Issues](https://github.com/dev-mahmoud-elshenawy/opticore-react-native/issues)**.

Please include:

- Clear description of the issue
- Steps to reproduce
- OptiCore version
- Relevant code snippets

Contributions are welcome — check the **[Contributing Guide](CONTRIBUTING.md)**.

---

## 📜 Changelog

See **[CHANGELOG.md](CHANGELOG.md)** for release history and migration notes.

---

## 👤 Created By

<div align="center">

### Built with ❤️ by [Mahmoud El Shenawy](https://github.com/dev-mahmoud-elshenawy)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?logo=linkedin&logoColor=white&style=for-the-badge)](https://www.linkedin.com/in/dev-mahmoud-elshenawy)
[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white&style=for-the-badge)](https://github.com/dev-mahmoud-elshenawy)
[![Medium](https://img.shields.io/badge/Medium-000000?logo=medium&logoColor=white&style=for-the-badge)](https://medium.com/@dev-mahmoud-elshenawy)
[![Facebook](https://img.shields.io/badge/Facebook-1877F2?logo=facebook&logoColor=white&style=for-the-badge)](https://www.facebook.com/dev.m.elshenawy)

</div>

---

## 📜 License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**OptiCore React Native** is open-source software released under the **[MIT License](LICENSE)**.

Free to use, modify, and distribute — in personal and commercial projects.
