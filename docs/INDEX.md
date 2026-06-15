# OptiCore React Native — Documentation Hub

Welcome to the complete documentation for **opticore-react-native** — the TypeScript-first infrastructure library for React Native & Expo.

---

## 🚀 Getting Started

| Guide | What You'll Learn |
|---|---|
| [**Quick Start**](./QUICK_START.md) | Install, configure, and make your first API call in 10 minutes |
| [**Architecture**](./ARCHITECTURE.md) | How the library is structured and why |
| [**Configuration**](./CONFIGURATION.md) | Every config option explained |

---

## 📚 API Reference

| Module | Description |
|---|---|
| [**Infrastructure**](./api/INFRASTRUCTURE.md) | ApiClient · Logger · StorageManager · ConnectivityManager · LifecycleManager |
| [**State Management**](./api/STATE.md) | AsyncState · BaseStore · StoreFactory · StateObserver · CrudStore |
| [**Hooks**](./api/HOOKS.md) | useAsyncState · useDebounce · useConnectivity · useKeyboard · +7 more |
| [**Error Handling**](./api/ERRORS.md) | RenderError · NonRenderError · Result<T,E> · OptiCoreErrorBoundary |
| [**Utilities**](./api/UTILITIES.md) | String · Number · Array · Date · Object · Format · Color · Platform · buildUrl |
| [**Navigation**](./api/NAVIGATION.md) | useRouteHelper · Expo Router integration |
| [**React Query**](./REACT_QUERY.md) | createQueryClient · error-aware retry · repository + query-hook pattern |

---

## 🎨 Feature Guides

| Guide | Description |
|---|---|
| [**Forms**](./FORMS.md) | Zod validation · React Hook Form · Input masks · Field-level validation |
| [**Theme Engine**](./THEME.md) | Dynamic theming · Dark mode · Semantic typography · Spacing · ThemeManager |
| [**Tailwind / NativeWind**](./TAILWIND.md) | createTailwindPreset · theme-driven `className` tokens · `text-body`/`bg-card` |
| [**Offline Sync**](./OFFLINE.md) | Request queue · Auto-sync · Conflict resolution · useOfflineSync |

---

## 🧭 Project Guides

| Guide | Description |
|---|---|
| [**Testing**](./TESTING.md) | Test patterns · Mocks · Coverage · Jest setup |
| [**Migration**](./MIGRATION.md) | Migrate from Redux · MobX · plain Axios |
| [**FAQ**](./FAQ.md) | Common questions and troubleshooting |

---

## 🏛 Module Map

```
opticore-react-native
│
├── Infrastructure          ApiClient, Logger, StorageManager,
│                          ConnectivityManager, LifecycleManager
│
├── State                  AsyncState, BaseStore, StoreFactory,
│                          CrudStore, StateObserver
│
├── Error                  RenderError, NonRenderError, ApiError,
│                          ErrorClassifier, Result<T,E>,
│                          OptiCoreErrorBoundary
│
├── Hooks                  useAsyncState, useSafeCall, useConnectivity,
│                          useResponsive, useDebounce, useThrottle,
│                          usePrevious, useKeyboard, useOrientation,
│                          useLifecycle, useMount
│
├── Forms                  useFormState, useFieldValidation,
│                          phoneMask, currencyMask, creditCardMask,
│                          createValidationSchema, validators
│
├── Offline                OfflineSyncManager, useOfflineSync,
│                          RequestQueue, SyncEngine, ConflictResolver
│
├── Theme                  ThemeManager, ThemeProvider, useTheme,
│                          lightTheme, darkTheme, colorUtils
│
├── Providers              OptiCoreProvider, ConfigProvider,
│                          QueryProvider, useConfig
│
├── Navigation             useRouteHelper
│
├── Utils                  string, number, array, date, object,
│                          format, color, platform
│
├── Config                 coreSetup, ConfigValidator, CoreConfig
│
└── Types                  AsyncState, ApiResponse, PaginatedResponse,
                           StorageTypes, NavigationTypes, ErrorTypes
```

---

## 📦 Package Subpath Exports

```typescript
import { ApiClient, Logger }     from 'opticore-react-native';
import { useAsyncState }         from 'opticore-react-native/hooks';
import { useFormState }          from 'opticore-react-native/forms';
import { useOfflineSync }        from 'opticore-react-native/offline';
import { useTheme }              from 'opticore-react-native/theme';
import { capitalize, clamp }     from 'opticore-react-native/utils';
import { createBaseStore }       from 'opticore-react-native/state';
import { useRouteHelper }        from 'opticore-react-native/navigation';
import { createTailwindPreset }  from 'opticore-react-native/tailwind';
```

> `createQueryClient`, `toMessage`, `buildUrl`, and `ApiResult` are also available from the main
> entry (`opticore-react-native`).

---

## 🔗 Quick Links

- [npm package](https://www.npmjs.com/package/opticore-react-native)
- [GitHub repository](https://github.com/dev-mahmoud-elshenawy/opticore-react-native)
- [Issue tracker](https://github.com/dev-mahmoud-elshenawy/opticore-react-native/issues)
- [Changelog](../CHANGELOG.md)
