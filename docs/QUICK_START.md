# Quick Start

Get OptiCore fully integrated into your React Native or Expo app in under 10 minutes.

---

## Prerequisites

- Node.js 18+
- Expo SDK 54+ (or React Native 0.78+) with React 19+
- `expo-router` 4+ (from your normal Expo setup) and `@tanstack/react-query` 5+ — required peers (the install CLI in Step 1 adds React Query for you)
- TypeScript 5+ — _optional_; OptiCore ships its own type definitions, so JS-only apps work without it

---

## Step 1 — Install

```bash
npm install opticore-react-native
# or
yarn add opticore-react-native
```

### Install peer dependencies

OptiCore ships a CLI that installs the adapter-backed native peers (secure-store, async-storage,
netinfo, …) and required JS peers at versions aligned to your Expo SDK:

```bash
npx opticore-install-peers
```

> This does **not** install `react`, `react-native`, `expo`, or `expo-router` — your app already
> provides those. Pass `--optional` to also add the optional native peers (clipboard, device info).

---

## Step 2 — Wrap Your App

Add `OptiCoreProvider` at the root of your application. It initializes all infrastructure and wires up React Query, theming, and config in one step.

> **This is the one setup path for apps.** `OptiCoreProvider` is what you use.
> `CoreSetup.init()` is the internal step the provider calls for you — don't call it
> directly unless you're doing advanced/manual (non-React) setup.

```typescript
// app/_layout.tsx (Expo Router)
import { OptiCoreProvider } from 'opticore-react-native';

export default function RootLayout() {
  return (
    <OptiCoreProvider
      config={{
        api: {
          baseURL: 'https://api.yourapp.com',
          timeout: 10000,
        },
        logger: {
          level: LogLevel.DEBUG,
          disabled: !__DEV__,
        },
      }}
    >
      <Stack />
    </OptiCoreProvider>
  );
}
```

> **Note**: `OptiCoreProvider` replaces the need to call `coreSetup.init()` manually. It handles initialization, React Query setup, theme wiring, and cleanup on unmount.

---

## Step 3 — Make API Calls

> **The `api` facade is the one way to make calls.** Import `api` from the package
> root — no `.getInstance()`, no `HttpMethod` enum. The verbs return the **response
> body** directly; the type parameter is per-call (`User[]`, `User`, a paginated
> wrapper, anything) and defaults to `unknown`.

```typescript
import { api } from 'opticore-react-native';
import { useAsyncState } from 'opticore-react-native/hooks';

interface User {
  id: string;
  name: string;
  email: string;
}

// Define your API function — api.get returns the body (User[]) directly
async function fetchUsers(): Promise<User[]> {
  return api.get<User[]>('/users');
}

// Use in a component
function UserListScreen() {
  const { data, isLoading, error, run } = useAsyncState<User[]>();

  useEffect(() => { run(fetchUsers); }, []);

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <Text>{item.name}</Text>}
      keyExtractor={(item) => item.id}
    />
  );
}
```

> **Query parameters:** pass a `params` object — the query string is serialized for you
> (via Axios), so you never build URLs by hand:
>
> ```typescript
> // GET /articles?category=tech&pageSize=20
> api.get<Article[]>('/articles', { params: { category: 'tech', pageSize: 20 } });
> ```
>
> Reach for the `buildUrl` helper (`opticore-react-native/utils`) only when you need a pre-built URL
> string _outside_ a request.

---

## Step 4 — Add Authentication

Configure `getAuthToken` to automatically attach a Bearer token to every request.

```typescript
import { storage } from 'opticore-react-native';

<OptiCoreProvider
  config={{
    api: {
      baseURL: 'https://api.yourapp.com',
      getAuthToken: async () => {
        return storage.secure.get<string>('auth_token');
      },
      onTokenRefresh: async () => {
        const newToken = await refreshToken();
        await storage.secure.set('auth_token', newToken);
        return newToken;
      },
    },
  }}
>
```

**Login flow:**

```typescript
import { api, storage } from 'opticore-react-native';

async function login(email: string, password: string) {
  const data = await api.post('/auth/login', { email, password });

  await storage.secure.set('auth_token', data.token);
  await storage.local.set('user', data.user);

  return data.user;
}
```

---

## Step 5 — Handle Errors

Wrap screens with `OptiCoreErrorBoundary` to catch and display errors gracefully.

```typescript
import { api, logger, OptiCoreErrorBoundary, RenderError } from 'opticore-react-native';

function App() {
  return (
    <OptiCoreErrorBoundary
      fallback={(error) => <ErrorScreen message={error.message} />}
      onError={(error) => logger.error('Boundary caught', error)}
    >
      <MainNavigator />
    </OptiCoreErrorBoundary>
  );
}

// Throw typed errors in your code
async function fetchProfile(userId: string) {
  try {
    return await api.get(`/users/${userId}`);
  } catch (e) {
    throw new RenderError('Failed to load profile', {
      cause: e,
      severity: 'error',
    });
  }
}
```

---

## Step 6 — Use Storage

```typescript
import { storage } from 'opticore-react-native'; // facade — no .getInstance()

// Regular storage (AsyncStorage)
await storage.local.set('theme', 'dark');
const theme = await storage.local.get<string>('theme');
await storage.local.remove('theme');

// Secure storage (iOS Keychain / Android Keystore)
await storage.secure.set('auth_token', 'eyJhbGc...');
const token = await storage.secure.get<string>('auth_token');
```

> Clear everything (e.g. on logout) with `await storage.clearAll();` — still on the facade,
> no `getInstance()`.

---

## Step 7 — Add Logging

```typescript
import { logger } from 'opticore-react-native'; // facade — no .getInstance()

logger.debug('User data loaded', { userId: '123' });
logger.info('App started');
logger.warn('Token expiring soon');
logger.error('Network request failed', new Error('timeout'));
```

**Change the level or add a custom transport (e.g., Sentry)** — all on the `logger` facade:

```typescript
import { logger, LogLevel } from 'opticore-react-native';

logger.setLevel(LogLevel.WARN);

logger.addTransport({
  name: 'sentry',
  minLevel: LogLevel.ERROR,
  write(entry) {
    Sentry.captureMessage(entry.message, { extra: entry.metadata });
  },
});
```

---

## Step 8 — Monitor Network

```typescript
import { connectivity } from 'opticore-react-native';
import { useConnectivity } from 'opticore-react-native/hooks';

// In a component — reactive
function NetworkBanner() {
  const { isConnected } = useConnectivity();

  if (isConnected) return null;
  return <Banner message="No internet connection" />;
}

// Outside React — the connectivity facade (no getInstance)
if (!connectivity.isConnected) {
  enqueueForLater(request);
}
const unsubscribe = connectivity.subscribe((s) => log(s.isConnected));
```

---

## Full Example: Product Screen

```typescript
import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { api, RenderError } from 'opticore-react-native';
import { useAsyncState } from 'opticore-react-native/hooks';

interface Product {
  id: string;
  name: string;
  price: number;
}

async function fetchProducts(): Promise<Product[]> {
  return api.get<Product[]>('/products');
}

export function ProductsScreen() {
  const { data: products, isLoading, error, run } = useAsyncState<Product[]>();

  useEffect(() => { run(fetchProducts); }, []);

  if (isLoading) return <ActivityIndicator size="large" />;

  if (error) return (
    <View>
      <Text>Failed to load products</Text>
      <Text>{error.message}</Text>
    </View>
  );

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View>
          <Text>{item.name}</Text>
          <Text>${item.price}</Text>
        </View>
      )}
    />
  );
}
```

---

## Troubleshooting

### "Cannot find module 'opticore-react-native'"

Verify installation: `npm ls opticore-react-native`

### "ApiClient: not configured"

Ensure `OptiCoreProvider` wraps your component tree before making any `api.get`/`api.post`/etc. calls.

### TypeScript errors about strict mode

Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler"
  }
}
```

### Expo SecureStore not working on web

`SecureStore` is iOS/Android only. Use `storage.local` for web targets. See [FAQ](./FAQ.md).

---

## Next Steps

- [Architecture](./ARCHITECTURE.md) — How the library is structured
- [Configuration](./CONFIGURATION.md) — Full config reference
- [Infrastructure API](./api/INFRASTRUCTURE.md) — ApiClient, Logger, Storage in depth
- [Hooks](./api/HOOKS.md) — All 11 custom hooks
- [Error Handling](./api/ERRORS.md) — RenderError, Result<T,E>, Error Boundary
