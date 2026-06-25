# Testing Guide

OptiCore maintains **83%+ code coverage** with 604 passing tests across 84 test suites.
Stack: **Jest** + **React Native Testing Library** + **jest-expo**.

---

## Test Setup

Tests run with `jest-expo` preset. No extra configuration needed.

```bash
npm test                     # run all tests
npm test -- --watch          # watch mode
npm test -- --coverage       # with coverage report
npm test -- --testPathPattern=ApiClient  # run matching tests only
```

---

## Testing API Calls

Mock `axios` at the module level for deterministic tests:

```typescript
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

import { ApiClient, HttpMethod } from 'opticore-react-native';

describe('UserService', () => {
  let api: ApiClient;

  beforeEach(() => {
    api = ApiClient.getInstance();
    // request() throws if not initialized — configure once for the suite.
    api.configure({ baseURL: 'https://test.api.com' });
    jest.clearAllMocks();
  });

  it('fetches users successfully', async () => {
    // The underlying axios instance is exposed as the public `client` field.
    // request({ method: GET }) delegates to client.get(url, axiosConfig).
    const mockGet = jest.fn().mockResolvedValue({
      data: [{ id: '1', name: 'Alice' }],
      status: 200,
      headers: {},
      config: {},
    });
    api.client.get = mockGet;

    const { data } = await api.request<User[]>({ method: HttpMethod.GET, url: '/users' });

    expect(mockGet).toHaveBeenCalledWith('/users', expect.any(Object));
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe('Alice');
  });

  it('handles HTTP errors', async () => {
    const mockGet = jest.fn().mockRejectedValue({ response: { status: 404 } });
    api.client.get = mockGet;

    await expect(
      api.request({ method: HttpMethod.GET, url: '/users/999' })
    ).rejects.toThrow();
  });
});
```

---

## Testing Components with Hooks

Wrap components that use OptiCore hooks with `OptiCoreProvider`:

```typescript
import { render, waitFor } from '@testing-library/react-native';
import { OptiCoreProvider } from 'opticore-react-native';

const testConfig = {
  api: { baseURL: 'https://test.api.com' },
};

function renderWithProviders(component: React.ReactElement) {
  return render(
    <OptiCoreProvider config={testConfig}>
      {component}
    </OptiCoreProvider>
  );
}

describe('UserList', () => {
  it('displays users after fetch', async () => {
    // Mock the API — request() is the public entry point.
    jest.spyOn(ApiClient.getInstance(), 'request').mockResolvedValue({
      data: [{ id: '1', name: 'Alice' }],
      status: 200,
      headers: {},
      config: {},
    });

    const { getByText } = renderWithProviders(<UserList />);

    await waitFor(() => {
      expect(getByText('Alice')).toBeTruthy();
    });
  });
});
```

---

## Testing useAsyncState

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useAsyncState } from 'opticore-react-native/hooks';

describe('useAsyncState', () => {
  it('starts in idle state', () => {
    const { result } = renderHook(() => useAsyncState<string>());

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('transitions through loading to success', async () => {
    // run() takes a Promise<T>, not a function — pass the promise itself.
    const { result } = renderHook(() => useAsyncState<string>());

    let pending: Promise<void>;
    act(() => { pending = result.current.run(Promise.resolve('hello')); });
    expect(result.current.isLoading).toBe(true);

    await act(async () => { await pending; });
    expect(result.current.data).toBe('hello');
    expect(result.current.isLoading).toBe(false);
  });

  it('captures errors', async () => {
    const error = new Error('Network failed');
    const { result } = renderHook(() => useAsyncState<string>());

    // run() never rejects — it captures the error into state.
    await act(async () => {
      await result.current.run(Promise.reject(error));
    });

    expect(result.current.error).toBe(error);
    expect(result.current.isLoading).toBe(false);
  });
});
```

---

## Testing Stores

```typescript
import { useCartStore } from '../stores/cartStore';

describe('CartStore', () => {
  beforeEach(() => {
    useCartStore.getState().reset();
  });

  it('adds items and calculates total', () => {
    const { addItem, items, total } = useCartStore.getState();

    addItem({ id: '1', name: 'Widget', price: 9.99 });
    addItem({ id: '2', name: 'Gadget', price: 19.99 });

    expect(useCartStore.getState().items).toHaveLength(2);
    expect(useCartStore.getState().total).toBeCloseTo(29.98);
  });

  it('resets to initial state', () => {
    useCartStore.getState().addItem({ id: '1', name: 'Widget', price: 9.99 });
    useCartStore.getState().reset();

    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().total).toBe(0);
  });
});
```

---

## Testing Error Boundaries

```typescript
import { render } from '@testing-library/react-native';
import { OptiCoreErrorBoundary } from 'opticore-react-native';

const ThrowingComponent = () => {
  throw new Error('Test error');
};

// Suppress error output in tests
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

it('renders fallback on error', () => {
  const { getByText } = render(
    <OptiCoreErrorBoundary fallback={<Text>Something went wrong</Text>}>
      <ThrowingComponent />
    </OptiCoreErrorBoundary>
  );

  expect(getByText('Something went wrong')).toBeTruthy();
});

it('calls onError handler', () => {
  const onError = jest.fn();

  render(
    <OptiCoreErrorBoundary onError={onError} fallback={<View />}>
      <ThrowingComponent />
    </OptiCoreErrorBoundary>
  );

  expect(onError).toHaveBeenCalledWith(
    expect.any(Error),
    expect.objectContaining({ componentStack: expect.any(String) })
  );
});
```

---

## Testing Storage

```typescript
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { StorageManager } from 'opticore-react-native';

describe('StorageManager', () => {
  const storage = StorageManager.getInstance();

  afterEach(async () => {
    await storage.local.clear();
  });

  it('stores and retrieves values', async () => {
    await storage.local.set('user', { id: '1', name: 'Alice' });
    const user = await storage.local.get<{ id: string; name: string }>('user');

    expect(user).toEqual({ id: '1', name: 'Alice' });
  });

  it('returns null for missing keys', async () => {
    const result = await storage.local.get('nonexistent');
    expect(result).toBeNull();
  });
});
```

---

## Testing Forms

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useFormState } from 'opticore-react-native/forms';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

describe('useFormState', () => {
  it('validates on change', async () => {
    const { result } = renderHook(() =>
      useFormState({ schema, defaultValues: { email: '', password: '' }, mode: 'onChange' })
    );

    await act(async () => {
      result.current.setValue('email', 'invalid-email');
    });

    await act(async () => {
      await result.current.form.trigger('email');
    });

    expect(result.current.errors.email).toBeDefined();
    expect(result.current.isValid).toBe(false);
  });

  it('is valid with correct data', async () => {
    const { result } = renderHook(() =>
      useFormState({ schema, defaultValues: { email: '', password: '' }, mode: 'onChange' })
    );

    await act(async () => {
      result.current.setValue('email', 'alice@example.com');
      result.current.setValue('password', 'securePassword1');
      await result.current.form.trigger();
    });

    expect(result.current.isValid).toBe(true);
  });
});
```

---

## Mock Reference

| Module | Mock Path |
|---|---|
| AsyncStorage | `@react-native-async-storage/async-storage/jest/async-storage-mock` |
| NetInfo | `@react-native-community/netinfo` (auto-mocked) |
| expo-secure-store | Manual mock in `test/__mocks__/` |

---

## Coverage

```bash
npm test -- --coverage
```

Current coverage: **83.73%**

| Threshold | Requirement |
|---|---|
| Lines | 80%+ |
| Functions | 80%+ |
| Branches | 80%+ |
| Statements | 80%+ |

View detailed report: `open coverage/lcov-report/index.html`

---

## See Also

- [Architecture](./ARCHITECTURE.md) — Test structure explanation
- [Examples](../examples/) — Real component examples

## Overview

This project maintains **80%+ code coverage** across all modules using Jest and React Native Testing Library.

## Test Infrastructure

### Mock Implementations

Located in `test/__mocks__/infrastructure/`

- **MockApiClient**: HTTP client for testing API interactions
- **MockStorage**: In-memory storage for testing persistence
- **MockLogger**: Silent logger that captures logs for assertions
- **MockConnectivity**: Network state simulation
- **MockLifecycle**: App lifecycle state simulation

**Usage:**
```typescript
import { MockApiClient, MockStorage } from '@test/__mocks__';

const mockApi = new MockApiClient();
mockApi.mockGet('/users', { data: [{ id: 1, name: 'John' }] });

const response = await mockApi.get('/users');
expect(response.data).toHaveLength(1);
```

### Test Helpers

Located in `test/helpers/`

**Render Helpers**:
```typescript
import { renderWithProviders } from '@test/helpers';

const { getByText } = renderWithProviders(<MyComponent />);
```

**Store Helpers**:
```typescript
import { createMockStore, waitForStoreUpdate } from '@test/helpers';

const store = createMockStore({ count: 0 });
await waitForStoreUpdate(store, (state) => state.count > 0);
```

**Async Helpers**:
```typescript
import { waitForAsync, flushPromises } from '@test/helpers';

await waitForAsync(100); // Wait 100ms
await flushPromises(); // Flush microtasks
```

**Data Generators**:
```typescript
import { generateMockUser, generateMockApiResponse } from '@test/helpers';

const user = generateMockUser({ name: 'Alice' });
const response = generateMockApiResponse(user);
```

## Writing Tests

### Unit Tests

Test individual functions/classes in isolation:

```typescript
import { capitalize } from '@/utils/string';

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });
});
```

### Integration Tests

Test cross-module interactions:

```typescript
import { MockApiClient, MockStorage } from '@test/__mocks__';
import { DataService } from '@/services';

describe('DataService Integration', () => {
  it('should fetch and cache data', async () => {
    const api = new MockApiClient();
    const storage = new MockStorage();
    
    api.mockGet('/data', { data: { value: 42 } });
    
    const service = new DataService(api, storage);
    const result = await service.getData();
    
    expect(result.value).toBe(42);
    expect(await storage.get('cache:data')).toEqual({ value: 42 });
  });
});
```

### Component Tests

Test React components with providers:

```typescript
import { renderWithProviders } from '@test/helpers';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render with data', () => {
    const { getByText } = renderWithProviders(<MyComponent />);
    expect(getByText('Hello')).toBeTruthy();
  });
});
```

## Coverage Requirements

- **Global**: 80% minimum across all metrics
- **Per-file**: Aim for 90%+ on critical modules
- **Exclusions**: Type definition files (`.d.ts`), index files

Run coverage:
```bash
npm test -- --coverage
```

## Best Practices

### 1. Use Mocks for External Dependencies
✅ **Do**: Mock external services
```typescript
const mockApi = new MockApiClient();
mockApi.mockGet('/users', { data: users });
```

❌ **Don't**: Make real network calls in tests

### 2. Clean Up After Tests
✅ **Do**: Reset state between tests
```typescript
afterEach(() => {
  mockApi.reset();
  mockStorage.clear();
});
```

### 3. Test Behavior, Not Implementation
✅ **Do**: Test user-facing behavior
```typescript
expect(getByText('Success')).toBeTruthy();
```

❌ **Don't**: Test internal state directly
```typescript
expect(component.state.isLoading).toBe(false); // Avoid
```

### 4. Use Descriptive Test Names
✅ **Do**: Describe the scenario
```typescript
it('should show error when API fails', () => {
  // ...
});
```

❌ **Don't**: Use vague names
```typescript
it('works', () => {
  // ...
});
```

## Debugging Tests

### Run Single Test
```bash
npm test -- path/to/test.test.ts
```

### Watch Mode
```bash
npm run test:watch
```

### Update Snapshots
```bash
npm test -- -u
```

## Common Patterns

### Testing Async State
```typescript
import { waitForCondition } from '@test/helpers';

await waitForCondition(() => getByText('Loaded'));
```

### Testing Errors
```typescript
mockApi.mockGet('/users', { error: new Error('Network error') });

await expect(service.getUsers()).rejects.toThrow('Network error');
```

### Testing State Updates
```typescript
import { waitForStoreUpdate } from '@test/helpers';

await waitForStoreUpdate(store, (state) => state.loaded === true);
expect(store.getState().data).toBeDefined();
```

## Troubleshooting

### React 19 API Changes
Some tests may fail due to React 19's async rendering. Use `await` with render functions:

```typescript
const result = await render(<Component />);
```

### Timer Mocks
When using fake timers:

```typescript
jest.useFakeTimers();
jest.advanceTimersByTime(1000);
await flushPromises();
jest.useRealTimers();
```

---

**Coverage Goal**: 80%+ maintained ✅  
**Current Coverage**: 83.73%
