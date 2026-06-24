# Quick Start

Get OptiCore fully integrated into your React Native or Expo app in under 10 minutes.

---

## Prerequisites

- Node.js 18+
- React Native 0.78+ or Expo SDK 54+
- TypeScript 5+

---

## Step 1 — Install

```bash
npm install opticore-react-native
# or
yarn add opticore-react-native
```

### Install peer dependencies

```bash
npx install-peerdeps opticore-react-native
```

---

## Step 2 — Wrap Your App

Add `OptiCoreProvider` at the root of your application. It initializes all infrastructure and wires up React Query, theming, and config in one step.

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

```typescript
import { ApiClient, HttpMethod } from 'opticore-react-native';
import { useAsyncState } from 'opticore-react-native/hooks';

interface User {
  id: string;
  name: string;
  email: string;
}

// Define your API function
async function fetchUsers(): Promise<User[]> {
  const response = await ApiClient.getInstance().request<User[]>({ method: HttpMethod.GET, url: '/users' });
  return response.data;
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

> **Query parameters:** pass a `params` object — `ApiClient` serializes the query string for you
> (via Axios), so you never build URLs by hand:
>
> ```typescript
> // GET /articles?category=tech&pageSize=20
> ApiClient.getInstance().request<Article[]>({
>   method: HttpMethod.GET,
>   url: '/articles',
>   params: { category: 'tech', pageSize: 20 },
> });
> ```
>
> Reach for the `buildUrl` helper (`opticore-react-native/utils`) only when you need a pre-built URL
> string *outside* a request.

---

## Step 4 — Add Authentication

Configure `getAuthToken` to automatically attach a Bearer token to every request.

```typescript
import { StorageManager } from 'opticore-react-native';

<OptiCoreProvider
  config={{
    api: {
      baseURL: 'https://api.yourapp.com',
      getAuthToken: async () => {
        return StorageManager.getInstance().secure.get<string>('auth_token');
      },
      onTokenRefresh: async () => {
        const newToken = await refreshToken();
        await StorageManager.getInstance().secure.set('auth_token', newToken);
        return newToken;
      },
    },
  }}
>
```

**Login flow:**

```typescript
import { ApiClient, HttpMethod } from 'opticore-react-native';

async function login(email: string, password: string) {
  const { data } = await ApiClient.getInstance().request({ method: HttpMethod.POST, url: '/auth/login', data: { email, password } });

  await StorageManager.getInstance().secure.set('auth_token', data.token);
  await StorageManager.getInstance().local.set('user', data.user);

  return data.user;
}
```

---

## Step 5 — Handle Errors

Wrap screens with `OptiCoreErrorBoundary` to catch and display errors gracefully.

```typescript
import { ApiClient, HttpMethod, OptiCoreErrorBoundary, RenderError } from 'opticore-react-native';

function App() {
  return (
    <OptiCoreErrorBoundary
      fallback={(error) => <ErrorScreen message={error.message} />}
      onError={(error) => Logger.getInstance().error('Boundary caught', error)}
    >
      <MainNavigator />
    </OptiCoreErrorBoundary>
  );
}

// Throw typed errors in your code
async function fetchProfile(userId: string) {
  try {
    return await ApiClient.getInstance().request({ method: HttpMethod.GET, url: `/users/${userId}` });
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
import { StorageManager } from 'opticore-react-native';

const storage = StorageManager.getInstance();

// Regular storage (AsyncStorage)
await storage.local.set('theme', 'dark');
const theme = await storage.local.get<string>('theme');
await storage.local.remove('theme');

// Secure storage (iOS Keychain / Android Keystore)
await storage.secure.set('auth_token', 'eyJhbGc...');
const token = await storage.secure.get<string>('auth_token');

// Clear all
await storage.clearAll();
```

---

## Step 7 — Add Logging

```typescript
import { Logger, LogLevel } from 'opticore-react-native';

const logger = Logger.getInstance();

logger.debug('User data loaded', { userId: '123' });
logger.info('App started');
logger.warn('Token expiring soon');
logger.error('Network request failed', new Error('timeout'));
```

**Add a custom transport (e.g., Sentry):**

```typescript
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
import { ConnectivityManager } from 'opticore-react-native';
import { useConnectivity } from 'opticore-react-native/hooks';

// In a component
function NetworkBanner() {
  const { isConnected } = useConnectivity();

  if (isConnected) return null;
  return <Banner message="No internet connection" />;
}

// Outside React
const connectivity = ConnectivityManager.getInstance();
if (!connectivity.isConnected) {
  enqueueForLater(request);
}
```

---

## Full Example: Product Screen

```typescript
import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { ApiClient, HttpMethod, RenderError } from 'opticore-react-native';
import { useAsyncState } from 'opticore-react-native/hooks';

interface Product {
  id: string;
  name: string;
  price: number;
}

async function fetchProducts(): Promise<Product[]> {
  const { data } = await ApiClient.getInstance().request<Product[]>({ method: HttpMethod.GET, url: '/products' });
  return data;
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
Ensure `OptiCoreProvider` wraps your component tree before calling `ApiClient.getInstance()`.

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
