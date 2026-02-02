# Infrastructure Examples

This directory contains working examples demonstrating how to use the OptiCore infrastructure modules in your React Native applications.

## Available Examples

### 1. Complete Setup
**File:** `complete-setup.ts`

Demonstrates complete infrastructure setup with all 5 modules working together:
- ✅ ApiClient configuration with auth
- ✅ StorageManager (secure + local)
- ✅ Logger configuration
- ✅ ConnectivityManager monitoring
- ✅ LifecycleManager integration

**Features shown:**
- Login/logout flow
- Token storage and refresh
- Offline data handling
- Background task management
- App state persistence

## Running the Examples

### Prerequisites

```bash
# Install dependencies
npm install

# Install ts-node for running TypeScript examples
npm install -g ts-node
```

### Running Complete Setup Example

```bash
# From project root
npx ts-node examples/infrastructure/complete-setup.ts
```

**Expected output:**
```
========================================
  INFRASTRUCTURE SETUP
========================================
🚀 Infrastructure setup started
✓ Storage configured
✓ API client configured
📶 Initial network status: ONLINE
✓ Connectivity monitoring active
✓ Lifecycle monitoring active
========================================
  ✓ ALL SYSTEMS OPERATIONAL
========================================

--- API Demo ---
User data fetched: { id: 1, name: 'Leanne Graham', ... }
Post created: { id: 101, title: 'Example Post', ... }

✓ Demo complete!
```

## Integration with React Native Apps

### App.tsx Setup

```typescript
import React, { useEffect } from 'react';
import { setupInfrastructure } from './infrastructure-setup';

function App() {
  useEffect(() => {
    // Initialize infrastructure on app start
    setupInfrastructure().catch((error) => {
      console.error('Infrastructure setup failed:', error);
    });
  }, []);

  return (
    // Your app components
  );
}

export default App;
```

### Using in Components

```typescript
import { ApiClient, StorageManager, Logger } from '@opticore/react-native/infrastructure';

function MyComponent() {
  const apiClient = ApiClient.getInstance();
  const storage = StorageManager.getInstance();
  const logger = Logger.getInstance();

  const fetchData = async () => {
    try {
      const response = await apiClient.get('/data');
      await storage.local.set('cached_data', response.data);
      logger.info('Data fetched successfully');
    } catch (error) {
      logger.error('Failed to fetch data', error);
    }
  };

  // ...
}
```

## Module-Specific Examples

Refer to `src/infrastructure/README.md` for detailed examples of each module:

1. **ApiClient** - HTTP requests with authentication
2. **StorageManager** - Secure and local storage
3. **Logger** - Development and production logging
4. **ConnectivityManager** - Network status monitoring
5. **LifecycleManager** - App state management

## Best Practices

### 1. Initialize Early
Setup infrastructure modules as early as possible in your app lifecycle, typically in `App.tsx` or your root component.

### 2. Production Configuration
Always configure the Logger for production:

```typescript
const logger = Logger.getInstance();
logger.configure({
  level: LogLevel.ERROR,
  isProduction: true, // Disables ALL logs in production
});
```

### 3. Error Handling
Always handle errors from API calls and storage operations:

```typescript
try {
  const data = await apiClient.get('/endpoint');
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API-specific errors
  }
  // Fallback handling
}
```

### 4. Memory Management
Clean up managers when components unmount:

```typescript
useEffect(() => {
  const lifecycle = LifecycleManager.getInstance();
  const onActive = () => console.log('Active');
  
  lifecycle.addObserver(onActive);

  return () => {
    lifecycle.removeObserver(onActive);
  };
}, []);
```

### 5. Offline-First
Always implement offline-first strategies:

```typescript
const connectivity = ConnectivityManager.getInstance();

if (!connectivity.isConnected) {
  // Use cached data
  return await storage.local.get('cached_data');
}

// Fetch from API
const response = await apiClient.get('/data');
await storage.local.set('cached_data', response.data);
```

## Testing Examples

All examples are tested and verified. To run tests:

```bash
# Integration tests
npm test -- test/integration/infrastructure.integration.test.ts

# Performance tests
npm test -- test/performance/infrastructure.performance.test.ts
```

## Troubleshooting

### Module Not Found
Ensure you're importing from the correct path:
```typescript
// Correct
import { ApiClient } from '@opticore/react-native/infrastructure';

// or from source
import { ApiClient } from '../../src/infrastructure';
```

### Axios Errors
If you see axios-related errors, ensure axios is installed:
```bash
npm install axios
```

### Storage Errors on Web
SecureStorage falls back to AsyncStorage on web. For sensitive data, only use SecureStorage on native platforms.

## Support

For more information, see:
- Main README: `../../README.md`
- Infrastructure README: `../../src/infrastructure/README.md`
- Specification: `../../.specify/specs/002-infrastructure-layer/`

## License

MIT
