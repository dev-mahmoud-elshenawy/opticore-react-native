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
  constructor(message: string, userMessage?: string, options?: RenderErrorOptions)
}

interface RenderErrorOptions {
  code?: string;
  severity?: 'warning' | 'error' | 'critical';  // default: 'error'
  isDismissible?: boolean;                        // default: true
  isActionable?: boolean;                         // default: false
  cause?: Error;
  metadata?: Record<string, unknown>;
}
```

> `message` is the technical/internal message. `userMessage` (2nd arg) is the
> friendly text surfaced to users (defaults to a generic message when omitted).

```typescript
import { ApiClient, HttpMethod } from 'opticore-react-native';

// Basic — technical message only
throw new RenderError('Profile not found');

// With a user-facing message + options
throw new RenderError('Payment declined by gateway', 'Your payment was declined.', {
  severity: 'warning',
  isDismissible: true,
  metadata: { orderId: '123', amount: 49.99 },
});

// Wrapping a caught error
try {
  await ApiClient.getInstance().request({ method: HttpMethod.POST, url: '/payment', data });
} catch (e) {
  throw new RenderError('Failed to process payment', 'Could not process your payment.', {
    cause: e instanceof Error ? e : undefined,
    severity: 'critical',
  });
}
```

---

### NonRenderError

A **descriptor / log payload** for background failures — analytics, background sync,
non-critical warnings. **Construct it and pass it to the `Logger`, or read its
fields at the catch site — do NOT `throw` it.**

> **Why not throw it?** In React Native these failures are async (sync jobs,
> telemetry, event handlers). React Error Boundaries only catch errors thrown
> **synchronously during render**, so a thrown `NonRenderError` is never caught —
> the throw is silently lost. Throwing is **deprecated**; the boundary's
> `NON_RENDER` handling is removed in 3.0. Use `Logger` or `Result<T, E>` instead.

```typescript
class NonRenderError extends BaseError {
  constructor(message: string, options?: NonRenderErrorOptions)
}

interface NonRenderErrorOptions {
  code?: string;
  isSilent?: boolean;         // default: false — no user notification
  shouldMonitor?: boolean;    // default: true — send to monitoring tools
  retryConfig?: RetryConfig;  // { maxRetries: number; delayMs: number }
  cause?: Error;
  metadata?: Record<string, unknown>;
}
```

```typescript
import { Logger } from 'opticore-react-native';

// ✅ Construct + log (never thrown). Read isSilent to decide on user feedback.
try {
  await trackAnalyticsEvent('purchase');
} catch (cause) {
  const err = new NonRenderError('Analytics failed', {
    isSilent: true,
    shouldMonitor: true,
    metadata: { event: 'purchase' },
    cause: cause instanceof Error ? cause : undefined,
  });
  Logger.getInstance().error('analytics failed', err);
  if (!err.isSilent) toast.error(err.metadata.userMessage as string);
}

// ❌ Anti-pattern — a boundary cannot catch this; the throw is lost:
// throw new NonRenderError('Analytics failed', { ... });
```

---

### ApiError

Thrown automatically by `ApiClient` for HTTP failures. Extends `RenderError`.

```typescript
class ApiError extends RenderError {
  status: number;            // HTTP status code (401, 404, 500; -1 = network failure)
  url?: string;              // Request URL
  data?: unknown;            // Response body
  originalError?: unknown;   // Original Axios error
  isRetryable: boolean;      // true for transient failures (network, 408, 429, 5xx)
  retryAfterMs?: number;     // parsed `Retry-After` header, when present (capped at 30s)
}
```

`isActionable` (inherited from `RenderError`) and `isRetryable` are deliberately
distinct: `isActionable` means *the caller must change something* (`400/401/403/
404/409/422`); `isRetryable` means *this is transient and safe to retry*
(network failures, `408`, `429`, all `5xx`). A `429`/`408` is **not** actionable —
rate limiting isn't the caller's fault — but it **is** retryable. The query/mutation
retry policy in [`createQueryClient`](./STATE.md#react-query-integration) reads
`isRetryable`/`retryAfterMs` directly, so consumers get backoff-aware retries for
free.

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

  constructor(message: string, orderId: string, userMessage?: string) {
    super(message, userMessage, { metadata: { orderId } });
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
import { ApiClient, HttpMethod, RenderError, Result } from 'opticore-react-native';

async function processOrder(orderId: string): Promise<Result<Order, RenderError>> {
  const idResult = parseUserId(orderId);
  if (idResult.isErr()) {
    return Result.err(new RenderError('Invalid order ID'));
  }

  try {
    const { data } = await ApiClient.getInstance().request<Order>({
      method: HttpMethod.GET,
      url: `/orders/${idResult.unwrap()}`,
    });
    return Result.ok(data);
  } catch (e) {
    return Result.err(
      new RenderError('Failed to load order', 'Could not load your order.', {
        cause: e instanceof Error ? e : undefined,
      })
    );
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

**Behavior:** any error that reaches the boundary came from the **render path**, so
it always resolves to a **fallback** — the boundary never silently re-renders the
throwing children (which would re-throw and loop). `errorType` is still classified
for telemetry/`onError`, but it no longer changes whether the fallback shows. A
thrown `NonRenderError` is misuse, but it too converges to a fallback rather than
looping. (Background/async failures should be logged, not thrown — see
`NonRenderError` above.)

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
