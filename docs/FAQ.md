# Frequently Asked Questions

---

## General

### What is opticore-react-native?

A pure infrastructure library for React Native/Expo. It provides networking, state management, error handling, storage, logging, forms, theming, offline sync, and 40+ utilities — without any app-specific business logic.

### Why not just use Axios + Zustand + AsyncStorage directly?

You can. OptiCore wires them all together with:

- Auth token injection and refresh built into the HTTP client
- Unified storage API with automatic JSON serialization
- Error classification (user-visible vs silent)
- Pluggable log transports (Sentry, remote, etc.)
- Offline request queue with auto-sync
- 700+ tests, 80%+ coverage — you don't have to write that

### Does it support Expo and bare React Native?

Both. OptiCore works with Expo SDK 54+ and bare React Native 0.78+. Some features (SecureStore, DeviceInfo) use Expo packages but fall back gracefully.

### Can I use it on web?

iOS and Android are fully supported. **SecureStore does not work on web** — use `storage.local` instead. Other modules work on web where React Native supports it.

---

## Installation & Setup

### What peer dependencies do I need?

```bash
npx opticore-install-peers
```

**Required peers** (consumer-provided): `react`, `react-native`, `expo`, `expo-router`, and `@tanstack/react-query`. **Optional native peers** (auto-detected via adapters, fall back to in-memory if missing): `expo-secure-store`, `@react-native-async-storage/async-storage`, `@react-native-community/netinfo`, `expo-device`, `@react-native-clipboard/clipboard`.

### Do I need to call `coreSetup.init()` manually?

No — `OptiCoreProvider` handles initialization automatically. Only call `coreSetup.init()` for non-React entry points (background tasks, test setup).

### How do I configure dev vs production?

```typescript
<OptiCoreProvider config={{
  api: {
    baseURL: __DEV__ ? 'http://localhost:3000' : 'https://api.myapp.com',
  },
  logger: {
    level: __DEV__ ? LogLevel.DEBUG : LogLevel.WARN,
  },
  features: {
    debugMode: __DEV__,
  },
}}>
```

---

## API Client

### How do I add custom headers to every request?

```typescript
api: {
  baseURL: 'https://api.example.com',
  headers: {
    'X-App-Version': '2.1.0',
    'X-Platform': Platform.OS,
  },
}
```

### How does token refresh work?

Configure `onTokenRefresh` in the API config. When a 401 is received, OptiCore calls this function, saves the new token, and retries the original request once automatically.

```typescript
api: {
  getAuthToken: () => storage.secure.get('token'),
  onTokenRefresh: async () => {
    const { data } = await axios.post('/auth/refresh', { refresh_token });
    await storage.secure.set('token', data.access_token);
    return data.access_token;
  },
}
```

### Can I use multiple API base URLs?

Yes. Create additional Axios instances directly for secondary APIs while using `ApiClient` for your primary:

```typescript
const secondaryApi = axios.create({ baseURL: 'https://cdn.example.com' });
```

### What happens when a request fails?

`ApiClient` rejects with an `ApiError` (it extends `RenderError`) carrying the HTTP `status`, `url`, and response `data`. Branch on `status`, and use `toMessage()` for a user-facing message:

```typescript
import { api, ApiError, toMessage } from 'opticore-react-native';

try {
  await api.get('/protected');
} catch (e) {
  if (e instanceof ApiError && e.status === 401) {
    redirectToLogin();
  } else {
    toast(toMessage(e)); // friendly message from RenderError.userMessage, with a safe fallback
  }
}
```

> A network failure or aborted request surfaces as `ApiError` with `status === -1`.

---

## State Management

### Should I use Zustand or React Query?

- **Zustand** (`createBaseStore`, `createCrudStore`): Client state — UI state, preferences, cart
- **React Query** (`useQuery`, `useMutation`): Server state — API data, caching, background refetch
- Use both together — `OptiCoreProvider` sets up both

### How do I persist Zustand state across restarts?

Use Zustand's `persist` middleware with `StorageManager`:

```typescript
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create(
  persist((set) => ({ count: 0, increment: () => set((s) => ({ count: s.count + 1 })) }), {
    name: 'my-store',
    storage: createJSONStorage(() => AsyncStorage),
  })
);
```

---

## Storage

### When to use `local` vs `secure`?

| Data                              | Use              |
| --------------------------------- | ---------------- |
| User preferences, cache, settings | `storage.local`  |
| Auth tokens, passwords, PII       | `storage.secure` |

### Does SecureStore work on web?

No — `expo-secure-store` is iOS/Android only. On web, use `storage.local`.

### How do I clear all storage on logout?

```typescript
import { storage } from 'opticore-react-native';

await storage.clearAll();
// clears both local and secure storage
```

---

## Error Handling

> Full decision tree: [**Error Handling — Which Tool, When**](ERROR_HANDLING.md).

### When should I use `RenderError` vs `NonRenderError`?

- `RenderError`: a **render-path** failure the user must see — **throw it**, and
  `OptiCoreErrorBoundary` shows a fallback.
- `NonRenderError`: a **background/async** failure (analytics, sync). It's a
  **descriptor/log payload — do NOT throw it.** Construct it and pass it to the
  `Logger`, or read its fields at the catch site. (A React Error Boundary can't
  catch async/event errors, so throwing it is lost. Throwing is deprecated → 3.0.)

```typescript
import { Logger } from 'opticore-react-native';

// User can't proceed without their data → throw RenderError (boundary shows fallback)
throw new RenderError('Could not load your profile');

// Analytics ping failed → construct + log, never throw
try {
  await trackAnalytics('event');
} catch (cause) {
  logger.error(
    'analytics dropped',
    new NonRenderError('Analytics event dropped', {
      isSilent: true,
      shouldMonitor: true,
      cause: cause instanceof Error ? cause : undefined,
    })
  );
}
```

### How does `Result<T, E>` differ from try/catch?

`Result<T, E>` makes errors part of the return type — callers are forced to handle them. No silent swallowing.

```typescript
// With Result — caller must check
const result = parseConfig(json);
if (result.isErr()) showError(result); // compiler warns if you forget

// With throw — easy to forget the catch
const config = parseConfig(json); // what if it throws?
```

---

## Theme

### How do I make my styles reactive to theme changes?

Use `useTheme()` inside the component:

```typescript
function Card() {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ backgroundColor: colors.surface, padding: spacing.md }}>
      ...
    </View>
  );
}
```

Avoid reading `themeControl.current` inside components — it won't trigger re-renders. Use the `useTheme` hook (reactive) in components; the `themeControl` facade is for imperative/non-component code.

### Does dark mode follow the OS setting automatically?

Yes, when `theme.defaultMode = 'system'` (the default). It uses React Native's `Appearance` API.

---

## Offline Sync

### What happens to queued requests if the app is killed?

The queue is persisted in AsyncStorage (`persistQueue: true` by default). On next launch, the queue is restored and processed when connectivity is available.

### Can I enqueue requests even when online?

Yes. You can always enqueue — the sync engine processes the queue immediately when online.

---

## Forms

### Does `useFormState` support async validation?

Yes — use Zod's `.refine()` with an async callback:

```typescript
username: z.string().refine(async (val) => !(await checkUsernameExists(val)), {
  message: 'Username taken',
});
```

### Can I use the masks independently of `useFormState`?

Yes — masks are pure functions:

```typescript
import { applyPhoneMask } from 'opticore-react-native/forms';
const formatted = applyPhoneMask('5551234567'); // '(555) 123-4567'
```

---

## Performance

### Is it tree-shakable?

Yes. Import only what you need:

```typescript
import { capitalize } from 'opticore-react-native/utils'; // only capitalize
import { useDebounce } from 'opticore-react-native/hooks'; // only debounce
```

### What's the bundle size?

~50KB gzipped for the full package. Individual modules are much smaller.

---

## Troubleshooting

### "Cannot find module 'opticore-react-native'"

```bash
npm install opticore-react-native
npx expo install  # or pod install for bare RN
```

### "ApiClient: not configured" error

Ensure `OptiCoreProvider` wraps your root component **before** any hook or service call is made.

### TypeScript path errors

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "strict": true
  }
}
```

### SecureStore throws on web

Use `storage.local` for web-compatible storage. See [Architecture → Platform Support](./ARCHITECTURE.md).

---

**Still stuck?** Open a [GitHub Issue](https://github.com/dev-mahmoud-elshenawy/opticore-react-native/issues) or check the [full docs index](./INDEX.md).
