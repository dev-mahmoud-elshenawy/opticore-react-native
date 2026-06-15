# Error Handling API Reference

A complete error system: typed error classes, automatic classification, `Result<T,E>` for functional error handling, and React Error Boundary integration.

### Import

```typescript
import { RenderError, NonRenderError, ApiError, ErrorClassifier, Result } from 'opticore-react-native';
```

---

## Error Classes

### RenderError

Errors that **must be shown to the user** — validation failures, permission denied, resource not found.

```typescript
class RenderError extends BaseError {
  constructor(message: string, options?: RenderErrorOptions)
}

interface RenderErrorOptions {
  code?: string;
  severity?: 'warning' | 'error' | 'critical';  // default: 'error'
  isDismissible?: boolean;                        // default: true
  isActionable?: boolean;                         // default: false
  cause?: unknown;
  metadata?: Record<string, unknown>;
}
```

```typescript
// Basic
throw new RenderError('Profile not found');

// With options
throw new RenderError('Payment was declined', {
  severity: 'warning',
  isDismissible: true,
  metadata: { orderId: '123', amount: 49.99 },
});

// Wrapping a caught error
try {
  await api.post('/payment', data);
} catch (e) {
  throw new RenderError('Failed to process payment', { cause: e, severity: 'critical' });
}
```

---

### NonRenderError

Errors that should be **logged silently** — analytics failures, background sync errors, non-critical warnings.

```typescript
class NonRenderError extends BaseError {
  constructor(message: string, options?: NonRenderErrorOptions)
}

interface NonRenderErrorOptions {
  code?: string;
  isSilent?: boolean;         // default: true — no user notification
  shouldMonitor?: boolean;    // default: true — send to monitoring tools
  retryConfig?: RetryConfig;
  cause?: unknown;
  metadata?: Record<string, unknown>;
}
```

```typescript
try {
  await trackAnalyticsEvent('purchase');
} catch (e) {
  throw new NonRenderError('Analytics failed', {
    cause: e,
    shouldMonitor: true,
    metadata: { event: 'purchase' },
  });
}
```

---

### ApiError

Thrown automatically by `ApiClient` for HTTP failures. Extends `RenderError`.

```typescript
class ApiError extends RenderError {
  status: number;         // HTTP status code (401, 404, 500, ...)
  url: string;            // Request URL
  data?: unknown;         // Response body
  originalError: unknown; // Original Axios error
}
```

```typescript
import { ApiClient, HttpMethod } from 'opticore-react-native';

try {
  await ApiClient.getInstance().request({ method: HttpMethod.GET, url: '/users/999' });
} catch (e) {
  if (e instanceof ApiError) {
    switch (e.status) {
      case 401: redirectToLogin(); break;
      case 404: showNotFoundScreen(); break;
      case 500: showServerErrorBanner(); break;
    }
  }
}
```

---

### ConfigValidationError

Thrown by `ConfigValidator.validateOrThrow()` (and `CoreSetup.init()`) when configuration is invalid. Contains the full `ValidationResult` for programmatic inspection.

```typescript
import { ConfigValidationError } from 'opticore-react-native';

try {
  coreSetup.init(badConfig);
} catch (e) {
  if (e instanceof ConfigValidationError) {
    e.result.errors;    // ValidationIssue[] — hard failures
    e.result.warnings;  // ValidationIssue[] — non-blocking hints
    e.message;          // Formatted summary of all errors
  }
}
```

> See [Configuration — Validation](../CONFIGURATION.md#validation) for the full validation reference.

---

### BaseError

Abstract base for all OptiCore errors. Use when creating custom error types.

```typescript
abstract class BaseError extends Error {
  code?: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
  cause?: unknown;

  getCause(): unknown
  addMetadata(key: string, value: unknown): void
  toJSON(): SerializedError
}
```

**Custom error:**
```typescript
class PaymentError extends RenderError {
  readonly orderId: string;

  constructor(message: string, orderId: string, options?: RenderErrorOptions) {
    super(message, { ...options, metadata: { orderId } });
    this.orderId = orderId;
  }
}
```

---

## ErrorClassifier

Automatically classifies any error as `RENDER`, `NON_RENDER`, or `NONE`.

```typescript
const type = ErrorClassifier.classify(error);
// ErrorType.RENDER | ErrorType.NON_RENDER | ErrorType.NONE
```

```typescript
import { ErrorClassifier, ErrorType } from 'opticore-react-native';

function handleError(error: unknown) {
  const type = ErrorClassifier.classify(error);

  if (type === ErrorType.RENDER) {
    showErrorToUser(error as RenderError);
  } else if (type === ErrorType.NON_RENDER) {
    Logger.getInstance().error('Silent error', error as Error);
  }
}
```

### Custom Classification Rules

Add domain-specific rules via config or programmatically:

```typescript
// Via CoreConfig
errorClassification: {
  customRules: [
    {
      name: 'payment-decline',
      match: (e) => (e as any)?.code === 'PAYMENT_DECLINED',
      type: ErrorType.RENDER,
    },
  ],
}

// Programmatically
ErrorClassifier.addRule({
  name: 'rate-limit',
  match: (e) => e instanceof ApiError && e.status === 429,
  type: ErrorType.NON_RENDER,
  factory: (e) => new NonRenderError('Rate limited', { cause: e }),
});

// Clear custom rules (useful in tests)
ErrorClassifier.clearCustomRules();
```

---

## Result<T, E>

Rust-inspired type for expressing operations that can fail — without try/catch.

```typescript
type Result<T, E = Error> = Ok<T, E> | Err<T, E>
```

### Creating Results

```typescript
import { Result } from 'opticore-react-native';

function parseUserId(id: string): Result<number, Error> {
  const parsed = parseInt(id, 10);
  if (isNaN(parsed)) return Result.err(new Error(`Invalid ID: ${id}`));
  return Result.ok(parsed);
}
```

### Checking Results

```typescript
const result = parseUserId('42');

// Type-narrowing check
if (result.isOk()) {
  console.log(result.unwrap()); // 42 — typed as number
}

if (result.isErr()) {
  console.log(result.unwrap()); // throws
}

// Safe unwrap with fallback
const id = result.unwrapOr(0); // 0 if Err
```

### Transforming Results

```typescript
// map — transform the Ok value
const doubled = result.map(n => n * 2); // Result<number, Error>

// flatMap — chain another Result-producing operation
const user = result.flatMap(id => fetchUserById(id)); // Result<User, Error>

// mapErr — transform the error
const withContext = result.mapErr(e => new RenderError(e.message));
```

### Real-World Example

```typescript
async function processOrder(orderId: string): Promise<Result<Order, RenderError>> {
  const idResult = parseUserId(orderId);
  if (idResult.isErr()) {
    return Result.err(new RenderError('Invalid order ID'));
  }

  try {
    const { data } = await api.get<Order>(`/orders/${idResult.unwrap()}`);
    return Result.ok(data);
  } catch (e) {
    return Result.err(new RenderError('Failed to load order', { cause: e }));
  }
}

// Usage
const result = await processOrder(id);
if (result.isOk()) {
  displayOrder(result.unwrap());
} else {
  showError(result.unwrapOr(null));
}
```

---

## OptiCoreErrorBoundary

React Error Boundary that integrates with the error classification system.

```typescript
interface OptiCoreErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: ((error: Error) => React.ReactNode) | React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}
```

```typescript
import { OptiCoreErrorBoundary } from 'opticore-react-native';

// Wrap entire app
export default function App() {
  return (
    <OptiCoreErrorBoundary
      fallback={(error) => (
        <View>
          <Text>Something went wrong</Text>
          <Text>{error.message}</Text>
          <Button title="Retry" onPress={() => RootNavigation.reset()} />
        </View>
      )}
      onError={(error, info) => {
        Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
      }}
    >
      <RootNavigator />
    </OptiCoreErrorBoundary>
  );
}

// Wrap individual screens for granular recovery
function ProductScreen() {
  return (
    <OptiCoreErrorBoundary
      fallback={<ProductErrorFallback />}
    >
      <ProductDetails />
    </OptiCoreErrorBoundary>
  );
}
```

---

## Recovery Strategies

Built-in strategies for common error recovery patterns:

```typescript
import { RetryStrategy, RefreshTokenStrategy, ClearCacheStrategy } from 'opticore-react-native';

// Retry the failed operation
const retry = new RetryStrategy(async () => {
  await fetchData();
});

// Refresh token and retry
const refresh = new RefreshTokenStrategy(async () => {
  await refreshAuthToken();
  await fetchData();
});

// Clear cache and reload
const clear = new ClearCacheStrategy(async () => {
  await StorageManager.getInstance().local.clear();
  await fetchData();
});
```

---

## toMessage(error, fallback?)

Resolve a user-facing message from any thrown value — handy in `catch` blocks, toasts, and React
Query error states where the caught value is `unknown`.

```typescript
import { toMessage } from 'opticore-react-native';

try {
  await something();
} catch (e) {
  toast(toMessage(e));                         // → RenderError.userMessage when available
  toast(toMessage(e, 'Could not load news'));  // custom fallback
}
```

Resolution order: `RenderError.userMessage` → `Error.message` → `fallback`
(default `'Something went wrong'`). Because `ApiError extends RenderError`, API failures surface
their friendly `userMessage` automatically.

---

## See Also

- [Configuration](../CONFIGURATION.md#errorclassification) — Custom classification rules
- [OptiCoreProvider](../CONFIGURATION.md) — Global `onError` handler
- [Infrastructure](./INFRASTRUCTURE.md#apierror) — ApiError from HTTP requests
- [React Query Integration](../REACT_QUERY.md) — `toMessage` in query error states

## Error Types

### BaseError (abstract)

Base class for all opticore errors.

```typescript
abstract class BaseError extends Error {
  code?: string;
  timestamp: Date;
}
```

---

### RenderError

Errors that should be shown to users.

```typescript
import { RenderError } from 'opticore-react-native';

throw new RenderError('Invalid email address', 'VALIDATION_ERROR');
```

**Use for**:
- Validation errors
- User input errors
- Business logic errors
- API errors with user-friendly messages

---

### NonRenderError

Errors that should only be logged (not shown to users).

```typescript
import { NonRenderError } from 'opticore-react-native';

throw new NonRenderError('Database connection failed', 'DB_ERROR');
```

**Use for**:
- System errors
- Developer errors
- Infrastructure failures
- Unexpected errors

---

## Custom Error Types

### Creating Custom Errors

```typescript
// Custom RenderError
export class PaymentError extends RenderError {
  constructor(message: string, public amount?: number) {
    super(message, 'PAYMENT_ERROR');
    this.name = 'PaymentError';
  }
}

// Custom NonRenderError
export class DatabaseError extends NonRenderError {
  constructor(message: string, public query?: string) {
    super(message, 'DB_ERROR');
    this.name = 'DatabaseError';
  }
}

// Usage
throw new PaymentError('Insufficient funds', 1000);
throw new DatabaseError('Query failed', 'SELECT * FROM users');
```

---

## Error Handling Patterns

### Try-Catch with Classification

```typescript
import { ApiClient, HttpMethod, RenderError, NonRenderError, Logger } from 'opticore-react-native';

const apiClient = ApiClient.getInstance();

async function fetchUserData() {
  try {
    const response = await apiClient.request({ method: HttpMethod.GET, url: '/user' });
    return response.data;
  } catch (error) {
    if (error instanceof RenderError) {
      // Show to user
      Alert.alert('Error', error.message);
    } else if (error instanceof NonRenderError) {
      // Log only
      Logger.error('Background error', error);
    } else {
      // Unknown error - log and show generic message
      Logger.error('Unexpected error', error);
      Alert.alert('Error', 'Something went wrong');
    }
    throw error;
  }
}
```

---

### Error Boundaries

```typescript
import { Component, ReactNode } from 'react';
import { Logger } from 'opticore-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    Logger.error('React Error Boundary caught error', {
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorScreen />;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorScreen />}>
  <App />
</ErrorBoundary>
```

---

### Global Error Handler

```typescript
import { Logger } from 'opticore-react-native';
import { ErrorUtils } from 'react-native';

// Set global error handler
const globalErrorHandler = (error: Error, isFatal: boolean) => {
  Logger.error('Global error', { error, isFatal });
  
  if (isFatal) {
    // Show crash screen or restart app
    Alert.alert(
      'Unexpected Error',
      'The app has encountered an error and needs to restart.',
      [{ text: 'Restart', onPress: () => /* restart */ }]
    );
  }
};

ErrorUtils.setGlobalHandler(globalErrorHandler);
```

---

## API Error Handling

### Axios Interceptor

```typescript
import { ApiClient } from 'opticore-react-native';

const apiClient = ApiClient.getInstance();

apiClient.client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new RenderError(data.message || 'Invalid request', 'BAD_REQUEST');
        case 401:
          throw new RenderError('Please log in again', 'UNAUTHORIZED');
        case 403:
          throw new RenderError('Access denied', 'FORBIDDEN');
        case 404:
          throw new RenderError('Resource not found', 'NOT_FOUND');
        case 500:
          throw new NonRenderError('Server error', 'SERVER_ERROR');
        default:
          throw new NonRenderError(`HTTP ${status}`, 'HTTP_ERROR');
      }
    }
    
    throw new NonRenderError('Network error', 'NETWORK_ERROR');
  }
);
```

---

## Validation Errors

```typescript
import { RenderError } from 'opticore-react-native';

export class ValidationError extends RenderError {
  constructor(
    message: string,
    public field?: string,
    public value?: any
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

// Usage
function validateEmail(email: string) {
  if (!email.includes('@')) {
    throw new ValidationError('Invalid email format', 'email', email);
  }
}

// In form
try {
  validateEmail(formData.email);
  await submitForm(formData);
} catch (error) {
  if (error instanceof ValidationError) {
    setFieldError(error.field, error.message);
  }
}
```

---

## Error Logging

### With Logger

```typescript
import { Logger } from 'opticore-react-native';

try {
  await riskyOperation();
} catch (error) {
  Logger.error('Operation failed', {
    error,
    context: 'user_action',
    userId: currentUser.id,
  });
}
```

---

### With Remote Logging

```typescript
import { Logger } from 'opticore-react-native';

// Configure remote logging (e.g., Sentry)
CoreSetup.initialize({
  enableLogging: true,
  remoteLogging: {
    enabled: true,
    endpoint: 'https://logging.example.com',
    apiKey: 'xxx',
  },
});

// Errors will be sent to remote service
Logger.error('Critical error', error);
```

---

## Best Practices

### 1. Use Specific Error Types

```typescript
// ❌ Bad
throw new Error('Invalid input');

// ✅ Good
throw new ValidationError('Email is required', 'email');
```

### 2. Provide Context

```typescript
// ❌ Bad
throw new RenderError('Failed');

// ✅ Good
throw new RenderError('Failed to save profile. Please check your connection.');
```

### 3. Log NonRenderErrors

```typescript
// ❌ Bad
catch (error) {
  // Silent failure
}

// ✅ Good
catch (error) {
  if (error instanceof NonRenderError) {
    Logger.error('Background error', error);
  }
}
```

### 4. Don't Show Technical Details to Users

```typescript
// ❌ Bad
Alert.alert('Error', error.stack);

// ✅ Good
if (error instanceof RenderError) {
  Alert.alert('Error', error.message);
} else {
  Alert.alert('Error', 'Something went wrong. Please try again.');
}
```

---

**See also**:
- [Infrastructure API](./INFRASTRUCTURE.md)
- [Testing Guide](../TESTING.md)
- [Architecture](../ARCHITECTURE.md)
