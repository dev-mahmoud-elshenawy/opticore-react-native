# Navigation API Reference

OptiCore provides a thin, type-safe wrapper over Expo Router's navigation primitives via `useRouteHelper`.

---

## useRouteHelper

A hook that returns safe navigation methods. Uses Expo Router under the hood, handles edge cases like calling `back()` when there is no history.

```typescript
import { useRouteHelper } from 'opticore-react-native';

function ProfileScreen() {
  const { push, replace, back, backWithData, reset } = useRouteHelper();
  // ...
}
```

### Methods

```typescript
interface RouteHelper {
  push(route: string, params?: NavigationParams): void;
  replace(route: string, params?: NavigationParams): void;
  back(): void;
  backWithData(data: NavigationParams): void;
  reset(route: string, params?: NavigationParams): void;
}

type NavigationParams = Record<string, string | number>;
```

| Method | Description |
|---|---|
| `push(route, params?)` | Navigate to a route, adding it to the stack |
| `replace(route, params?)` | Navigate to a route, replacing the current one |
| `back()` | Go back to the previous screen (safe — no-ops if no history) |
| `backWithData(data)` | Go back and pass data to the previous screen via params |
| `reset(route, params?)` | Clear the navigation stack and navigate to a route |

### Examples

```typescript
const { push, replace, back, backWithData, reset } = useRouteHelper();

// Navigate to a screen
push('/product/detail', { id: '42', tab: 'reviews' });

// Replace current screen (e.g., after login)
replace('/home');

// Go back
back();

// Go back and pass data to previous screen
backWithData({ selected: 'item-42', confirmed: 'true' });

// Clear stack and go to login (e.g., after logout)
reset('/auth/login');
```

### backWithData

Go back one step and pass data to the previous screen. Sets navigation params via `router.setParams()` before calling `router.back()`, so the previous screen can read them with `useLocalSearchParams()`.

Safe — no-op if already at the root screen.

```typescript
// Screen B: picker screen — go back with selection
const { backWithData } = useRouteHelper();
backWithData({ selected: 'item-42', confirmed: 'true' });

// Screen A: read the returned data
import { useLocalSearchParams } from 'expo-router';

function ScreenA() {
  const { selected, confirmed } = useLocalSearchParams();
  // selected === 'item-42', confirmed === 'true'
}
```

---

## Types

```typescript
// NavigationParams — key-value pairs for route parameters
type NavigationParams = Record<string, string | number>;

// RouteParams — open base interface for typed route params.
// OptiCore does NOT define any routes. Extend via declaration merging in your app:
interface RouteParams {
  [route: string]: Record<string, string | number> | undefined;
}
```

### Extending RouteParams

```typescript
// In your app's types file (e.g. src/types/routes.d.ts):
declare module 'opticore-react-native' {
  interface RouteParams {
    '/dashboard': undefined;
    '/profile/[id]': { id: string };
    '/search': { query: string; category?: string };
  }
}
```

---

## When to Use Expo Router Directly

For most navigation needs, use Expo Router's built-in hooks directly — they provide full TypeScript typing for your specific route tree:

```typescript
import { useRouter, useLocalSearchParams, Link } from 'expo-router';

// Type-safe params
const { id } = useLocalSearchParams<{ id: string }>();

// Typed router
const router = useRouter();
router.push('/product/[id]', { id: '42' });

// Declarative navigation
<Link href="/settings">Settings</Link>
```

**Use `useRouteHelper` when:**
- You need a consistent navigation API across multiple components
- You want the safety of no-op `back()` when there's no history
- You need navigation in a non-screen context (like a shared component)

**Use Expo Router directly when:**
- You need type-safe route params with your specific route tree
- You're using `<Link>` for declarative navigation
- You need advanced router features (modal, replace on native)

---

## See Also

- [Expo Router Documentation](https://expo.github.io/router/docs) — Full Expo Router reference
- [Quick Start](../QUICK_START.md) — Setting up navigation with OptiCoreProvider

> **Note**: Navigation is handled by Expo Router directly. OptiCore provides minimal helpers.
