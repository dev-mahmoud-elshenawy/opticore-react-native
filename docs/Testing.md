# Testing Guide

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
