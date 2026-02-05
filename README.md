# opticore-react-native

**Pure infrastructure library for React Native/Expo applications**

A production-ready, TypeScript-first infrastructure layer providing networking, state management, error handling, storage, logging, and utilities for React Native and Expo apps.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.78+-green.svg)](https://reactnative.dev/)
[![Test Coverage](https://img.shields.io/badge/coverage-83.73%25-brightgreen.svg)](./docs/Testing.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## ✨ Features

- 🚀 **Zero Configuration** - Works out of the box with sensible defaults
- 🔒 **Type-Safe** - Full TypeScript support with strict mode
- ⚡ **Lightweight** - Tree-shakable, minimal dependencies
- 🧪 **Well-Tested** - 83%+ code coverage
- 📱 **React Native First** - Built specifically for RN/Expo
- 🎯 **Production Ready** - Battle-tested patterns and best practices

### Core Modules

- **HTTP Client** - Axios-based ApiClient with interceptors, auth, and retry logic
- **State Management** - Zustand-based stores with AsyncState pattern
- **Error Handling** - Classified errors (RenderError vs NonRenderError)
- **Storage** - Unified interface for AsyncStorage and SecureStore
- **Logging** - Structured logging with remote integration
- **Providers** - React Query integration with lifecycle management
- **Utilities** - 40+ pure functions for strings, dates, arrays, objects, colors
- **Hooks** - Custom hooks for debounce, throttle, async state, network, keyboard

## 📦 Installation

```bash
npm install opticore-react-native
# or
yarn add opticore-react-native
```

### Peer Dependencies

```bash
npm install react react-native expo @tanstack/react-query zustand axios
```

## 🚀 Quick Start

### 1. Wrap your app with CoreProvider

```typescript
import { CoreProvider } from 'opticore-react-native';

export default function App() {
  return (
    <CoreProvider>
      {/* Your app code */}
    </CoreProvider>
  );
}
```

### 2. Configure  the API client

```typescript
import { CoreSetup } from 'opticore-react-native';

CoreSetup.initialize({
  apiBaseURL: 'https://api.example.com',
  apiTimeout: 10000,
  enableLogging: true,
});
```

### 3. Make your first API call

```typescript
import { ApiClient } from 'opticore-react-native';

const apiClient = ApiClient.getInstance();

async function fetchUsers() {
  const response = await apiClient.get('/users');
  return response.data;
}
```

### 4. Use async state management

```typescript
import { useAsyncState } from 'opticore-react-native/hooks';

function UserList() {
  const { data, loading, error, execute } = useAsyncState(fetchUsers);

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return <List data={data} />;
}
```

## 📚 Documentation

- [**API Reference**](./docs/API.md) - Complete API documentation
- [**Architecture**](./docs/ARCHITECTURE.md) - System design and patterns
- [**Configuration**](./docs/Configuration.md) - Setup and configuration
- [**Testing**](./docs/Testing.md) - Testing guidelines and mocks
- [**Migration Guide**](./docs/MIGRATION.md) - Migrate from other solutions
- [**Contributing**](./CONTRIBUTING.md) - Contribution guidelines

## 🎯 Examples

Check out the [`examples/`](./examples) directory for complete working examples:

- [Basic Integration](./examples/01-basic-integration) - Minimal setup
- [Authentication](./examples/02-authentication) - Login/logout flow
- [Data Fetching](./examples/03-data-fetching) - API calls with AsyncState
- [Error Handling](./examples/04-error-handling) - Error classification

## 🏗️ Architecture

```
opticore-react-native/
├── infrastructure/     # Core services (API, Storage, Logger)
├── state/             # State management (Zustand stores)
├── error/             # Error classification and handling
├── providers/         # React providers (Core, Query)
├── hooks/             # Custom React hooks
├── utils/             # Pure utility functions
├── config/            # Configuration and setup
└── types/             # TypeScript type definitions
```

## 🔧 Configuration

```typescript
import { CoreSetup } from 'opticore-react-native';

CoreSetup.initialize({
  // API Configuration
  apiBaseURL: 'https://api.example.com',
  apiTimeout: 10000,
  apiHeaders: { 'X-Custom-Header': 'value' },

  // Storage Configuration
  storagePrefix: 'myapp_',
  useSecureStore: true,

  // Logging Configuration
  enableLogging: __DEV__,
  logLevel: 'debug',

  // Feature Flags
  enableOfflineMode: true,
  enableAnalytics: true,
});
```

See [Configuration Guide](./docs/Configuration.md) for all options.

## 🧪 Testing

The package includes comprehensive mocks and test helpers:

```typescript
import { MockApiClient, MockStorage } from 'opticore-react-native/test/mocks';
import { renderWithProviders } from 'opticore-react-native/test/helpers';

test('fetches users', async () => {
  const mockApi = new MockApiClient();
  mockApi.mockGet('/users', { data: [{ id: 1, name: 'John' }] });
  
  const { getByText } = renderWithProviders(<UserList />);
  await waitFor(() => expect(getByText('John')).toBeTruthy());
});
```

See [Testing Guide](./docs/Testing.md) for details.

## 📝 License

MIT © Mahmoud Elshenawy

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) first.

## 📮 Support

- 📖 [Documentation](./docs)
- 🐛 [Issue Tracker](https://github.com/dev-mahmoud-elshenawy/opticore-react-native/issues)
- 💬 [Discussions](https://github.com/dev-mahmoud-elshenawy/opticore-react-native/discussions)

---

**Made with ❤️ for the React Native community**
