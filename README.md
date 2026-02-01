# OptiCore React Native

Pure infrastructure library for React Native/Expo applications providing reusable core utilities with zero app-specific logic.

## Installation

```bash
npm install opticore-react-native
```

**Peer Dependencies:**

```bash
npm install react react-native expo typescript
```

## Features

- 🔐 **Infrastructure Layer**: Network client, Storage management, Logger, Lifecycle monitor
- 🎯 **State Management**: AsyncState pattern, BaseStore for Zustand, StateObserver
- ⚠️ **Error Classification**: RenderError vs NonRenderError distinction
- 🧭 **Navigation Utilities**: Type-safe routing helpers for Expo Router
- 🎣 **Custom Hooks**: useAsyncState, useConnectivity, useDebounce, and more
- 🛠️ **Utility Functions**: Pure functions for strings, numbers, dates, arrays, objects
- 🧪 **Testing**: 80%+ code coverage, comprehensive unit and integration tests

## Quick Start

```typescript
import { VERSION } from 'opticore-react-native';

console.log('OptiCore version:', VERSION);
```

## Documentation

Full documentation coming soon.

## License

MIT © Mahmoud Elshenawy
