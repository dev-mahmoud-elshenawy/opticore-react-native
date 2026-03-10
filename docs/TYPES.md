# OptiCore React Native - Global Types

This package provides a comprehensive set of TypeScript definitions to ensure type safety across your React Native application.

## 📦 API Types

Standardized types for API interactions ensure consistent response handling.

```typescript
import type { ApiResponse, ApiError, PaginatedResponse } from 'opticore-react-native';

// Standard Response
const response: ApiResponse<User> = await api.get('/user');
if (response.success && response.data) {
  console.log(response.data.name);
}

// Paginated Response
const list: PaginatedResponse<Product> = await api.get('/products');
console.log(`Page ${list.pagination.page} of ${list.pagination.totalPages}`);
```

## 🔄 State Management Types

Types for common state patterns like loading states and async values.

```typescript
import type { LoadingState, AsyncValue } from 'opticore-react-native';

// Loading State Pattern
const [userState, setUserState] = useState<LoadingState<User>>({
  status: 'idle',
});

// Async Value Discriminated Union
const value: AsyncValue<string> = { status: 'success', data: 'Hello' };
if (value.status === 'success') {
  console.log(value.data); // Type-safe access
}
```

## 🧭 Navigation Types

Type definitions for route parameters and navigation options.

```typescript
import type { RouteParams } from 'opticore-react-native';

// Extend RouteParams to define your app's own routes via declaration merging.
// OptiCore does NOT define any routes — it is a reusable infrastructure library.
declare module 'opticore-react-native' {
  interface RouteParams {
    '/dashboard': undefined;
    '/profile/[id]': { id: string };
    '/search': { query: string; category?: string };
  }
}
```

## 💾 Storage Types

Types for storage operations and configuration.

```typescript
import type { StorageConfig, StorageKeys } from 'opticore-react-native';

const config: StorageConfig = {
  provider: 'secure-store',
  encrypted: true,
};
```

## ⚠️ Error Types

Structured error types for consistent error handling.

```typescript
import type { ErrorState, ErrorSeverity } from 'opticore-react-native';

const error: ErrorState = {
  message: 'Network failed',
  timestamp: Date.now(),
  recoverable: true,
};
```
