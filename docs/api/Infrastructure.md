# Infrastructure API Reference

Core infrastructure services for networking, storage, logging, and device monitoring.

## ApiClient

HTTP client wrapper built on Axios with interceptors, auth, and retry logic.

### getInstance()

Get the singleton ApiClient instance.

```typescript
const apiClient = ApiClient.getInstance();
```

**Returns**: `ApiClient`

---

### get\<T\>(url, config?)

Perform GET request.

```typescript
const response = await apiClient.get<User[]>('/users');
const users = response.data;
```

**Parameters**:
- `url`: string - Endpoint path
- `config?`: AxiosRequestConfig - Optional Axios config

**Returns**: `Promise<AxiosResponse<T>>`

---

### post\<T\>(url, data, config?)

Perform POST request.

```typescript
const response = await apiClient.post('/users', {
  name: 'John',
  email: 'john@example.com'
});
```

**Parameters**:
- `url`: string
- `data`: any - Request body
- `config?`: AxiosRequestConfig

**Returns**: `Promise<AxiosResponse<T>>`

---

### put\<T\>, delete\<T\>, patch\<T\>

Similar to `post()` with respective HTTP methods.

---

### Interceptors

Access underlying Axios instance for custom interceptors:

```typescript
apiClient.client.interceptors.request.use((config) => {
  // Modify request
  return config;
});
```

---

## StorageManager

Unified storage interface for AsyncStorage and SecureStore.

### set(key, value)

Store data in AsyncStorage.

```typescript
await StorageManager.set('user_id', '12345');
await StorageManager.set('preferences', { theme: 'dark' });
```

**Parameters**:
- `key`: string
- `value`: any - Serialized to JSON

**Returns**: `Promise<void>`

---

### get\<T\>(key)

Retrieve data from AsyncStorage.

```typescript
const userId = await StorageManager.get<string>('user_id');
const prefs = await StorageManager.get<Preferences>('preferences');
```

**Parameters**:
- `key`: string

**Returns**: `Promise<T | null>`

---

### setSecure(key, value)

Store sensitive data in SecureStore (requires Expo).

```typescript
await StorageManager.setSecure('auth_token', 'secret_token_1234');
```

**Parameters**:
- `key`: string
- `value`: string

**Returns**: `Promise<void>`

---

### getSecure(key)

Retrieve sensitive data from SecureStore.

```typescript
const token = await StorageManager.getSecure('auth_token');
```

**Parameters**:
- `key`: string

**Returns**: `Promise<string | null>`

---

### remove(key), clear()

```typescript
await StorageManager.remove('user_id');
await StorageManager.clear(); // Clear all
```

---

### multiGet(keys), multiSet(pairs)

Batch operations for AsyncStorage.

```typescript
const values = await StorageManager.multiGet(['key1', 'key2']);
await StorageManager.multiSet([['key1', 'value1'], ['key2', 'value2']]);
```

---

## Logger

Structured logging with level-based filtering.

### Levels

- `debug` - Detailed debug information
- `info` - General informational messages
- `warn` - Warning messages
- `error` - Error messages

---

### Methods

```typescript
import { Logger } from 'opticore-react-native';

Logger.debug('Debug message', { data: '...' });
Logger.info('App started');
Logger.warn('Deprecation warning');
Logger.error('Error occurred', error);
```

**Parameters**:
- `message`: string
- `meta?`: any - Additional contextual data

---

### Configuration

Set log level via CoreSetup:

```typescript
CoreSetup.initialize({
  enableLogging: true,
  logLevel: 'debug' // or 'info', 'warn', 'error'
});
```

---

## ConnectivityManager

Monitor network connection status.

### addListener(callback)

Listen to network state changes.

```typescript
import { ConnectivityManager } from 'opticore-react-native';

const listener = ConnectivityManager.addListener((state) => {
  console.log('Connected:', state.isConnected);
  console.log('Type:', state.type); // 'wifi', 'cellular', 'none'
});
```

**Parameters**:
- `callback`: (state: NetworkState) => void

**Returns**: `() => void` - Cleanup function

---

### getCurrentState()

Get current network state.

```typescript
const state = await ConnectivityManager.getCurrentState();
```

**Returns**: `Promise<NetworkState>`

**NetworkState**:
```typescript
{
  isConnected: boolean;
  type: 'wifi' | 'cellular' | 'none' | 'unknown';
}
```

---

## LifecycleManager

Monitor app lifecycle states.

### addListener(callback)

Listen to app state changes.

```typescript
import { LifecycleManager } from 'opticore-react-native';

const listener = LifecycleManager.addListener((state) => {
  console.log('App state:', state); // 'active', 'background', 'inactive'
});
```

**Parameters**:
- `callback`: (state: AppStateStatus) => void

**Returns**: `() => void` - Cleanup function

---

### getCurrentState()

Get current app state.

```typescript
const state = LifecycleManager.getCurrentState();
// 'active' | 'background' | 'inactive'
```

**Returns**: `string`

---

## Example: Complete Setup

```typescript
import {
  CoreSetup,
  ApiClient,
  StorageManager,
  Logger,
  ConnectivityManager,
  LifecycleManager
} from 'opticore-react-native';

// 1. Initialize
CoreSetup.initialize({
  apiBaseURL: 'https://api.example.com',
  apiTimeout: 10000,
  enableLogging: __DEV__,
  storagePrefix: 'myapp_',
});

// 2. Use ApiClient
const apiClient = ApiClient.getInstance();
const users = await apiClient.get('/users');

// 3. Use Storage
await StorageManager.set('last_sync', Date.now());
await StorageManager.setSecure('token', 'secret');

// 4. Use Logger
Logger.info('App initialized');

// 5. Monitor Network
ConnectivityManager.addListener((state) => {
  if (!state.isConnected) {
    Logger.warn('No network connection');
  }
});

// 6. Monitor Lifecycle
LifecycleManager.addListener((state) => {
  if (state === 'background') {
    Logger.info('App went to background');
  }
});
```

---

**See also**:
- [Configuration Guide](../Configuration.md)
- [Architecture](../Architecture.md)
- [Testing Infrastructure](../Testing.md)
