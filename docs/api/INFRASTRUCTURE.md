# Infrastructure API Reference

Core services: networking, storage, logging, and device monitoring.

---

## ApiClient

HTTP client built on Axios. Supports interceptors, auth strategies, automatic token refresh, and retry logic.

### Import

```typescript
import { ApiClient } from 'opticore-react-native';
```

### `ApiClient.getInstance(): ApiClient`

Returns the singleton instance. Must be called after `OptiCoreProvider` mounts or `coreSetup.init()` is called.

```typescript
const api = ApiClient.getInstance();
```

---

### HTTP Methods

All methods return `Promise<AxiosResponse<T>>`.

```typescript
// GET
const { data } = await api.get<User[]>('/users');
const { data } = await api.get<User>('/users/1', { params: { include: 'profile' } });

// POST
const { data } = await api.post<User>('/users', { name: 'Alice', email: 'alice@example.com' });

// PUT
const { data } = await api.put<User>('/users/1', { name: 'Alice Updated' });

// PATCH
const { data } = await api.patch<User>('/users/1', { name: 'Alice' });

// DELETE
await api.delete('/users/1');
```

**Parameters:**
| Param | Type | Description |
|---|---|---|
| `url` | `string` | Endpoint path (appended to `baseURL`) |
| `data` | `unknown` | Request body (POST/PUT/PATCH) |
| `config` | `AxiosRequestConfig` | Optional Axios request config |

---

### Interceptors

Add custom request or response interceptors.

```typescript
// addRequestInterceptor / addResponseInterceptor
const id = api.addRequestInterceptor({
  onRequest(config) {
    config.headers['X-Request-ID'] = uuid();
    return config;
  },
  onError(error) {
    Logger.getInstance().error('Request error', error as Error);
    return Promise.reject(error);
  },
});

// Remove by ID
api.removeInterceptor(id);
```

```typescript
const id = api.addResponseInterceptor({
  onResponse(response) {
    Logger.getInstance().debug(`${response.config.url} → ${response.status}`);
    return response;
  },
  onError(error) {
    // Centrally handle all HTTP errors
    return Promise.reject(error);
  },
});
```

---

### Authentication Strategies

Configure via `coreSetup.init()` or `OptiCoreProvider`:

```typescript
// No authentication (default)
new NoAuthStrategy()

// API Key in header
new ApiKeyStrategy('X-API-Key', 'your-key')

// Bearer token with auto-refresh on 401
new BearerTokenStrategy(
  async () => storage.secure.get<string>('token'),
  async () => {
    const newToken = await refreshFromServer();
    await storage.secure.set('token', newToken);
    return newToken;
  }
)
```

**Custom strategy:**
```typescript
class CustomStrategy implements AuthStrategy {
  async applyAuth(config: InternalAxiosRequestConfig) {
    config.headers['X-Custom-Auth'] = await getCustomToken();
    return config;
  }
  async handleUnauthorized(_error: unknown): Promise<AuthRetryResult | null> {
    return null; // don't retry
  }
}
```

---

### ApiError

Thrown when an HTTP request fails. Extends `RenderError`.

```typescript
try {
  await api.get('/protected');
} catch (e) {
  if (e instanceof ApiError) {
    console.warn(e.status);          // 401
    console.warn(e.url);             // '/protected'
    console.warn(e.message);         // 'Unauthorized'
  }
}
```

---

## StorageManager

Unified interface over AsyncStorage (local) and expo-secure-store (secure).

### Import

```typescript
import { StorageManager } from 'opticore-react-native';
const storage = StorageManager.getInstance();
```

### Local Storage (AsyncStorage)

```typescript
// Set (value is JSON-serialized automatically)
await storage.local.set('user', { id: '1', name: 'Alice' });
await storage.local.set('theme', 'dark');

// Get (returns null if not found)
const user = await storage.local.get<User>('user');
const theme = await storage.local.get<string>('theme');

// Remove
await storage.local.remove('user');

// Clear all local
await storage.local.clear();
```

### Secure Storage (iOS Keychain / Android Keystore)

```typescript
// Store sensitive strings
await storage.secure.set('access_token', 'eyJhbGc...');
await storage.secure.set('refresh_token', 'dGhpcyBp...');

// Retrieve
const token = await storage.secure.get<string>('access_token');

// Remove
await storage.secure.remove('access_token');

// Clear all secure
await storage.secure.clear();
```

> ⚠️ `SecureStorage` is iOS and Android only. It will throw on web. Use `storage.local` for web support.

### Clear All

```typescript
// Clears both local and secure storage
await StorageManager.getInstance().clearAll();
```

### IStorage Interface

Both `local` and `secure` implement `IStorage`:

```typescript
interface IStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

---

## Logger

Structured logging with level filtering and pluggable transports.

### Import

```typescript
import { Logger, LogLevel } from 'opticore-react-native';
const logger = Logger.getInstance();
```

### Logging Methods

```typescript
logger.debug('Fetching users', { endpoint: '/users' });
logger.info('User logged in', { userId: '123' });
logger.warn('Token expires in 5 minutes');
logger.error('Failed to save profile', new Error('Network timeout'));
```

All methods accept:
- `message: string` — the log message
- `...args: unknown[]` — optional additional context (objects, errors, etc.)

### Configure Log Level

```typescript
// Via OptiCoreProvider config
logger: { level: LogLevel.WARN }

// Directly
logger.configure({ level: LogLevel.DEBUG });
```

Log levels (numeric, filter by minimum):

| Level | Value | When to Use |
|---|---|---|
| `DEBUG` | 0 | Development only — verbose detail |
| `INFO` | 1 | General operational events |
| `WARN` | 2 | Unexpected but recoverable situations |
| `ERROR` | 3 | Failures that need attention |

### Custom Transports

A transport is any object that implements `LogTransport`:

```typescript
interface LogTransport {
  name: string;
  minLevel?: LogLevel;
  write(entry: LogEntry): void;
}
```

**Sentry example:**
```typescript
logger.addTransport({
  name: 'sentry',
  minLevel: LogLevel.ERROR,
  write(entry) {
    Sentry.captureMessage(entry.message, {
      level: 'error',
      extra: { metadata: entry.metadata, args: entry.args },
    });
  },
});
```

**Remote HTTP example:**
```typescript
logger.addTransport({
  name: 'remote',
  minLevel: LogLevel.WARN,
  write(entry) {
    fetch('https://logs.example.com/ingest', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },
});
```

**Remove a transport:**
```typescript
logger.removeTransport('sentry');
logger.clearTransports(); // remove all
```

### JSON Formatter

Use structured JSON output (useful for remote services):

```typescript
import { JsonFormatter, ConsoleTransport } from 'opticore-react-native';

logger.addTransport(
  new ConsoleTransport({ formatter: new JsonFormatter() })
);
// Output: {"level":"info","message":"User logged in","timestamp":"...","metadata":{}}
```

---

## ConnectivityManager

Real-time network monitoring via `@react-native-community/netinfo`.

### Import

```typescript
import { ConnectivityManager } from 'opticore-react-native';
const connectivity = ConnectivityManager.getInstance();
```

### Check Current State

```typescript
// Synchronous (updated by listener)
const isOnline = connectivity.isConnected;  // boolean
```

### Subscribe to Changes

```typescript
const unsubscribe = connectivity.addListener((isConnected: boolean) => {
  if (!isConnected) {
    showOfflineBanner();
  } else {
    hideOfflineBanner();
    syncPendingRequests();
  }
});

// Cleanup
unsubscribe();
// or
connectivity.removeListener(callback);
```

### In React Components

Use the `useConnectivity` hook instead:

```typescript
import { useConnectivity } from 'opticore-react-native/hooks';

function OfflineIndicator() {
  const { isConnected } = useConnectivity();
  return isConnected ? null : <Banner text="Offline" />;
}
```

---

## LifecycleManager

Tracks app foreground/background state via React Native's `AppState`.

### Import

```typescript
import { LifecycleManager } from 'opticore-react-native';
const lifecycle = LifecycleManager.getInstance();
```

### Subscribe to State Changes

```typescript
const unsubscribe = lifecycle.addObserver(
  () => {
    // App became active (foreground)
    refreshUserSession();
  },
  () => {
    // App became inactive/background
    saveUnsavedDraft();
  }
);

// Cleanup
unsubscribe();
```

### In React Components

Use the `useLifecycle` hook:

```typescript
import { useLifecycle } from 'opticore-react-native/hooks';

function SessionManager() {
  const appState = useLifecycle(); // 'active' | 'background' | 'inactive'

  useEffect(() => {
    if (appState === 'active') {
      refreshTokenIfNeeded();
    }
  }, [appState]);
}
```

---

## See Also

- [Configuration](../CONFIGURATION.md) — How to configure all infrastructure
- [Hooks](./HOOKS.md) — `useConnectivity`, `useLifecycle` hooks
- [Error Handling](./ERRORS.md) — `ApiError` and error classification
- [Architecture](../ARCHITECTURE.md) — Singleton pattern explanation
