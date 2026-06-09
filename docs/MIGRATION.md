# Migration Guide

Step-by-step guide for migrating your existing React Native project to OptiCore.

---

## From Plain Axios

**Before:**
```typescript
// Scattered setup across files
const api = axios.create({ baseURL: 'https://api.example.com' });

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function fetchUsers() {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
```

**After:**
```typescript
import { ApiClient, HttpMethod } from 'opticore-react-native';

// Configured once in OptiCoreProvider
<OptiCoreProvider config={{
  api: {
    baseURL: 'https://api.example.com',
    getAuthToken: () => storage.secure.get('token'),
    onTokenRefresh: () => refreshToken(),
  },
}}>

// Used anywhere — auth, logging, error handling automatic
async function fetchUsers() {
  const { data } = await ApiClient.getInstance().request<User[]>({ method: HttpMethod.GET, url: '/users' });
  return data;
}
```

---

## From Redux

**Before:**
```typescript
// actions.ts
export const FETCH_USERS_REQUEST = 'FETCH_USERS_REQUEST';
export const FETCH_USERS_SUCCESS = 'FETCH_USERS_SUCCESS';
export const FETCH_USERS_FAILURE = 'FETCH_USERS_FAILURE';

// reducer.ts
function usersReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_USERS_REQUEST: return { ...state, loading: true };
    case FETCH_USERS_SUCCESS: return { ...state, loading: false, data: action.payload };
    case FETCH_USERS_FAILURE: return { ...state, loading: false, error: action.error };
    default: return state;
  }
}

// thunk.ts
export const fetchUsers = () => async (dispatch) => {
  dispatch({ type: FETCH_USERS_REQUEST });
  try {
    const { data } = await api.get('/users');
    dispatch({ type: FETCH_USERS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: FETCH_USERS_FAILURE, error });
  }
};
```

**After:**
```typescript
// One file — store + actions + async state
import { ApiClient, HttpMethod } from 'opticore-react-native';
import { createCrudStore } from 'opticore-react-native/state';

export const useUserStore = createCrudStore<User>({
  name: 'UserStore',
  api: {
    fetchAll: () => ApiClient.getInstance().request<User[]>({ method: HttpMethod.GET, url: '/users' }).then(r => r.data),
    fetchById: (id) => ApiClient.getInstance().request<User>({ method: HttpMethod.GET, url: `/users/${id}` }).then(r => r.data),
    create: (data) => ApiClient.getInstance().request<User>({ method: HttpMethod.POST, url: '/users', data: data }).then(r => r.data),
    update: (id, data) => ApiClient.getInstance().request<User>({ method: HttpMethod.PUT, url: `/users/${id}`, data: data }).then(r => r.data),
    delete: (id) => ApiClient.getInstance().request({ method: HttpMethod.DELETE, url: `/users/${id}` }),
  },
});

// In component — fully typed, no boilerplate
const { items, status, fetchAll } = useUserStore();
```

**Store Provider migration:**
```typescript
// Remove Redux Provider + configureStore
// Replace with OptiCoreProvider
<OptiCoreProvider config={...}>
  <App />
</OptiCoreProvider>
```

---

## From MobX

**Before:**
```typescript
class UserStore {
  @observable users: User[] = [];
  @observable loading = false;
  @observable error: Error | null = null;

  @action
  async fetchUsers() {
    this.loading = true;
    try {
      this.users = await api.get('/users');
    } catch (e) {
      this.error = e as Error;
    } finally {
      this.loading = false;
    }
  }
}
```

**After:**
```typescript
// Same mental model — observable state replaced with Zustand + AsyncState
import { createBaseStore } from 'opticore-react-native/state';
import { ApiClient, HttpMethod, toLoading, toSuccess, toError } from 'opticore-react-native';

export const useUserStore = createBaseStore(
  { name: 'UserStore', initialState: { users: createAsyncState<User[]>() } },
  (set) => ({
    users: createAsyncState<User[]>(),
    fetchUsers: async () => {
      set({ users: toLoading() });
      try {
        const { data } = await ApiClient.getInstance().request<User[]>({ method: HttpMethod.GET, url: '/users' });
        set({ users: toSuccess(data) });
      } catch (e) {
        set({ users: toError(e as Error) });
      }
    },
  })
);
```

---

## From AsyncStorage (direct)

**Before:**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.setItem('user', JSON.stringify(user));
const raw = await AsyncStorage.getItem('user');
const user = raw ? JSON.parse(raw) : null;
```

**After:**
```typescript
import { StorageManager } from 'opticore-react-native';
const storage = StorageManager.getInstance();

// Serialization is automatic
await storage.local.set('user', user);
const user = await storage.local.get<User>('user');
```

---

## From custom Logger (console.log)

**Before:**
```typescript
if (__DEV__) {
  console.log('[Auth]', 'Login successful', user);
  console.error('[Auth]', 'Login failed', error);
}
```

**After:**
```typescript
import { Logger } from 'opticore-react-native';
const logger = Logger.getInstance();

// Level-based filtering, structured metadata, pluggable transports
logger.info('Login successful', { userId: user.id });
logger.error('Login failed', error);

// In production: add Sentry transport once — all logger.error() calls go there
logger.addTransport({
  name: 'sentry',
  minLevel: LogLevel.ERROR,
  write: (entry) => Sentry.captureMessage(entry.message),
});
```

---

## From react-hook-form (standalone)

**Before:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

**After:**
```typescript
import { useFormState } from 'opticore-react-native/forms';

// Same power, cleaner API, masks included
const { errors, handleSubmit, setValue, watch } = useFormState({
  schema,
  defaultValues: { email: '', password: '' },
  mode: 'onChange',
});
// Plus: phoneMask, creditCardMask, currencyMask, useFieldValidation
```

---

## Migration Checklist

- [ ] Install `opticore-react-native` and peer deps
- [ ] Add `OptiCoreProvider` to app root with `api.baseURL`
- [ ] Remove `axios.create()` calls — use `ApiClient.getInstance()`
- [ ] Migrate auth token injection to `getAuthToken` config
- [ ] Replace `AsyncStorage` direct calls with `StorageManager`
- [ ] Replace `console.log` with `Logger.getInstance()`
- [ ] Migrate Redux/MobX stores to `createBaseStore` or `createCrudStore`
- [ ] Replace error `try/catch` with `RenderError`/`NonRenderError`
- [ ] Add `OptiCoreErrorBoundary` around root navigator

---

## See Also

- [Quick Start](./QUICK_START.md) — Full setup walkthrough
- [Configuration](./CONFIGURATION.md) — All config options
- [Architecture](./ARCHITECTURE.md) — How the library is structured

## Migrating to opticore-react-native

This guide helps you migrate from other solutions to opticore.

## Table of Contents

- [From Vanilla React Native](#from-vanilla-react-native)
- [From Redux](#from-redux)
- [From MobX](#from-mobx)
- [From Axios Directly](#from-axios-directly)
- [From Custom Hooks](#from-custom-hooks)

---

## From Vanilla React Native

### Before: Direct API Calls

```typescript
// ❌ Old approach
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  fetch('https://api.example.com/users')
    .then(res => res.json())
    .then(data => setData(data))
    .catch(err => setError(err))
    .finally(() => setLoading(false));
}, []);
```

### After: useAsyncState

```typescript
// ✅ New approach
import { useAsyncState } from 'opticore-react-native/hooks';
import { ApiClient, HttpMethod } from 'opticore-react-native';

const fetchUsers = () => ApiClient.getInstance().request({ method: HttpMethod.GET, url: '/users' });

function MyComponent() {
  const { data, loading, error, execute } = useAsyncState(fetchUsers);
  
  useEffect(() => {
    execute();
  }, []);
  
  // Automatic error handling, loading states, etc.
}
```

**Benefits**:
- Automatic error handling
- Loading state management
- Error classification
- Retry logic built-in

---

## From Redux

### Before: Redux Store

```typescript
// ❌ Old Redux approach
// actions/users.js
export const fetchUsers = () => async (dispatch) => {
  dispatch({ type: 'FETCH_USERS_REQUEST' });
  try {
    const response = await fetch('/users');
    const data = await response.json();
    dispatch({ type: 'FETCH_USERS_SUCCESS', payload: data });
  } catch (error) {
    dispatch({ type: 'FETCH_USERS_FAILURE', error });
  }
};

// reducers/users.js
const initialState = { data: null, loading: false, error: null };

export default function usersReducer(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_USERS_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_USERS_SUCCESS':
      return { data: action.payload, loading: false, error: null };
    case 'FETCH_USERS_FAILURE':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
}
```

### After: Zustand Store

```typescript
// ✅ New Zustand approach
import { create } from 'zustand';
import { ApiClient, HttpMethod } from 'opticore-react-native';

interface UserState {
  users: User[];
  loading: boolean;
  error: Error | null;
  fetchUsers: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,
  error: null,
  
  fetchUsers: async () => {
    set({ loading: true });
    try {
      const response = await ApiClient.getInstance().request({ method: HttpMethod.GET, url: '/users' });
      set({ users: response.data, loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: error as Error });
    }
  },
}));

// Usage
function MyComponent() {
  const { users, loading, fetchUsers } = useUserStore();
  
  useEffect(() => {
    fetchUsers();
  }, []);
}
```

**Benefits**:
- Less boilerplate (no actions, reducers, types)
- Better TypeScript support
- Simpler API
- Smaller bundle size

**Migration Steps**:
1. Replace Redux store with Zustand stores
2. Convert actions to store methods
3. Remove action types, reducers
4. Update components to use Zustand hooks
5. Remove Redux dependencies

---

## From MobX

### Before: MobX Store

```typescript
// ❌ Old MobX approach
import { makeObservable, observable, action } from 'mobx';

class UserStore {
  users = [];
  loading = false;
  error = null;

  constructor() {
    makeObservable(this, {
      users: observable,
      loading: observable,
      error: observable,
      fetchUsers: action,
    });
  }

  async fetchUsers() {
    this.loading = true;
    try {
      const response = await fetch('/users');
      this.users = await response.json();
    } catch (error) {
      this.error = error;
    } finally {
      this.loading = false;
    }
  }
}
```

### After: Zustand Store

```typescript
// ✅ New Zustand approach
import { create } from 'zustand';
import { ApiClient, HttpMethod } from 'opticore-react-native';

export const useUserStore = create((set) => ({
  users: [],
  loading: false,
  error: null,
  
  fetchUsers: async () => {
    set({ loading: true });
    try {
      const response = await ApiClient.getInstance().request({ method: HttpMethod.GET, url: '/users' });
      set({ users: response.data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },
}));
```

**Migration Steps**:
1. Convert MobX stores to Zustand
2. Remove `makeObservable`, decorators
3. Use functional state updates
4. Update components (observer → Zustand hook)

---

## From Axios Directly

### Before: Custom Axios Instance

```typescript
// ❌ Old approach
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
});

// Manual interceptors
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manual error handling
    return Promise.reject(error);
  }
);
```

### After: ApiClient

```typescript
// ✅ New approach
import { CoreSetup, ApiClient, HttpMethod } from 'opticore-react-native';

CoreSetup.initialize({
  apiBaseURL: 'https://api.example.com',
  apiTimeout: 10000,
});

const apiClient = ApiClient.getInstance();

// Auth, logging, error handling already configured!
const response = await apiClient.request({ method: HttpMethod.GET, url: '/users' });
```

**Benefits**:
- Built-in auth interceptor with token refresh
- Automatic error classification
- Request/response logging
- Retry logic
- TypeScript support

**Migration Steps**:
1. Replace axios instance with ApiClient
2. Move configuration to CoreSetup
3. Remove manual interceptors
4. Update API calls to use ApiClient methods

---

## From Custom Hooks

### Before: Custom useDebounce

```typescript
// ❌ Old custom hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### After: Built-in useDebounce

```typescript
// ✅ Use built-in hook
import { useDebounce } from 'opticore-react-native/hooks';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  
  // Use debouncedQuery for API calls
}
```

**Available Built-in Hooks**:
- `useDebounce` - Debounced values
- `useThrottle` - Throttled callbacks
- `useAsyncState` - Async operation state
- `useConnectivity` - Network status
- `useKeyboard` - Keyboard state
- `useOrientation` - Device orientation
- `useAppState` - App lifecycle
- `usePrevious` - Previous value

---

## Breaking Changes Between Versions

### v1.0.0

Initial release - no breaking changes.

---

## Need Help?

- Check the [documentation](./docs/)
- Open an [issue](https://github.com/dev-mahmoud-elshenawy/opticore-react-native/issues)
- Join [discussions](https://github.com/dev-mahmoud-elshenawy/opticore-react-native/discussions)
