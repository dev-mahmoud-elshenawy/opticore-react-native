# Infrastructure API Reference

Core services: networking, storage, logging, and device monitoring.

---

## Facades (recommended entry point)

`api`, `storage`, `logger`, and `connectivity` are the **entire app-facing API**. Everything
you need is on them — **app code never calls `.getInstance()`**, and `api` never needs the
`HttpMethod` enum. (The singleton classes documented below are internal; the facades cover
their full feature set.)

```typescript
import { api, storage, logger, connectivity } from 'opticore-react-native';
// or from 'opticore-react-native/facades'

// api — HTTP verbs return the response body (T) directly; T defaults to unknown.
const users = await api.get<User[]>('/users', { params: { page: 1 } });
const created = await api.post<Created>('/users', { name: 'Ali' }, { headers: { 'X-Trace': '1' } });
await api.put<User>('/users/1', body);
await api.delete('/users/1');

// api — dynamic global headers (no getInstance):
api.setHeader('Accept-Language', 'ar');
api.setHeaders({ 'X-Tenant': 't1' });
api.removeHeader('Accept-Language');

// api — custom interceptors + readiness:
const id = api.onRequest({ onRequest: (c) => c });
api.onResponse({ onResponse: (r) => r });
api.removeInterceptor(id);
if (api.isReady()) {
  /* client configured */
}

// storage — secure (Keychain/Keystore) + local (AsyncStorage) + clearAll
await storage.secure.set('token', t);
await storage.local.get<User>('user');
await storage.clearAll();

// logger — log, set level, manage transports
logger.info('ready', { userId: '123' });
logger.setLevel(LogLevel.WARN);
logger.addTransport(sentryTransport);

// connectivity — status + subscribe (in components, prefer the useConnectivity hook)
if (connectivity.isConnected) await sync();
const unsubscribe = connectivity.subscribe((s) => logger.debug(`online: ${s.isConnected}`));
```

| Facade          | Full surface                                                                                                                                     | In components, also |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| `api`           | `get` `post` `put` `patch` `delete` (→ `T`) · `setHeader` `setHeaders` `removeHeader` · `onRequest` `onResponse` `removeInterceptor` · `isReady` | `useAsyncState`     |
| `storage`       | `secure` `local` (each: `get`/`set`/`remove`/`clear`) · `clearAll`                                                                               | —                   |
| `logger`        | `debug` `info` `warn` `error` · `setLevel` · `addTransport` `removeTransport` `clearTransports`                                                  | —                   |
| `connectivity`  | `isConnected` · `subscribe(cb) → unsubscribe`                                                                                                    | `useConnectivity`   |
| `offline`       | `enqueue` `sync` `remove` `clearQueue` `pause` `resume` `getPendingCount` `isSyncing` · `subscribe`                                              | `useOfflineSync`    |
| `themeControl`  | `current` `mode` `activeMode` · `setMode` `setTheme` `registerTheme` `unregisterTheme` · `subscribe`                                             | `useTheme`          |
| `lifecycle`     | `onChange(onActive?, onInactive?) → unsubscribe`                                                                                                 | `useLifecycle`      |
| `stateObserver` | `subscribe(store, cb, opts?) → unsubscribe` · `cleanup`                                                                                          | store hooks         |

**App code never calls `.getInstance()`** — these eight facades cover every feature. In
components, the hooks (right column) are the reactive equivalent; the facades are for
imperative/non-component code. Setup (`configure`/`init`) is done once by `OptiCoreProvider`.

`api` verb signatures: `get(url, cfg?)` / `delete(url, cfg?)`; `post|put|patch(url, data?, cfg?)`, where `cfg = { headers?, params?, signal? }`. All return `Promise<T>` — the response body. Every call runs through the fully-configured client (baseURL, default headers, auth token injection + 401 refresh, interceptors, retry, `ApiError`).

---

## ApiClient

HTTP client built on Axios. Supports interceptors, auth strategies, automatic token refresh, and retry logic.

### Import

```typescript
import { ApiClient } from 'opticore-react-native';
```

### Configuration

The client is configured for you by `OptiCoreProvider` (you pass `config.api`). App code
never calls `getInstance()` — make requests through the **`api` facade**.

### Making Requests

```typescript
import { api } from 'opticore-react-native';

// Verbs return the response body (T) directly. T is per-call, defaults to unknown.
const users = await api.get<User[]>('/users', { params: { page: 1 } });
const user = await api.get<User>('/users/1');
const created = await api.post<User>('/users', { name: 'Alice' });
await api.put<User>('/users/1', changes);
await api.patch<User>('/users/1', partial);
await api.delete('/users/1');
```

**Per-request options** — 2nd arg for `get`/`delete`, 3rd for `post`/`put`/`patch`:

| Option    | Type                              | Description                                         |
| --------- | --------------------------------- | --------------------------------------------------- |
| `params`  | `Record<string, QueryParamValue>` | Query parameters (serialized by Axios)              |
| `headers` | `Record<string, string>`          | Per-request headers                                 |
| `signal`  | `AbortSignal`                     | Cancellation (e.g. `controller.abort()` on unmount) |

> Requests made before `OptiCoreProvider` mounts throw a clear "not initialized" error
> instead of sending with no `baseURL`/auth. The provider configures the client
> synchronously before your screens render, so app code is unaffected.

---

### Interceptors (advanced)

Most apps don't need these — auth and logging are already built in. When you do,
interceptors are registered on the client instance:

```typescript
import { ApiClient } from 'opticore-react-native';
const client = ApiClient.getInstance();
```

```typescript
// addRequestInterceptor / addResponseInterceptor
const id = client.addRequestInterceptor({
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
client.removeInterceptor(id);
```

```typescript
const id = client.addResponseInterceptor({
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
new NoAuthStrategy();

// API Key in header
new ApiKeyStrategy('X-API-Key', 'your-key');

// Bearer token with auto-refresh on 401
new BearerTokenStrategy(
  async () => storage.secure.get<string>('token'),
  async () => {
    const newToken = await refreshFromServer();
    await storage.secure.set('token', newToken);
    return newToken;
  }
);
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
    console.warn(e.status); // 401
    console.warn(e.url); // '/protected'
    console.warn(e.message); // 'Unauthorized'
    console.warn(e.isRetryable); // true for network/408/429/5xx, false otherwise
    console.warn(e.retryAfterMs); // parsed `Retry-After` header, if the server sent one
  }
}
```

`isRetryable`/`retryAfterMs` are what `createQueryClient` (see
[State docs](./STATE.md#createqueryclient)) reads to decide whether/when to retry — `429`/`503`/`408`/network
failures retry automatically with backoff (honoring `Retry-After` when present), while
`400/401/403/404/409/422` fail immediately since those require the caller to fix something.

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
logger: {
  level: LogLevel.WARN;
}

// Directly
logger.configure({ level: LogLevel.DEBUG });
```

Log levels (numeric, filter by minimum):

| Level   | Value | When to Use                           |
| ------- | ----- | ------------------------------------- |
| `DEBUG` | 0     | Development only — verbose detail     |
| `INFO`  | 1     | General operational events            |
| `WARN`  | 2     | Unexpected but recoverable situations |
| `ERROR` | 3     | Failures that need attention          |

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

logger.addTransport(new ConsoleTransport({ formatter: new JsonFormatter() }));
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
const isOnline = connectivity.isConnected; // boolean
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
