# Frequently Asked Questions

## General

### What is opticore-react-native?

opticore is a pure infrastructure library for React Native/Expo apps. It provides networking, state management, error handling, storage, logging, and utilities without any app-specific business logic.

### Why use opticore instead of building from scratch?

- **Saves time**: Pre-built infrastructure modules
- **Best practices**: Battle-tested patterns
- **Type-safe**: Full TypeScript support
- **Well-tested**: 83%+ code coverage
- **Maintained**: Active development and updates

### What's the difference between opticore and other libraries?

- **vs Redux**: opticore uses Zustand (simpler, less boilerplate)
- **vs Axios directly**: opticore adds auth interceptors, logging, error handling
- **vs custom solutions**: opticore is tested, documented, and maintained

---

## Installation & Setup

### What are the peer dependencies?

```json
{
  "react": "19+",
  "react-native": "0.78+",
  "expo": "54+",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^5.0.0",
  "axios": "^1.7.0"
}
```

### Do I need Expo or can I use vanilla React Native?

Both work! opticore is designed for Expo but also works with vanilla React Native. Some features (like SecureStore) require Expo packages.

### How do I configure for production vs development?

```typescript
CoreSetup.initialize({
  apiBaseURL: __DEV__ ? 'http://localhost:3000' : 'https://api.production.com',
  enableLogging: __DEV__,
  logLevel: __DEV__ ? 'debug' : 'error',
});
```

---

## API Client

### How do I add custom headers?

```typescript
CoreSetup.initialize({
  apiHeaders: {
    'X-Custom-Header': 'value',
    'X-App-Version': '1.0.0',
  },
});
```

### How do I handle authentication tokens?

Tokens are automatically handled by the auth interceptor. Just save the token:

```typescript
await StorageManager.setSecure('auth_token', token);
```

The ApiClient will automatically attach it to requests.

### How do I handle token refresh?

Extend the auth interceptor:

```typescript
apiClient.client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
      const newToken = await refreshToken();
      await StorageManager.setSecure('auth_token', newToken);
      
      // Retry original request
      return apiClient.client.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Can I use multiple API endpoints?

Yes, create multiple ApiClient instances or use axios directly for secondary APIs.

---

## State Management

### Should I use Zustand or React Query?

- **Zustand**: For client state (user preferences, UI state)
- **React Query**: For server state (API data, caching)
- Use both together! opticore includes both.

### How do I persist Zustand state?

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStore = create(
  persist(
    (set) => ({ /* state */ }),
    {
      name: 'my-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### What's the AsyncState pattern?

AsyncState manages loading, error, and data states for async operations:

```typescript
const { data, loading, error, execute } = useAsyncState(fetchData);
```

It's a wrapper around common async patterns.

---

## Storage

### When should I use regular vs secure storage?

- **Regular** (AsyncStorage): Non-sensitive data (preferences, cache)
- **Secure** (SecureStore): Sensitive data (tokens, passwords)

### How do I clear all storage?

```typescript
await StorageManager.clear(); // Clears regular storage
await StorageManager.clearSecure(); // Clears secure storage
```

### Can I use Storage outside React components?

Yes! StorageManager works anywhere:

```typescript
import { StorageManager } from 'opticore-react-native';

await StorageManager.set('key', 'value');
```

---

## Error Handling

### What's the difference between RenderError and NonRenderError?

- **RenderError**: Show to user (validation errors, API errors)
- **NonRenderError**: Log only (developer errors, unexpected issues)

### How do I create custom errors?

```typescript
export class PaymentError extends RenderError {
  constructor(message: string) {
    super(message, 'PAYMENT_ERROR');
  }
}

throw new PaymentError('Insufficient funds');
```

### How do I handle errors globally?

Use Error Boundaries for React errors:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>
```

---

## Testing

### How do I test components using opticore?

Use the provided test helpers:

```typescript
import { MockApiClient } from 'opticore-react-native/test/mocks';
import { renderWithProviders } from 'opticore-react-native/test/helpers';

const mockApi = new MockApiClient();
mockApi.mockGet('/users', { data: [...] });

const { getByText } = renderWithProviders(<UserList />);
```

### How do I mock the ApiClient?

```typescript
import { MockApiClient } from 'opticore-react-native/test/mocks';

const mockApi = new MockApiClient();
mockApi.mockGet('/endpoint', { data: 'response' });
mockApi.mockPost('/endpoint', { success: true });
```

See [Testing Guide](./Testing.md) for details.

---

## Performance

### Is opticore tree-shakable?

Yes! All utilities are exported individually and tree-shakable:

```typescript
// Only imports capitalize function
import { capitalize } from 'opticore-react-native/utils/string';
```

### What's the bundle size?

Core bundle: ~50KB gzipped (with all modules)  
Utilities only: ~10KB gzipped

### How do I optimize for production?

1. Use tree-shaking (import only what you need)
2. Enable minification in build
3. Use React Query for caching
4. Disable logging in production

---

## TypeScript

### Do I need TypeScript?

Recommended but not required. opticore works with JavaScript but benefits from TypeScript's type safety.

### How do I type my API responses?

```typescript
interface User {
  id: string;
  name: string;
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/users');
  return response.data;
};
```

### Where are the type definitions?

All types are exported from `opticore-react-native/types`.

---

## Migration

### How do I migrate from Redux?

See [Migration Guide](./Migration.md) for step-by-step instructions.

### Can I use opticore alongside existing state management?

Yes! You can gradually adopt opticore while keeping existing Redux/MobX code.

### How do I migrate from fetch to ApiClient?

Replace fetch calls with ApiClient:

```typescript
// Before
const response = await fetch('/users');
const data = await response.json();

// After
const response = await apiClient.get('/users');
const data = response.data;
```

---

## Troubleshooting

### "Cannot find module" errors

Ensure all peer dependencies are installed:
```bash
npm install react react-native expo @tanstack/react-query zustand axios
```

### App crashes on startup

Check that CoreSetup is initialized before using any infrastructure:
```typescript
CoreSetup.initialize({ apiBaseURL: '...' });
```

### TypeScript errors with imports

Ensure path mappings in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

---

## Contributing

### How do I contribute?

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

### How do I report bugs?

Open an issue on [GitHub](https://github.com/dev-mahmoud-elshenawy/opticore-react-native/issues).

### Can I request features?

Yes! Open a discussion on [GitHub Discussions](https://github.com/dev-mahmoud-elshenawy/opticore-react-native/discussions).

---

**Still have questions?** Check the [full documentation](./README.md) or open a [discussion](https://github.com/dev-mahmoud-elshenawy/opticore-react-native/discussions).
