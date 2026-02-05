# Configuration Interface

OptiCore provides a centralized configuration interface to manage SDK behavior globally.

## Setup

Initialize the package early in your application lifecycle (e.g., in `App.tsx` or `index.js`).

```typescript
import { coreSetup, LogLevel } from 'opticore-react-native';

coreSetup.init({
  api: {
    baseURL: 'https://api.example.com/v1',
    timeout: 10000,
    headers: {
      'X-App-Version': '1.0.0',
    },
    // Async token retrieval for Authorization header
    getAuthToken: async () => {
      const token = await secureStorage.getItem('auth_token');
      return token;
    },
  },
  logger: {
    level: LogLevel.WARN,
    disabled: false, // Set to true to disable all logging
  },
  features: {
    maintenanceMode: false,
    offlineMode: false,
    debugMode: __DEV__, // Overrides logger level to DEBUG if true
  },
  onError: (error) => {
    // Handle global errors (e.g., send to crash reporting)
    console.error('OptiCore Global Error:', error);
  },
});
```

## Configuration Options

### `api` (Required)

| Property       | Type                          | Description                            |
| -------------- | ----------------------------- | -------------------------------------- |
| `baseURL`      | `string`                      | Base URL for all API requests          |
| `timeout`      | `number`                      | Request timeout in ms (default: 30000) |
| `headers`      | `object`                      | Default headers for all requests       |
| `getAuthToken` | `() => Promise<string\|null>` | Callback to retrieve auth token        |

### `logger` (Optional)

| Property   | Type       | Description                                  |
| ---------- | ---------- | -------------------------------------------- |
| `level`    | `LogLevel` | Minimum log level (DEBUG, INFO, WARN, ERROR) |
| `disabled` | `boolean`  | Disable all logging                          |

### `features` (Optional)

| Property          | Type      | Description                           |
| ----------------- | --------- | ------------------------------------- |
| `debugMode`       | `boolean` | If true, forces Logger to DEBUG level |
| `maintenanceMode` | `boolean` | Toggle maintenance state              |
| `offlineMode`     | `boolean` | Toggle offline state                  |

## Runtime Access

You can access the current configuration anywhere in your app:

```typescript
import { coreSetup } from 'opticore-react-native';

const config = coreSetup.getConfig();
if (config.features?.maintenanceMode) {
  // Show maintenance screen
}
```

## Runtime Updates

Update configuration at runtime without full re-initialization:

```typescript
// Update just the API base URL
coreSetup.update({ api: { baseURL: 'https://staging-api.example.com' } });

// Enable maintenance mode dynamically
coreSetup.update({ features: { maintenanceMode: true } });
```

## Utilities

```typescript
// Check if initialized
if (!coreSetup.isInitialized()) {
  coreSetup.init(config);
}

// Reset for testing (internal use only)
CoreSetup.reset();
```
