# State Management API Reference

State management patterns and stores built on Zustand and React Query.

## AsyncState Pattern

Manage async operations with loading, error, and data states.

### useAsyncState\<T\>(asyncFn, options?)

Hook for managing async operations.

```typescript
import { useAsyncState } from 'opticore-react-native/hooks';

const fetchUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data;
};

function UserList() {
  const { data, loading, error, execute } = useAsyncState(fetchUsers);
  
  useEffect(() => {
    execute();
  }, []);
  
  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;
  return <List data={data} />;
}
```

**Parameters**:
- `asyncFn`: () => Promise\<T\> - Async function to execute
- `options?`: { initialData?: T } - Optional initial data

**Returns**:
```typescript
{
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute:() => Promise<void>;
  reset: () => void;
}
```

---

## Zustand Stores

### BaseStore Pattern

Foundation for creating Zustand stores.

```typescript
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

// Use in component
function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  
  return <Button title={`Count: ${count}`} onPress={increment} />;
}
```

---

### With Persistence

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useUserStore = create(
  persist<UserState>(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

### With DevTools

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useStore = create(
  devtools<State>((set) => ({
    // state
  }), { name: 'MyStore' })
);
```

---

## React Query Integration

### QueryProvider

Configured React Query provider (wrapped by CoreProvider).

```typescript
import { CoreProvider } from 'opticore-react-native';

// CoreProvider includes QueryProvider automatically
<CoreProvider>
  <App />
</CoreProvider>
```

---

### Using React Query

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query
function UserProfile({ userId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.get(`/users/${userId}`).then(r => r.data),
  });
  
  if (isLoading) return <Loading />;
  return <Profile user={data} />;
}

// Mutation
function UpdateProfile() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (data) => apiClient.put('/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
  
  return <Button onPress={() => mutation.mutate(newData)} />;
}
```

---

## State Patterns

### Global State

```typescript
// stores/useAuthStore.ts
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { user, token } = response.data;
    
    await StorageManager.setSecure('auth_token', token);
    set({ user, token });
  },
  
  logout: async () => {
    await StorageManager.remove('auth_token');
    set({ user: null, token: null });
  },
}));
```

---

### Local State with useState

```typescript
function SearchForm() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  
  const { data } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchAPI(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });
  
  return <TextInput value={query} onChangeText={setQuery} />;
}
```

---

### Server State vs Client State

**Client State** (Zustand):
- User preferences
- UI state (modals, tabs)
- Form state
- App settings

**Server State** (React Query):
- API data
- User profiles
- Lists and collections
- Real-time data

---

## Example: Complete State Setup

```typescript
// 1. Auth Store (Global Client State)
export const useAuthStore = create<AuthState>(persist(
  (set) => ({
    user: null,
    login: async (credentials) => { /* ... */ },
    logout: async () => { /* ... */ },
  }),
  { name: 'auth-storage' }
));

// 2. API Data (Server State)
function UserDashboard() {
  const { user } = useAuthStore();
  
  const { data: stats } = useQuery({
    queryKey: ['stats', user?.id],
    queryFn: () => fetchStats(user.id),
  });
  
  return <Dashboard stats={stats} />;
}

// 3. Async State (One-off Operations)
function ExportData() {
  const { loading, execute } = useAsyncState(async () => {
    const data = await apiClient.get('/export');
    await downloadFile(data);
  });
  
  return <Button loading={loading} onPress={execute} title="Export" />;
}
```

---

**See also**:
- [Hooks API](./Hooks.md)
- [Architecture](../Architecture.md)
- [Examples](../../examples/)
