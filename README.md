# ⚡ OptiCore React Native

**The Ultimate Infrastructure Library for React Native & Expo**

OptiCore is a **TypeScript-first**, production-ready infrastructure layer that eliminates boilerplate and accelerates development. One library. Every layer covered.

[![npm version](https://img.shields.io/npm/v/opticore-react-native?color=blue&label=npm)](https://www.npmjs.com/package/opticore-react-native)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.78+-61DAFB)](https://reactnative.dev/)
[![Tests](https://img.shields.io/badge/Tests-604%20passing-brightgreen)](./docs/Testing.md)
[![Coverage](https://img.shields.io/badge/Coverage-83%25+-brightgreen)](./docs/Testing.md)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)
[![Build](https://img.shields.io/badge/Build-Passing-teal)]()

<a href="https://www.buymeacoffee.com/m.elshenawy" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="40" width="175">
</a>

---

## 🔥 Why OptiCore?

✅ **Zero Boilerplate** — ApiClient, Logger, Storage, State — all wired up in minutes
✅ **Type-Safe by Design** — Strict TypeScript with zero `any` tolerance
✅ **Offline-First Ready** — Built-in queue, sync engine, and conflict resolution
✅ **Extensible Architecture** — Interceptors, auth strategies, pluggable log transports
✅ **11 Custom Hooks** — Async state, debounce, keyboard, network, performance & more
✅ **Form Infrastructure** — Zod + React Hook Form with masks, validation, and i18n
✅ **Theme Engine** — Dynamic theming with dark mode, spacing, typography & shadows
✅ **604 Tests Passing** — Battle-tested, production-grade quality

---

## 📦 Installation

```bash
npm install opticore-react-native
# or
yarn add opticore-react-native
```

### Peer Dependencies

```bash
npm install react react-native expo expo-router @tanstack/react-query zustand axios
```

---

## 🚀 Quick Start

```typescript
// 1. Wrap your app
import { OptiCoreProvider } from 'opticore-react-native';

export default function App() {
  return (
    <OptiCoreProvider config={{ api: { baseURL: 'https://api.example.com' } }}>
      <YourApp />
    </OptiCoreProvider>
  );
}
```

```typescript
// 2. Make API calls
import { ApiClient } from 'opticore-react-native';

const users = await ApiClient.getInstance().get<User[]>('/users');
```

```typescript
// 3. Async state in components
import { useAsyncState } from 'opticore-react-native/hooks';

const { data, isLoading, error, run } = useAsyncState(fetchUsers);
```

```typescript
// 4. Secure storage
import { StorageManager } from 'opticore-react-native';

await StorageManager.getInstance().secure.set('token', 'abc123');
const token = await StorageManager.getInstance().secure.get('token');
```

---

## 📖 Documentation

| Guide | Description |
|---|---|
| 🏗 **[Infrastructure](./docs/api/Infrastructure.md)** | ApiClient, Logger, Storage, Connectivity, Lifecycle |
| 🗄 **[State Management](./docs/api/State.md)** | Zustand stores, AsyncState, StoreFactory, observers |
| 🪝 **[Hooks](./docs/api/Hooks.md)** | 11 custom hooks — async, device, performance, forms |
| ⚠️ **[Error Handling](./docs/api/Errors.md)** | RenderError, NonRenderError, Result<T,E>, ErrorBoundary |
| 🛠 **[Utilities](./docs/api/Utilities.md)** | 40+ pure functions — string, number, array, date, object |
| 🎨 **[Theme Engine](./docs/THEME.md)** | Dynamic themes, dark mode, typography, shadows |
| 📋 **[Forms](./docs/FORMS.md)** | Validation, masks, i18n errors, React Hook Form |
| 📡 **[Offline Sync](./docs/OFFLINE.md)** | Queue engine, sync strategies, conflict resolution |
| ⚙️ **[Configuration](./docs/Configuration.md)** | Full config reference and setup options |
| 🧪 **[Testing](./docs/Testing.md)** | Mock helpers, test patterns, coverage guide |
| 🚀 **[Quick Start](./docs/QuickStart.md)** | Step-by-step integration walkthrough |
| ❓ **[FAQ](./docs/Faq.md)** | Common questions and troubleshooting |

---

## 🏛 What's Inside

```
opticore-react-native/
├── infrastructure/   ApiClient · Logger · StorageManager · ConnectivityManager
├── state/            BaseStore · StoreFactory · AsyncState · StateObserver
├── error/            RenderError · NonRenderError · Result<T,E> · ErrorBoundary
├── hooks/            useAsync · useDebounce · useNetworkStatus · useKeyboard · +7
├── forms/            useFormState · masks · Zod validation · i18n errors
├── offline/          OfflineSyncManager · useOfflineSync · conflict resolution
├── theme/            ThemeManager · useTheme · dark mode · dynamic scaling
├── providers/        OptiCoreProvider · QueryProvider
└── utils/            string · number · array · date · object · format · platform
```

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

Made with ❤️ by **Mahmoud El Shenawy**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?logo=linkedin)](https://www.linkedin.com/in/dev-mahmoud-elshenawy)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?logo=github)](https://github.com/dev-mahmoud-elshenawy)
[![Medium](https://img.shields.io/badge/Medium-Read-000000?logo=medium)](https://medium.com/@dev-mahmoud-elshenawy)

📜 **License:** MIT — See [LICENSE](./LICENSE)
