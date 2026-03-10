# ⚡ OptiCore React Native

**The Ultimate Infrastructure Library for React Native & Expo**

OptiCore is a **TypeScript-first**, production-ready infrastructure layer that eliminates boilerplate and accelerates development. One library. Every layer covered.

[![npm version](https://img.shields.io/npm/v/opticore-react-native?color=blue&label=npm)](https://www.npmjs.com/package/opticore-react-native)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.78+-61DAFB)](https://reactnative.dev/)
[![Tests](https://img.shields.io/badge/Tests-647%20passing-brightgreen)](./docs/TESTING.md)
[![Coverage](https://img.shields.io/badge/Coverage-89%25+-brightgreen)](./docs/TESTING.md)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)
[![Build](https://img.shields.io/badge/Build-Passing-teal)]()

<a href="https://www.buymeacoffee.com/m.elshenawy" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="40" width="175">
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

- **647 Tests Passing** — Battle-tested, production-grade quality

---

## 📦 Installation

```bash
npm install opticore-react-native
# or
yarn add opticore-react-native
```

### Peer Dependencies

Install all peer dependencies with one command:

```bash
npx install-peerdeps opticore-react-native
```

> This uses [`install-peerdeps`](https://www.npmjs.com/package/install-peerdeps) to automatically resolve and install the correct versions of all required peer dependencies.

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
          getAuthToken: () => StorageManager.getInstance().secure.get<string>('token'),
          onTokenRefresh: async () => {
            const newToken = await refreshToken();
            await StorageManager.getInstance().secure.set('token', newToken);
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

**Step 2 — Start using the library**

```typescript
import { ApiClient, StorageManager, Logger } from 'opticore-react-native';
import { useAsyncState } from 'opticore-react-native/hooks';

// HTTP requests — auth token injected automatically
const { data } = await ApiClient.getInstance().get<User[]>('/users');

// Storage — automatic JSON serialization
await StorageManager.getInstance().local.set('user', { id: 1, name: 'Ali' });

// Logging — level-filtered, transport-ready
Logger.getInstance().info('App ready', { userId: '123' });

// Async state in components
const { data: users, isLoading, error, run } = useAsyncState<User[]>();
run(() => ApiClient.getInstance().get<User[]>('/users').then(r => r.data));
```

→ **[Full setup guide](./docs/QUICK_START.md)** — auth, error handling, offline sync, theming and more.

---

## 📖 Documentation

### Getting Started

| Guide | Description |
|---|---|
| 🚀 **[Quick Start](./docs/QUICK_START.md)** | Install, configure, and make your first API call in 10 minutes |
| 🏛 **[Architecture](./docs/ARCHITECTURE.md)** | Library layers, data flow, design patterns, and extension points |
| ⚙️ **[Configuration](./docs/CONFIGURATION.md)** | Every `CoreConfig` option explained with examples |
| 📑 **[Full Docs Index](./docs/INDEX.md)** | Central navigation hub for all documentation |

### API Reference

| Guide | Description |
|---|---|
| 🏗 **[Infrastructure](./docs/api/INFRASTRUCTURE.md)** | ApiClient, Logger, StorageManager, ConnectivityManager, LifecycleManager |
| 🗄 **[State Management](./docs/api/STATE.md)** | AsyncState, BaseStore, CrudStore, StoreFactory, StateObserver |
| 🪝 **[Hooks](./docs/api/HOOKS.md)** | 11 custom hooks — useAsyncState, useDebounce, useKeyboard, useConnectivity & more |
| ⚠️ **[Error Handling](./docs/api/ERRORS.md)** | RenderError, NonRenderError, ApiError, Result\<T,E\>, ErrorBoundary |
| 🛠 **[Utilities](./docs/api/UTILITIES.md)** | 40+ pure functions — string, number, array, date, object, format, color, platform |
| 🧭 **[Navigation](./docs/api/NAVIGATION.md)** | useRouteHelper, Expo Router integration |
| 🔷 **[Types](./docs/TYPES.md)** | All shared TypeScript types — ApiResponse, AsyncState, PaginatedResponse & more |

### Feature Guides

| Guide | Description |
|---|---|
| 🎨 **[Theme Engine](./docs/THEME.md)** | Dynamic theming, dark mode, custom themes, ThemeManager |
| 📋 **[Forms](./docs/FORMS.md)** | useFormState, Zod validation, input masks, field-level validation |
| 📡 **[Offline Sync](./docs/OFFLINE.md)** | Request queue, auto-sync on reconnect, conflict resolution |

### Project Guides

| Guide | Description |
|---|---|
| 🔄 **[Migration](./docs/MIGRATION.md)** | Migrate from Redux, MobX, plain Axios, AsyncStorage, console.log |
| 🧪 **[Testing](./docs/TESTING.md)** | Mock helpers, test patterns, coverage requirements |
| ❓ **[FAQ](./docs/FAQ.md)** | Common questions, troubleshooting, platform notes |

---

## ❗ Issues & Contributions

Found a bug or want a feature? Open an issue on **[GitHub Issues](https://github.com/dev-mahmoud-elshenawy/opticore-react-native/issues)**.

Please include:
- Clear description of the issue
- Steps to reproduce
- OptiCore version
- Relevant code snippets

Contributions are welcome — check the **[Contributing Guide](./CONTRIBUTING.md)**.

---

## 📜 Changelog

See **[CHANGELOG.md](./CHANGELOG.md)** for release history and migration notes.

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

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

**OptiCore React Native** is open-source software released under the **[MIT License](./LICENSE)**.

Free to use, modify, and distribute — in personal and commercial projects.
