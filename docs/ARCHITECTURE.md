# Architecture

OptiCore React Native is a **layered infrastructure library** built on clean architecture principles. Every layer has a single responsibility and communicates through well-defined interfaces.

---

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                  Your Application                    │
│   (screens, navigation, business logic, UI)          │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│              Provider Layer                          │
│   OptiCoreProvider · ConfigProvider · QueryProvider  │
│   ThemeProvider                                      │
└──────┬─────────────────┬───────────────┬────────────┘
       │                 │               │
┌──────▼──────┐  ┌───────▼──────┐  ┌────▼───────────┐
│ Hooks Layer │  │ Forms Layer  │  │  Theme Layer    │
│ useAsync    │  │ useFormState │  │  useTheme       │
│ useKeyboard │  │ useMask      │  │  ThemeManager   │
│ useDebounce │  │ validators   │  │  ThemeProvider  │
└──────┬──────┘  └───────┬──────┘  └────────────────┘
       │                 │
┌──────▼─────────────────▼───────────────────────────┐
│                  State Layer                         │
│   AsyncState · BaseStore · StoreFactory · CrudStore  │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│               Infrastructure Layer                   │
│  ApiClient · StorageManager · Logger                 │
│  ConnectivityManager · LifecycleManager              │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  Error Layer                         │
│  RenderError · NonRenderError · ErrorClassifier      │
│  Result<T,E> · OptiCoreErrorBoundary                 │
└─────────────────────────────────────────────────────┘
```

---

## Layer Breakdown

### Infrastructure Layer — `src/infrastructure/`

The foundation of the library. Handles I/O: network, storage, logging, and device state.

| Module | Role | Pattern |
|---|---|---|
| `ApiClient` | HTTP client (Axios) with interceptors, auth strategies, retry | Singleton |
| `StorageManager` | Unified interface over AsyncStorage + SecureStore | Singleton |
| `Logger` | Structured logging with pluggable transports | Singleton |
| `ConnectivityManager` | Real-time network state monitoring | Singleton + Observer |
| `LifecycleManager` | App foreground/background tracking | Singleton + Observer |

**All services are singletons** — call `getInstance()` to get the same instance anywhere in your app.

```typescript
// Same instance everywhere
const api = ApiClient.getInstance();
const storage = StorageManager.getInstance();
const logger = Logger.getInstance();
```

---

### State Layer — `src/state/`

Manages application state using Zustand with Immer for immutable updates.

| Module | Role |
|---|---|
| `AsyncState<T>` | Type-safe pattern for async operations (idle/loading/success/error) |
| `BaseStore` | Zustand store with DevTools, Immer, and reset/hydrate built in |
| `StoreFactory` | Factory for creating CRUD stores with async actions |
| `CrudStore<T>` | Pre-built store with fetchAll/fetchById/create/update/delete |
| `StateObserver` | Subscribe to store changes outside React |

---

### Error Layer — `src/error/`

Classifies every error as either **user-visible** or **silent**, so the right layer handles it.

```
BaseError (abstract)
├── RenderError       → Shown to user (Alert, Error screen)
│   └── ApiError      → HTTP errors with status codes
└── NonRenderError    → Logged only (analytics, Sentry)
```

Also provides `Result<T, E>` — a Rust-inspired type for error handling without try/catch.

---

### Provider Layer — `src/providers/`

React context providers that wire up the entire library with a single component.

```typescript
<OptiCoreProvider config={config}>
  {/* Every module is initialized, React Query is configured,
      Theme is applied, Config is accessible via useConfig() */}
</OptiCoreProvider>
```

**What OptiCoreProvider does internally:**
1. Calls `coreSetup.init(config)` to initialize all singletons
2. Wraps children with `ConfigProvider` → `QueryProvider` → `ThemeProvider`
3. Sets up `ConnectivityManager` and `LifecycleManager` listeners
4. Disposes listeners on unmount

---

### Hooks Layer — `src/hooks/`

Custom React hooks that bridge infrastructure services with React components. 11 hooks covering async state, device state, and performance.

```typescript
// Async state management
const { data, isLoading, error, run } = useAsyncState(fetchUsers);

// Device sensors
const { isConnected } = useConnectivity();
const { isVisible, keyboardHeight } = useKeyboard();
const { isPortrait } = useOrientation();

// Performance
const debouncedSearch = useDebounce(searchTerm, 300);
const throttledScroll = useThrottle(scrollValue, 100);
```

---

### Utils Layer — `src/utils/`

40+ pure functions with zero side effects. Fully tree-shakable.

```
utils/
├── string.ts    capitalize, truncate, maskSensitive, toCamelCase, isEmail, isURL
├── number.ts    toInt, toDouble, clamp, random
├── array.ts     filterNonNull, groupBy, unique, sortBy
├── date.ts      formatDate, timeAgo, isToday, diffDays
├── object.ts    get, deepMerge, pick, omit
├── format.ts    formatPhone, formatCurrency, formatPercentage
├── color.ts     hexToRgb, rgbToHex, lighten, darken
└── platform.ts  isIOS, isAndroid, getDeviceWidth, copyToClipboard
```

---

## Data Flow

### Making an API Call

```
Component
  └─► useAsyncState(fetchUsers)           ← Hook manages loading/error state
        └─► ApiClient.getInstance().request() ← Singleton HTTP client
              ├─► Request Interceptor     ← Attaches auth token
              ├─► HTTP Request → Server
              ├─► Response Interceptor    ← Logs response, handles errors
              └─► Returns data to hook    ← Hook updates state → re-render
```

### Authentication Flow

```
coreSetup.init({ api: { getAuthToken: () => storage.get('token') } })
  └─► ApiClient configured with AuthStrategy
        └─► Every request: AuthInterceptor calls getAuthToken()
              └─► If 401: calls onTokenRefresh() → retries once
```

### Offline Queue Flow

```
User action (offline)
  └─► useOfflineSync().enqueue(request)
        └─► RequestQueue.add() → persisted in AsyncStorage
              └─► ConnectivityManager detects reconnect
                    └─► SyncEngine.sync() processes queue
                          └─► ConflictResolver handles conflicts
                                └─► ApiClient sends requests
```

---

## Design Patterns

### Singleton

Used by all infrastructure services. Ensures a single shared instance across the app.

```typescript
class ApiClient {
  private static instance: ApiClient;

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }
}
```

### Observer

Used by `ConnectivityManager`, `LifecycleManager`, `ThemeManager`, `OfflineSyncManager`.

```typescript
const manager = ConnectivityManager.getInstance();
manager.addListener((isConnected) => {
  // Called whenever network state changes
});
```

### Strategy

Used by `AuthStrategy` — swap authentication methods without changing `ApiClient`.

```typescript
// No auth
new NoAuthStrategy()

// API key
new ApiKeyStrategy('X-API-Key', process.env.API_KEY)

// Bearer token with refresh
new BearerTokenStrategy(getToken, refreshToken)
```

### Result Type

Used to eliminate try/catch for predictable error paths.

```typescript
function parseConfig(json: string): Result<Config, Error> {
  try {
    return Result.ok(JSON.parse(json));
  } catch (e) {
    return Result.err(new Error('Invalid config JSON'));
  }
}

const result = parseConfig(input);
if (result.isOk()) {
  initialize(result.unwrap());
}
```

---

## Extension Points

### Custom Auth Strategy

```typescript
class OAuthStrategy implements AuthStrategy {
  async applyAuth(config: InternalAxiosRequestConfig) {
    config.headers['Authorization'] = `Bearer ${await getOAuthToken()}`;
    return config;
  }

  async handleUnauthorized(error: unknown) {
    await refreshOAuthToken();
    return { retry: true, tokenRefreshed: true };
  }
}

coreSetup.init({
  api: {
    baseURL: 'https://api.example.com',
    authStrategy: new OAuthStrategy(),
  },
});
```

### Custom Log Transport

```typescript
import type { LogTransport, LogEntry } from 'opticore-react-native';

const sentryTransport: LogTransport = {
  name: 'sentry',
  minLevel: LogLevel.ERROR,
  write(entry: LogEntry) {
    Sentry.captureMessage(entry.message, {
      level: 'error',
      extra: entry.metadata,
    });
  },
};

Logger.getInstance().addTransport(sentryTransport);
```

### Custom Error Classification

```typescript
coreSetup.init({
  errorClassification: {
    customRules: [
      {
        name: 'payment-error',
        match: (error) => error?.code === 'PAYMENT_FAILED',
        type: ErrorType.RENDER,
      },
    ],
  },
});
```

### Custom Theme

```typescript
import { createTheme } from 'opticore-react-native/theme';

const brandTheme = createTheme({
  colors: { primary: '#6C63FF', background: '#FAFAFA' },
  typography: { body: 16, h1: 32 },
});

ThemeManager.getInstance().registerTheme('brand', brandTheme);
```

---

## Dependencies

| Package | Purpose | Version |
|---|---|---|
| `axios` | HTTP client | ^1.13 |
| `zustand` | State management | ^5.0 |
| `@tanstack/react-query` | Server state + caching | ^5.90 |
| `immer` | Immutable state updates | ^10.2 |
| `zod` | Schema validation | ^3.24 |
| `react-hook-form` | Form management | ^7.54 |
| `date-fns` | Date utilities | ^4.1 |
| `@react-native-async-storage/async-storage` | Local storage | ^2.2 |
| `expo-secure-store` | Encrypted storage | ^15.0 |
| `@react-native-community/netinfo` | Network monitoring | ^11.5 |

---

## Build Output

```
dist/
├── src/
│   ├── index.js + index.d.ts      ← Main entry
│   ├── hooks/index.js             ← opticore-react-native/hooks
│   ├── forms/index.js             ← opticore-react-native/forms
│   ├── offline/index.js           ← opticore-react-native/offline
│   ├── theme/index.js             ← opticore-react-native/theme
│   ├── state/index.js             ← opticore-react-native/state
│   └── utils/index.js             ← opticore-react-native/utils
```

All outputs are ES modules with full TypeScript declaration files.
