# State Management API Reference

Zustand-based state management with `AsyncState`, `BaseStore`, `StoreFactory`, `CrudStore`, and `StateObserver`.

### Import

```typescript
import { createBaseStore, createCrudStore } from 'opticore-react-native/state';
import { AsyncState } from 'opticore-react-native';
```

---

## AsyncState Pattern

Type-safe representation of async operation state.

```typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }
```

### Helper Functions

```typescript
import {
  createAsyncState,
  toLoading, toSuccess, toError, toIdle,
  isIdle, isLoading, isSuccess, isError,
} from 'opticore-react-native/state';

// Create initial state
const state = createAsyncState<User[]>(); // { status: 'idle' }

// Transition helpers
const loading = toLoading<User[]>();              // { status: 'loading' }
const success = toSuccess([user1, user2]);        // { status: 'success', data: [...] }
const error   = toError(new Error('Failed'));     // { status: 'error', error: Error }

// Type guards
if (isSuccess(state)) {
  console.log(state.data); // typed as T
}
```

### Usage in a Store

```typescript
import { create } from 'zustand';
import { ApiClient, HttpMethod, AsyncState, toLoading, toSuccess, toError, createAsyncState } from 'opticore-react-native';

interface UserStore {
  users: AsyncState<User[]>;
  fetchUsers: () => Promise<void>;
}

const useUserStore = create<UserStore>((set) => ({
  users: createAsyncState(),
  fetchUsers: async () => {
    set({ users: toLoading() });
    try {
      const data = await ApiClient.getInstance().request<User[]>({ method: HttpMethod.GET, url: '/users' });
      set({ users: toSuccess(data.data) });
    } catch (e) {
      set({ users: toError(e as Error) });
    }
  },
}));
```

---

## BaseStore

Zustand store factory with DevTools, Immer, and built-in `reset()` / `hydrate()`.

```typescript
function createBaseStore<T>(
  config: StoreConfig<T>,
  stateCreator: StateCreator<T>
): UseBoundStore<StoreApi<T>>
```

### StoreConfig

```typescript
interface StoreConfig<T> {
  name: string;           // DevTools display name
  initialState: T;        // Used by reset()
  devtools?: boolean;     // default: true in __DEV__
}
```

### Example

```typescript
import { createBaseStore } from 'opticore-react-native/state';

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  reset: () => void;        // provided by BaseStore
  hydrate: (state: Partial<CartState>) => void;  // provided by BaseStore
}

const initialState = { items: [], total: 0 };

export const useCartStore = createBaseStore<CartState>(
  { name: 'CartStore', initialState },
  (set) => ({
    ...initialState,
    addItem: (item) => set((draft) => {
      draft.items.push(item);
      draft.total += item.price;
    }),
    removeItem: (id) => set((draft) => {
      draft.items = draft.items.filter(i => i.id !== id);
      draft.total = draft.items.reduce((sum, i) => sum + i.price, 0);
    }),
    reset: () => set(initialState),
    hydrate: (state) => set((draft) => Object.assign(draft, state)),
  })
);

// In a component
function Cart() {
  const { items, total, addItem, reset } = useCartStore();
  return (/* ... */);
}

// Outside React
const { items } = useCartStore.getState();
useCartStore.setState({ total: 0 });
```

> **Immer integration**: The `set` callback receives a mutable `draft` — no need to spread.

---

## CrudStore (StoreFactory)

Pre-built store for standard CRUD operations with async state management.

```typescript
function createCrudStore<T, CustomActions = {}>(
  config: CrudStoreConfig<T>,
  customActionsCreator?: (set, get) => CustomActions
): UseBoundStore<CrudStore<T> & CustomActions>
```

### CrudStore State

```typescript
interface CrudStore<T> {
  items: T[];
  selectedItem: T | null;
  status: AsyncState<T[] | T>;

  // Actions
  fetchAll: () => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  create: (data: Partial<T>) => Promise<void>;
  update: (id: string, data: Partial<T>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  select: (item: T | null) => void;
  reset: () => void;
}
```

All `api` methods are optional. If a CRUD action is called but the corresponding `api` method is not defined, it no-ops. In `__DEV__` mode, a console warning is emitted to help catch misconfiguration.

### Example

```typescript
import { ApiClient, HttpMethod } from 'opticore-react-native';
import { createCrudStore } from 'opticore-react-native/state';

interface Product {
  id: string;
  name: string;
  price: number;
}

export const useProductStore = createCrudStore<Product>(
  {
    name: 'ProductStore',
    api: {
      fetchAll: async () => {
        const { data } = await ApiClient.getInstance().request<Product[]>({ method: HttpMethod.GET, url: '/products' });
        return data;
      },
      fetchById: async (id) => {
        const { data } = await ApiClient.getInstance().request<Product>({ method: HttpMethod.GET, url: `/products/${id}` });
        return data;
      },
      create: async (data) => {
        const { data: created } = await ApiClient.getInstance().request<Product>({ method: HttpMethod.POST, url: '/products', data: data });
        return created;
      },
      update: async (id, data) => {
        const { data: updated } = await ApiClient.getInstance().request<Product>({ method: HttpMethod.PUT, url: `/products/${id}`, data: data });
        return updated;
      },
      delete: async (id) => {
        await ApiClient.getInstance().request({ method: HttpMethod.DELETE, url: `/products/${id}` });
      },
    },
  }
);

// In a component
function ProductList() {
  const { items, status, fetchAll, delete: deleteProduct } = useProductStore();

  useEffect(() => { fetchAll(); }, []);

  if (isLoading(status)) return <Spinner />;
  if (isError(status)) return <Error message={status.error.message} />;

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onDelete={() => deleteProduct(item.id)}
        />
      )}
    />
  );
}
```

---

## StateObserver

Subscribe to Zustand store changes outside of React.

```typescript
import { StateObserverImpl } from 'opticore-react-native/state';

const observer = new StateObserverImpl(useCartStore);

// Subscribe to specific state slice
const unsubscribe = observer.observe(
  (state) => state.total,
  (total, previousTotal) => {
    if (total > 100) {
      showFreeShippingBanner();
    }
  }
);

// Cleanup
unsubscribe();
```

---

## React Query Integration

`OptiCoreProvider` wraps your app with `QueryClientProvider`. Use `@tanstack/react-query` hooks directly.

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient, HttpMethod } from 'opticore-react-native';

// Fetch with caching
function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => ApiClient.getInstance().request<Product[]>({ method: HttpMethod.GET, url: '/products' }).then(r => r.data),
    staleTime: 5 * 60 * 1000,  // 5 minutes
  });
}

// Mutations with optimistic updates
function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: Partial<Product>) =>
      ApiClient.getInstance().request<Product>({ method: HttpMethod.POST, url: '/products', data: product }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

---

## See Also

- [useAsyncState hook](./HOOKS.md) — Component-level async state
- [Error Handling](./ERRORS.md) — RenderError, NonRenderError
- [Infrastructure](./INFRASTRUCTURE.md) — ApiClient for data fetching

## AsyncState Pattern

Manage async operations with loading, error, and data states.

### useAsyncState\<T\>(asyncFn, options?)

Hook for managing async operations.

```typescript
import { useAsyncState } from 'opticore-react-native/hooks';
import { ApiClient, HttpMethod } from 'opticore-react-native';

const apiClient = ApiClient.getInstance();

const fetchUsers = async () => {
  const response = await apiClient.request({ method: HttpMethod.GET, url: '/users' });
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
import { ApiClient, HttpMethod } from 'opticore-react-native';

const apiClient = ApiClient.getInstance();

// Query
function UserProfile({ userId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () =>
      apiClient.request({ method: HttpMethod.GET, url: `/users/${userId}` }).then(r => r.data),
  });
  
  if (isLoading) return <Loading />;
  return <Profile user={data} />;
}

// Mutation
function UpdateProfile() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (data) => apiClient.request({ method: HttpMethod.PUT, url: '/profile', data }),
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
    const response = await apiClient.request({
      method: HttpMethod.POST,
      url: '/auth/login',
      data: { email, password },
    });
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
    const data = await apiClient.request({ method: HttpMethod.GET, url: '/export' });
    await downloadFile(data);
  });
  
  return <Button loading={loading} onPress={execute} title="Export" />;
}
```

---

**See also**:
- [Hooks API](./HOOKS.md)
- [Architecture](../ARCHITECTURE.md)
- [Examples](../../examples/)
