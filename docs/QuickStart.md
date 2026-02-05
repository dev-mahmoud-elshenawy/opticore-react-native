# Quick Start Guide

Get up and running with opticore-react-native in less than 15 minutes.

## Prerequisites

- Node.js 18+
- React Native development environment
- Expo CLI (recommended) or vanilla React Native

## Step 1: Install Package

```bash
npm install opticore-react-native
# or
yarn add opticore-react-native
```

## Step 2: Install Peer Dependencies

```bash
npm install react react-native expo @tanstack/react-query zustand axios
```

## Step 3: Initialize Configuration

Create a configuration file or add to your app entry point:

```typescript
// App.tsx
import { CoreSetup } from 'opticore-react-native';

CoreSetup.initialize({
  apiBaseURL: 'https://api.yourapp.com',
  apiTimeout: 10000,
  enableLogging: __DEV__,
  storagePrefix: 'myapp_',
});
```

## Step 4: Wrap App with CoreProvider

```typescript
import { CoreProvider } from 'opticore-react-native';

export default function App() {
  return (
    <CoreProvider>
      {/* Your app components */}
      <YourRootNavigator />
    </CoreProvider>
  );
}
```

## Step 5: Make Your First API Call

```typescript
import { ApiClient } from 'opticore-react-native';
import { useAsyncState } from 'opticore-react-native/hooks';

// Define your API function
const fetchUsers = async () => {
  const apiClient = ApiClient.getInstance();
  const response = await apiClient.get('/users');
  return response.data;
};

// Use in component
function UserList() {
  const { data, loading, error, execute } = useAsyncState(fetchUsers);

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
}
```

## Step 6: Use Storage

```typescript
import { StorageManager } from 'opticore-react-native';

// Save data
await StorageManager.set('user_id', '12345');

// Retrieve data
const userId = await StorageManager.get('user_id');

// Save sensitive data
await StorageManager.setSecure('auth_token', 'secret_token');
```

## Step 7: Add Logging

```typescript
import { Logger } from 'opticore-react-native';

Logger.info('App started');
Logger.debug('Debug info', { user: 'john' });
Logger.error('Something went wrong', error);
```

---

## Common Patterns

### Authentication Flow

```typescript
import { ApiClient, StorageManager } from 'opticore-react-native';

// Login
async function login(email: string, password: string) {
  const apiClient = ApiClient.getInstance();
  const response = await apiClient.post('/auth/login', { email, password });
  
  // Save token
  await StorageManager.setSecure('auth_token', response.data.token);
  
  return response.data;
}

// Auto-attach token to requests (already configured in ApiClient interceptors)
```

### State Management with Zustand

```typescript
import { create } from 'zustand';

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// Use in component
function Profile() {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  
  return (
    <View>
      <Text>{user?.name}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

### Error Handling

```typescript
import { RenderError, NonRenderError } from 'opticore-react-native';

try {
  await fetchData();
} catch (error) {
  if (error instanceof RenderError) {
    // Show to user
    Alert.alert('Error', error.message);
  } else {
    // Log only
    Logger.error('Background error', error);
  }
}
```

---

## Next Steps

- Read [Architecture Guide](./Architecture.md) to understand the system
- Check [API Reference](./API.md) for detailed documentation
- Review [Testing Guide](./Testing.md) for testing patterns
- See [Configuration Guide](./Configuration.md) for all options

---

## Troubleshooting

### "Cannot find module '@tanstack/react-query'"

Install peer dependencies:
```bash
npm install @tanstack/react-query
```

### "ApiClient not initialized"

Make sure to call `CoreSetup.initialize()` before using ApiClient:
```typescript
CoreSetup.initialize({ apiBaseURL: 'https://api.example.com' });
```

### TypeScript errors

Ensure `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true
  }
}
```

---

**Estimated time**: 10-15 minutes  
**Next**: Explore [examples](../examples/) for real-world usage
