# OptiCore React Native - Global Types

This package provides a comprehensive set of TypeScript definitions to ensure type safety across your React Native application.

## 📦 API Types

Standardized types for API interactions ensure consistent response handling.

```typescript
import { ApiClient, HttpMethod } from 'opticore-react-native';
import type { ApiResponse, ApiError, PaginatedResponse } from 'opticore-react-native';

// Standard Response — request() resolves with ApiResponse<T> ({ data, status, headers, config }).
// Non-2xx responses reject with an ApiError, so reaching here means success.
const response: ApiResponse<User> = await ApiClient.getInstance().request<User>({
  method: HttpMethod.GET,
  url: '/user',
});
console.log(response.data.name);

// Paginated Response
const list: ApiResponse<PaginatedResponse<Product>> = await ApiClient.getInstance().request<
  PaginatedResponse<Product>
>({
  method: HttpMethod.GET,
  url: '/products',
});
console.log(`Page ${list.data.pagination.page} of ${list.data.pagination.totalPages}`);
```

### ApiResult\<T\>

The common **body** envelope backends wrap payloads in (`status` / `message` / `code` / `data`) —
distinct from the transport-level `ApiResponse<T>` (which is what `ApiClient.request` returns). All
fields are optional, so non-wrapped responses stay assignable. Extend it with your data source's
payload:

```typescript
import type { ApiResult } from 'opticore-react-native';

// Extend with your endpoint's payload shape:
interface ListResponse<T> extends ApiResult {
  total?: number;
  items?: T[];
}

// HTTP errors are already thrown by ApiClient (ApiError on non-2xx), so the body
// you receive is from a successful response — just map it.
const { data } = await ApiClient.getInstance().request<ListResponse<MyItem>>({
  method: HttpMethod.GET,
  url,
});
return data.items ?? [];
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
