# Navigation API Reference

Navigation utilities for Expo Router (deprecated - minimal navigation utilities).

> **Note**: Navigation is handled by Expo Router directly. opticore provides minimal helpers.

## RouteHelper

Basic navigation helpers.

### navigate(route)

Navigate to route.

```typescript
import { RouteHelper } from 'opticore-react-native';

RouteHelper.navigate('/profile');
RouteHelper.navigate('/user/123');
```

### goBack()

Go back.

```typescript
RouteHelper.goBack();
```

### reset(route)

Reset navigation stack.

```typescript
RouteHelper.reset('/home');
```

---

## Direct Expo Router Usage

For most navigation, use Expo Router directly:

```typescript
import { router } from 'expo-router';

// Navigate
router.push('/profile');
router.replace('/login');

// Go back
router.back();

// With params
router.push({ pathname: '/user/[id]', params: { id: '123' } });
```

---

## Navigation Hooks

```typescript
import { useRouter, useLocalSearchParams, useSegments } from 'expo-router';

function MyComponent() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const segments = useSegments();
  
  return <Button onPress={() => router.push('/next')} />;
}
```

---

**See also**:
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [Hooks API](./Hooks.md)
