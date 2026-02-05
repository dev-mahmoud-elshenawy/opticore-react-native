# Infrastructure Layer

Core infrastructure modules for React Native applications providing networking, storage, logging, connectivity monitoring, and lifecycle management.

## Table of Contents

- [API Client](#api-client)
- [Storage Manager](#storage-manager)
- [Logger](#logger)
- [Connectivity Manager](#connectivity-manager)
- [Lifecycle Manager](#lifecycle-manager)

---

## API Client

Singleton HTTP client with automatic authentication, logging, and error handling.

### Features

- Automatic auth token injection
- Token refresh on 401 errors
- Request/response logging
- Standardized error handling
- Full TypeScript support

### Configuration

```typescript
import { ApiClient } from '@opticore/react-native/infrastructure';

const apiClient = ApiClient.getInstance();

apiClient.configure({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'X-App-Version': '1.0.0',
  },
  // Auth token provider
  getAuthToken: async () => {
    const storage = StorageManager.getInstance();
    return await storage.secure.get<string>('auth_token');
  },
  // Token refresh handler
  onTokenRefresh: async () => {
    const refreshToken = await storage.secure.get<string>('refresh_token');
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    const { token } = await response.json();
    await storage.secure.set('auth_token', token);
    return token;
  },
});
```

### Making Requests

```typescript
// GET request
const user = await apiClient.get<User>('/users/123');
console.log(user.data); // Typed as User

// POST request
const newUser = await apiClient.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// PUT request
const updated = await apiClient.put<User>(`/users/${user.id}`, {
  name: 'Jane Doe',
});

// DELETE request
await apiClient.delete(`/users/${user.id}`);

// PATCH request (partial update)
await apiClient.patch<User>(`/users/${user.id}`, {
  email: 'newemail@example.com',
});
```

### Error Handling

```typescript
import { ApiError } from '@opticore/react-native/infrastructure';

try {
  const user = await apiClient.get<User>('/users/123');
} catch (error) {
  if (error instanceof ApiError) {
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('Data:', error.data);
  }
}
```

---

## Storage Manager

Unified interface for secure (encrypted) and local (non-encrypted) storage.

### Features

- Secure storage using `expo-secure-store` on native platforms
- Fallback to AsyncStorage on web
- Local storage for non-sensitive data
- Type-safe generic methods
- Centralized clearAll() for logout

### Usage

```typescript
import { StorageManager } from '@opticore/react-native/infrastructure';

const storage = StorageManager.getInstance();

// Secure storage for sensitive data (auth tokens, API keys)
await storage.secure.set('auth_token', 'eyJhbGc...');
const token = await storage.secure.get<string>('auth_token');

// Store complex objects
await storage.secure.set('user', {
  id: 123,
  name: 'John Doe',
  email: 'john@example.com',
});
const user = await storage.secure.get<User>('user');

// Local storage for app preferences
await storage.local.set('theme', 'dark');
await storage.local.set('language', 'en');
const theme = await storage.local.get<string>('theme');

// Remove individual items
await storage.secure.remove('auth_token');
await storage.local.remove('theme');

// Clear all data (logout scenario)
await storage.clearAll(); // Clears both secure and local storage
```

### Type Safety

```typescript
interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

await storage.local.set('preferences', {
  theme: 'dark',
  notifications: true,
  language: 'en',
});

const prefs = await storage.local.get<UserPreferences>('preferences');
// prefs is typed as UserPreferences | null
```

---

## Logger

Configurable logging service with automatic production suppression.

### Features

- Configurable log levels (DEBUG, INFO, WARN, ERROR)
- **Automatic suppression in production mode**
- ANSI colored output for development
- Timestamp support
- Safe handling of circular references

### Configuration

```typescript
import { Logger, LogLevel } from '@opticore/react-native/infrastructure';

const logger = Logger.getInstance();

// Development configuration
logger.configure({
  level: LogLevel.DEBUG,
  enabled: true,
  showTimestamp: true,
  isProduction: false,
});

// Production configuration (SUPPRESSES ALL LOGS)
logger.configure({
  level: LogLevel.ERROR,
  isProduction: true, // This disables ALL logging
});
```

### Logging

```typescript
// Debug (development only, lowest priority)
logger.debug('User clicked button', { userId: 123 });

// Info (general information)
logger.info('User logged in', { email: 'john@example.com' });

// Warn (potentially harmful situations)
logger.warn('API rate limit approaching', { remaining: 10 });

// Error (error events)
logger.error('Failed to fetch user', error);
```

### Production Behavior

```typescript
// In production (isProduction: true), ALL logs are suppressed
logger.configure({ isProduction: true });

logger.debug('Debug'); // ❌ Not logged
logger.info('Info'); // ❌ Not logged
logger.warn('Warn'); // ❌ Not logged
logger.error('Error'); // ❌ Not logged

// Console output in production: NOTHING
```

---

## Connectivity Manager

Monitor network connectivity status and react to changes.

### Features

- Real-time network status monitoring
- Multiple concurrent listeners
- Cross-platform using `@react-native-community/netinfo`
- Memory leak safe with dispose()

### Usage

```typescript
import { ConnectivityManager } from '@opticore/react-native/infrastructure';

const connectivity = ConnectivityManager.getInstance();

// Check current status
if (connectivity.isConnected) {
  console.log('Device is online');
} else {
  console.log('Device is offline');
}

// Listen for connectivity changes
const handleConnectivityChange = (isConnected: boolean) => {
  if (isConnected) {
    console.log('Back online! Sync data...');
    syncOfflineData();
  } else {
    console.log('Went offline! Queue requests...');
    queueRequests();
  }
};

connectivity.addListener(handleConnectivityChange);

// Remove listener when no longer needed
connectivity.removeListener(handleConnectivityChange);

// Clean up on app exit
connectivity.dispose();
```

### React Component Example

```typescript
import React, { useEffect, useState } from 'react';
import { ConnectivityManager } from '@opticore/react-native/infrastructure';

function NetworkBanner() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const connectivity = ConnectivityManager.getInstance();
    setIsOnline(connectivity.isConnected);

    const handleChange = (connected: boolean) => {
      setIsOnline(connected);
    };

    connectivity.addListener(handleChange);

    return () => {
      connectivity.removeListener(handleChange);
    };
  }, []);

  if (isOnline) return null;

  return <Text style={{ backgroundColor: 'red' }}>No Internet Connection</Text>;
}
```

---

## Lifecycle Manager

React to app lifecycle events (active, inactive, background).

### Features

- Monitor app state changes
- Multiple concurrent observers
- Execution order preservation
- Memory leak safe with dispose()

### Usage

```typescript
import { LifecycleManager } from '@opticore/react-native/infrastructure';

const lifecycle = LifecycleManager.getInstance();

// Register observers
lifecycle.addObserver(
  // onActive callback
  () => {
    console.log('App became active');
    resumeTimers();
    refreshData();
  },
  // onInactive callback
  () => {
    console.log('App went to background or inactive');
    pauseTimers();
    saveState();
  }
);

// Remove observer (use the onActive callback as key)
const onActive = () => resumeTimers();
const onInactive = () => pauseTimers();

lifecycle.addObserver(onActive, onInactive);
lifecycle.removeObserver(onActive);

// Clean up
lifecycle.dispose();
```

### React Hook Example

```typescript
import { useEffect } from 'react';
import { LifecycleManager } from '@opticore/react-native/infrastructure';

function useAppLifecycle(
  onActive?: () => void,
  onInactive?: () => void
) {
  useEffect(() => {
    const lifecycle = LifecycleManager.getInstance();

    if (onActive || onInactive) {
      lifecycle.addObserver(onActive, onInactive);

      return () => {
        if (onActive) {
          lifecycle.removeObserver(onActive);
        }
      };
    }
  }, [onActive, onInactive]);
}

// Usage in component
function MyComponent() {
  useAppLifecycle(
    () => console.log('App active'),
    () => console.log('App inactive')
  );

  return <View>...</View>;
}
```

---

## Complete Example

Full setup with all infrastructure modules:

```typescript
import {
  ApiClient,
  StorageManager,
  Logger,
  LogLevel,
  ConnectivityManager,
  LifecycleManager,
} from '@opticore/react-native/infrastructure';

// 1. Configure Logger
const logger = Logger.getInstance();
logger.configure({
  level: __DEV__ ? LogLevel.DEBUG : LogLevel.ERROR,
  isProduction: !__DEV__,
});

// 2. Initialize Storage
const storage = StorageManager.getInstance();

// 3. Configure API Client
const apiClient = ApiClient.getInstance();
apiClient.configure({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  getAuthToken: async () => await storage.secure.get<string>('auth_token'),
  onTokenRefresh: async () => {
    const refreshToken = await storage.secure.get<string>('refresh_token');
    // Refresh logic...
    return newToken;
  },
});

// 4. Monitor Connectivity
const connectivity = ConnectivityManager.getInstance();
connectivity.addListener((isConnected) => {
  logger.info('Connectivity changed', { isConnected });
  if (isConnected) {
    // Sync offline queue
  }
});

// 5. Monitor Lifecycle
const lifecycle = LifecycleManager.getInstance();
lifecycle.addObserver(
  () => logger.debug('App active'),
  () => logger.debug('App inactive')
);

// 6. Make API calls
async function fetchUser(userId: string) {
  try {
    const response = await apiClient.get<User>(`/users/${userId}`);
    await storage.local.set('cached_user', response.data);
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch user', error);
    // Return cached data if offline
    if (!connectivity.isConnected) {
      return await storage.local.get<User>('cached_user');
    }
    throw error;
  }
}

// 7. Logout flow
async function logout() {
  await storage.clearAll();
  // Navigate to login screen
}
```

---

## License

MIT
