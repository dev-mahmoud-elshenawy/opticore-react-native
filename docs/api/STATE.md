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
  | { type: 'idle' }
  | { type: 'loading'; previousData?: T }
  | { type: 'success'; data: T }
  | { type: 'error'; error: Error; previousData?: T };
```

### Helper Functions

```typescript
import {
  createAsyncState,
  toLoading,
  toSuccess,
  toError,
  toIdle,
  isIdle,
  isLoading,
  isSuccess,
  isError,
} from 'opticore-react-native/state';

// Create initial state
const state = createAsyncState<User[]>(); // { type: 'idle' }

// Transition helpers (toLoading/toError accept the prior state to preserve previousData)
const loading = toLoading<User[]>(); // { type: 'loading' }
const success = toSuccess([user1, user2]); // { type: 'success', data: [...] }
const error = toError(new Error('Failed')); // { type: 'error', error: Error }

// Type guards
if (isSuccess(state)) {
  console.log(state.data); // typed as T
}
```

### Usage in a Store

```typescript
import { create } from 'zustand';
import {
  api,
  AsyncState,
  toLoading,
  toSuccess,
  toError,
  createAsyncState,
} from 'opticore-react-native';

interface UserStore {
  users: AsyncState<User[]>;
  fetchUsers: () => Promise<void>;
}

const useUserStore = create<UserStore>((set) => ({
  users: createAsyncState(),
  fetchUsers: async () => {
    set({ users: toLoading() });
    try {
      const data = await api.get<User[]>('/users');
      set({ users: toSuccess(data) });
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
): UseBoundStore<StoreApi<T>>;
```

### StoreConfig

```typescript
interface StoreConfig<T> {
  name: string; // DevTools display name + persistence key
  initialState: T; // Used by reset()
  devtools?: boolean; // default: true in __DEV__
  persist?: boolean; // persist via OptiCore storage (default: false)
  partialize?: (state: T) => Partial<T>; // only meaningful when persist is true
}
```

### Persistence

Set `persist: true` to save the store through OptiCore's storage layer (its auto-resolved
AsyncStorage adapter) and rehydrate it on startup — no custom adapter needed. The store's `name`
is used as the storage key. Use `partialize` to persist only a slice (excluding transient/derived
fields keeps writes small):

```typescript
export const useStore = createBaseStore<State>(
  {
    name: 'my-store',
    initialState,
    persist: true,
    partialize: (state) => ({ items: state.items }), // don't persist transient/derived fields
  },
  (set) => ({
    /* ...actions... */
  })
);
```

For a store built **without** `createBaseStore` (e.g. a plain `create()(persist(...))`), use the
storage factory directly:

```typescript
import { createPersistStorage } from 'opticore-react-native/state';
import { persist } from 'zustand/middleware';

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      /* ... */
    }),
    {
      name: 'my-store',
      storage: createPersistStorage<State>(),
    }
  )
);
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

## ClientStore (`createClientStore`)

A thin factory for **client-only UI state** (bookmarks, preferences, filters) that returns a
**ready-to-use React hook** — no `StoreProvider`/`useStore` wiring. Persistence, when enabled,
routes through OptiCore's storage layer, so you never hand-wire `zustand` + `persist` +
`createPersistStorage()` yourself.

```typescript
function createClientStore<T extends object>(
  config: ClientStoreConfig<T>,
  initializer: StateCreator<T, [], []>
): UseBoundStore<StoreApi<T>>;

interface ClientStoreConfig<T> {
  name: string; // devtools name + (when persisting) storage key
  persist?: boolean; // default false — routes through OptiCore storage
  partialize?: (state: T) => Partial<T>; // what to persist
  devtools?: boolean; // default __DEV__
}
```

### Example

```typescript
import { createClientStore } from 'opticore-react-native/state';

interface SavedState {
  items: Article[];
  isSaved: (url: string) => boolean;
  toggle: (article: Article) => void;
}

export const useSavedStore = createClientStore<SavedState>(
  { name: 'saved-articles', persist: true, partialize: (s) => ({ items: s.items }) },
  (set, get) => ({
    items: [],
    isSaved: (url) => get().items.some((a) => a.url === url),
    toggle: (article) =>
      set((state) => ({
        items: state.items.some((a) => a.url === article.url)
          ? state.items.filter((a) => a.url !== article.url)
          : [article, ...state.items],
      })),
  })
);

// In a component:
const items = useSavedStore((s) => s.items);
const toggle = useSavedStore((s) => s.toggle);
```

> **Which factory?** `createClientStore` — client/UI state as a React hook (plain `set`, no
> immer). `createCrudStore` — a CRUD-over-API resource. `createBaseStore` — a DI-scoped
> `zustand/vanilla` store consumed via `StoreProvider` + `useStore`.

---

## CrudStore (StoreFactory)

Pre-built store for standard CRUD operations with async state management.

```typescript
function createCrudStore<T, CustomActions = {}>(
  config: CrudStoreConfig<T>,
  customActionsCreator?: (set, get) => CustomActions
): UseBoundStore<CrudStore<T> & CustomActions>;
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
import { api } from 'opticore-react-native';
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
        const data = await api.get<Product[]>('/products');
        return data;
      },
      fetchById: async (id) => {
        const data = await api.get<Product>(`/products/${id}`);
        return data;
      },
      create: async (data) => {
        const created = await api.post<Product>('/products', data);
        return created;
      },
      update: async (id, data) => {
        const updated = await api.put<Product>(`/products/${id}`, data);
        return updated;
      },
      delete: async (id) => {
        await api.delete(`/products/${id}`);
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
import { StateObserver } from 'opticore-react-native/state';

import { stateObserver } from 'opticore-react-native';
// stateObserver is the facade — no getInstance() needed.

// Subscribe to a store. The callback receives (newState, oldState, storeName).
// Use the optional `filter` to only fire when a slice you care about changes.
const unsubscribe = observer.subscribe(
  useCartStore,
  (newState, oldState) => {
    if (newState.total > 100) {
      showFreeShippingBanner();
    }
  },
  { filter: (newState, oldState) => newState.total !== oldState.total }
);

// Cleanup
unsubscribe();
```

---

## React Query Integration

`OptiCoreProvider` wraps your app with `QueryClientProvider`. Use `@tanstack/react-query` hooks directly.

### createQueryClient

`createQueryClient()` builds the `QueryClient` OptiCore wires into `OptiCoreProvider`, pre-configured with an
error-aware retry policy. It reads `ApiError`'s `isRetryable`/`retryAfterMs` (see
[Error Handling](./ERRORS.md#apierror)) instead of inspecting raw status codes:

- **Actionable failures** (`400/401/403/404/409/422`) are **never retried** — the caller must fix something first.
- **Transient failures** (network errors, `408`, `429`, all `5xx`) **are retried** — up to 2 times for queries, 1 time
  for mutations — with exponential backoff capped at 30s.
- When the server sends a `Retry-After` header (e.g. on a `429`), the retry delay **honors it** (clamped to 30s)
  instead of using the generic backoff curve.

```typescript
import { createQueryClient } from 'opticore-react-native';

// Defaults are usually enough — pass overrides only when you need to deviate:
const queryClient = createQueryClient({
  defaultOptions: { queries: { staleTime: 0 } }, // your values win over the defaults
});
```

`createQueryHook` and `useApiMutation` build on the same client and need no special handling for `429`/`503` —
retries and backoff happen automatically. To override query config for a single query (and the retry caveat),
see [React Query Integration](../REACT_QUERY.md).

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from 'opticore-react-native';

// Fetch with caching
function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api.get<Product[]>('/products'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutations with optimistic updates
function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: Partial<Product>) => api.post<Product>('/products', product),
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

---

## Component-Level Async State (useAsyncState)

For one-off async operations inside a component (not store-backed), use the
`useAsyncState` hook. It exposes `isLoading` (not `loading`) and a `run` function
that takes a `Promise<T>` directly — there is no `execute`.

```typescript
import { useAsyncState } from 'opticore-react-native/hooks';
import { api } from 'opticore-react-native';

function UserList() {
  const { data, isLoading, error, run } = useAsyncState<User[]>();

  useEffect(() => {
    // api.get returns the response body (User[]) directly
    run(api.get<User[]>('/users'));
  }, []);

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  return <List data={data} />;
}
```

**Signature**: `useAsyncState<T>(initialData: T | null = null)`

**Returns**:

```typescript
{
  isLoading: boolean;
  data: T | null;
  error: Error | null;
  run: (promise: Promise<T>) => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
  reset: () => void;
}
```

> See [HOOKS.md](./HOOKS.md) for full `useAsyncState` documentation.
