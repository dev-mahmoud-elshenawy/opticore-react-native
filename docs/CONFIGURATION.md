# Configuration Reference

OptiCore is configured through `OptiCoreProvider` or directly via `coreSetup.init()`. This document covers every available option.

---

## Recommended: OptiCoreProvider

The preferred approach. Pass a `CoreConfig` to the provider — it initializes all singletons and React context automatically.

```typescript
import { OptiCoreProvider, LogLevel } from 'opticore-react-native';

<OptiCoreProvider config={config}>
  <App />
</OptiCoreProvider>
```

---

## Alternative: Manual Init

For non-React entry points (e.g., background services, test setup):

```typescript
import { coreSetup } from 'opticore-react-native';

coreSetup.init({
  api: { baseURL: 'https://api.example.com' },
});
```

---

## CoreConfig — Full Type

```typescript
interface CoreConfig {
  api: ApiConfig; // Required
  query?: QueryClientConfig; // React Query options, merged onto defaults
  logger?: CoreLoggerConfig;
  theme?: CoreThemeConfig;
  offline?: OfflineSyncConfig;
  responsive?: ResponsiveConfig;
  forms?: FormsConfig;
  errorClassification?: ErrorClassificationConfig;
  features?: FeaturesConfig;
  onError?: ErrorHandler; // (error: unknown) => void
  adapters?: OptiCoreAdapters; // Override native module adapters
}
```

---

## `api` — Required

```typescript
interface ApiConfig {
  baseURL: string;
  timeout?: number; // default: 30000 ms
  headers?: Record<string, string>;
  getAuthToken?: () => string | null | Promise<string | null>;
  onTokenRefresh?: () => Promise<string | null>;
  authStrategy?: AuthStrategy;
}
```

| Property         | Type                                              | Default          | Description                                                           |
| ---------------- | ------------------------------------------------- | ---------------- | --------------------------------------------------------------------- |
| `baseURL`        | `string`                                          | —                | Base URL for all requests                                             |
| `timeout`        | `number`                                          | `30000`          | Request timeout in milliseconds                                       |
| `headers`        | `object`                                          | `{}`             | Default headers on every request                                      |
| `getAuthToken`   | `() => string \| null \| Promise<string \| null>` | —                | Called before each request to get the current auth token              |
| `onTokenRefresh` | `() => Promise<string \| null>`                   | —                | Called on 401 to refresh the token, then retries the original request |
| `authStrategy`   | `AuthStrategy`                                    | `NoAuthStrategy` | Auth strategy instance — overrides `getAuthToken`/`onTokenRefresh`    |

**Examples:**

```typescript
// Simple Bearer token
api: {
  baseURL: 'https://api.example.com',
  getAuthToken: async () => storage.secure.get('token'),
  onTokenRefresh: async () => {
    const { data } = await axios.post('/auth/refresh');
    return data.token;
  },
}

// API Key header
import { ApiKeyStrategy } from 'opticore-react-native';
api: {
  baseURL: 'https://api.example.com',
  authStrategy: new ApiKeyStrategy('X-API-Key', process.env.API_KEY),
}

// Custom headers
api: {
  baseURL: 'https://api.example.com',
  headers: {
    'X-App-Version': '1.2.0',
    'X-Platform': Platform.OS,
  },
}
```

---

## `logger` — Optional

```typescript
interface CoreLoggerConfig {
  level?: LogLevel; // default: LogLevel.INFO
  disabled?: boolean; // default: false
}

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}
```

```typescript
logger: {
  level: __DEV__ ? LogLevel.DEBUG : LogLevel.WARN,
  disabled: false,
}
```

> When `features.debugMode` is `true`, the log level is forced to `DEBUG` regardless of this setting.

---

## `theme` — Optional

```typescript
interface CoreThemeConfig {
  defaultMode?: ThemeMode; // 'light' | 'dark' | 'system' — default: 'system'
  persistMode?: boolean; // default: true — saves mode to storage
  storageKey?: string; // default: '@opticore/theme_mode'
  followSystem?: boolean; // default: true — respects OS dark mode
  customThemes?: Record<string, Theme>;
}
```

```typescript
theme: {
  defaultMode: 'system',
  persistMode: true,
  customThemes: {
    brand: myBrandTheme,
  },
}
```

---

## `offline` — Optional

```typescript
interface OfflineSyncConfig {
  maxRetries?: number; // default: 3
  retryDelay?: number; // default: 1000 ms
  maxBackoff?: number; // default: 30000 ms
  maxQueueSize?: number; // default: 100
  persistQueue?: boolean; // default: true
  syncOnReconnect?: boolean; // default: true
  syncDelay?: number; // default: 1000 ms after reconnect
  conflictStrategy?: 'client-wins' | 'server-wins' | 'manual'; // default: 'server-wins'
}
```

```typescript
offline: {
  maxRetries: 5,
  retryDelay: 2000,
  syncOnReconnect: true,
  conflictStrategy: 'server-wins',
}
```

---

## `responsive` — Optional

Customize breakpoints used by `useResponsive()`.

```typescript
interface ResponsiveConfig {
  breakpoints?: {
    small?: number; // default: 360
    medium?: number; // default: 768
    large?: number; // default: 1024
  };
}
```

```typescript
responsive: {
  breakpoints: {
    small: 360,
    medium: 720,
    large: 1024,
  },
}
```

---

## `forms` — Optional

```typescript
interface FormsConfig {
  defaultPhoneFormat?: string; // default format pattern for phone numbers
  defaultCurrency?: string; // default currency code
  customCardPatterns?: Record<string, RegExp>; // custom credit-card validation patterns
}
```

---

## `errorClassification` — Optional

```typescript
interface ErrorClassificationConfig {
  customRules?: ErrorClassificationRule[];
}

// The legacy, parameter-based rule interface (this is the type `customRules` accepts):
interface ErrorClassificationRule {
  classify: (error: unknown) => ErrorType | undefined | null;
}
```

> **Recommended:** register rules directly on `ErrorClassifier` instead of through config.
> The preferred rule shape is `ClassificationRule` (`{ name, match, type }`), registered via
> `ErrorClassifier.addRule(...)`. Custom rules run before the built-in defaults (LIFO — last
> added wins).

```typescript
import { ErrorClassifier, ErrorType } from 'opticore-react-native';

// Treat 429 as a background (non-render) error instead of the default RENDER
ErrorClassifier.addRule({
  name: 'rate-limit',
  match: (error) => (error as { status?: number })?.status === 429,
  type: ErrorType.NON_RENDER,
});

// ErrorType values: ErrorType.RENDER | ErrorType.NON_RENDER | ErrorType.NONE
```

---

## `features` — Optional

```typescript
interface FeaturesConfig {
  debugMode?: boolean; // Forces LogLevel.DEBUG, enables extra logging
  maintenanceMode?: boolean; // You can check this to show a maintenance screen
  offlineMode?: boolean; // Force offline mode (useful for testing)
}
```

```typescript
features: {
  debugMode: __DEV__,
  maintenanceMode: false,
}
```

---

## `onError` — Optional

Global error handler — fired for every unhandled error processed by the library.

```typescript
onError: (error: unknown) => {
  // Send to crash reporting
  Sentry.captureException(error);
  // or log
  logger.error('Global error', error as Error);
};
```

---

## Complete Example

```typescript
import { OptiCoreProvider, LogLevel } from 'opticore-react-native';
import { BearerTokenStrategy } from 'opticore-react-native';
import Sentry from '@sentry/react-native';

const config: CoreConfig = {
  api: {
    baseURL: 'https://api.myapp.com/v1',
    timeout: 15000,
    headers: {
      'X-App-Version': '2.1.0',
      'X-Platform': Platform.OS,
    },
    getAuthToken: async () =>
      storage.secure.get<string>('access_token'),
    onTokenRefresh: async () => {
      const refresh = await storage.secure.get<string>('refresh_token');
      const { data } = await axios.post('/auth/refresh', { refresh_token: refresh });
      await storage.secure.set('access_token', data.access_token);
      return data.access_token;
    },
  },

  logger: {
    level: __DEV__ ? LogLevel.DEBUG : LogLevel.WARN,
  },

  theme: {
    defaultMode: 'system',
    persistMode: true,
  },

  offline: {
    maxRetries: 3,
    syncOnReconnect: true,
    conflictStrategy: 'server-wins',
  },

  features: {
    debugMode: __DEV__,
  },

  onError: (error) => {
    Sentry.captureException(error);
  },
};

export default function App() {
  return (
    <OptiCoreProvider config={config}>
      <RootNavigator />
    </OptiCoreProvider>
  );
}
```

---

## Validation

`CoreSetup.init()` validates your config automatically and throws a `ConfigValidationError` if anything is invalid. You can also validate manually.

> In an app you don't call `CoreSetup.init()` yourself — `OptiCoreProvider` calls it
> for you. This section is for understanding validation / advanced manual setup.

### Automatic (via init)

```typescript
import { coreSetup, ConfigValidationError } from 'opticore-react-native';

try {
  coreSetup.init(config);
} catch (error) {
  if (error instanceof ConfigValidationError) {
    console.error(error.message); // Formatted summary of all errors
    console.log(error.result.errors); // Array of ValidationIssue[]
    console.log(error.result.warnings); // Non-blocking warnings
  }
}
```

### Manual Validation

Use `ConfigValidator.validate()` to collect all issues without throwing:

```typescript
import { ConfigValidator } from 'opticore-react-native';

const result = ConfigValidator.validate(config);
// result.valid     — boolean
// result.errors    — ValidationIssue[] (hard failures)
// result.warnings  — ValidationIssue[] (non-blocking hints)

if (!result.valid) {
  result.errors.forEach((e) => console.error(`${e.path}: ${e.message}`));
}
```

Or use `ConfigValidator.validateOrThrow()` to get the throw-on-failure behavior directly:

```typescript
ConfigValidator.validateOrThrow(config); // throws ConfigValidationError
```

### What Is Validated

| Section                    | Rules                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `api.baseURL`              | Required, must be a valid URL                                                                        |
| `api.timeout`              | Must be a positive number. Warns if < 1s or > 120s                                                   |
| `logger.level`             | Must be a valid `LogLevel` enum value                                                                |
| `logger.disabled`          | Must be a boolean. Warns if level is set while disabled                                              |
| `responsive.breakpoints`   | Must be positive numbers in ascending order (small < medium < large)                                 |
| `offline.maxRetries`       | Must be a non-negative integer. Warns if > 10                                                        |
| `offline.retryDelay`       | Must be non-negative. Must not exceed `maxBackoff`                                                   |
| `offline.maxQueueSize`     | Must be a positive integer                                                                           |
| `offline.conflictStrategy` | Must be `'client-wins'`, `'server-wins'`, or `'manual'`. `'manual'` requires an `onConflict` handler |
| `theme.defaultMode`        | Must be `'light'`, `'dark'`, or `'system'`                                                           |
| `theme.storageKey`         | Must be a non-empty string                                                                           |
| `theme.customThemes`       | Each theme must have `name`, `mode`, `colors`, `spacing`, `typography`, `borderRadius`, `shadows`    |
| `forms.defaultCurrency`    | Must be a non-empty string                                                                           |
| `forms.defaultPhoneFormat` | Must be a non-empty string                                                                           |

### ValidationIssue Shape

```typescript
interface ValidationIssue {
  path: string; // e.g., "api.timeout", "offline.maxRetries"
  message: string; // e.g., "must be a positive number"
  value?: unknown; // The actual invalid value (omitted for missing fields)
}
```

---

## Runtime Config Access

Access the active config anywhere:

```typescript
import { useConfig } from 'opticore-react-native';

function DebugScreen() {
  const { config } = useConfig();

  return <Text>Base URL: {config.api.baseURL}</Text>;
}

// Outside React
import { coreSetup } from 'opticore-react-native';
const config = coreSetup.getConfig();
```

---

## See Also

- [Architecture](./ARCHITECTURE.md) — How initialization flows through the library
- [Infrastructure API](./api/INFRASTRUCTURE.md) — ApiClient, Logger, Storage detail
- [Theme Engine](./THEME.md) — Full theme configuration
- [Offline Sync](./OFFLINE.md) — Offline config options
