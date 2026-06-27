# Hooks API Reference

11 custom hooks for async state, device sensors, and performance optimization.

### Import

```typescript
import { useAsyncState, useDebounce } from 'opticore-react-native/hooks';
// or from main entry
import { useAsyncState } from 'opticore-react-native';
```

---

## useAsyncState

Manage the complete lifecycle of any async operation — loading, data, and error — in one hook.

```typescript
function useAsyncState<T>(initialData?: T | null): UseAsyncStateReturn<T>
```

### Return Value

| Property | Type | Description |
|---|---|---|
| `data` | `T \| null` | Result from last successful run |
| `isLoading` | `boolean` | `true` while the promise is running |
| `error` | `Error \| null` | Error from last failed run |
| `run` | `(promise: Promise<T>) => Promise<void>` | Track an already-created promise |
| `setData` | `(data: T \| null) => void` | Manually update data |
| `setError` | `(error: Error \| null) => void` | Manually set error |
| `reset` | `() => void` | Clear data, error, loading |

> `run` takes a `Promise<T>` directly (not a thunk). Create the promise inline and pass it.
>
> **The work starts when you create the promise, not when `run` is called.** Calling `fetchUser(id)`
> (or `api.get(...)`) fires the request immediately and returns a hot promise; `run` does **not**
> trigger execution — it binds that promise's lifecycle to `isLoading`/`data`/`error` (with an
> unmount guard and a generation guard so a stale earlier call can't overwrite a newer one).
> Without `run`, the request still runs, but the hook's state never updates. Because `run` receives
> an already-running promise, it can't defer *when* the work starts — create the promise at the
> moment you want it to fire (e.g. inside the effect, as above).

```typescript
import { api } from 'opticore-react-native';

function UserScreen({ id }: { id: string }) {
  const { data: user, isLoading, error, run } = useAsyncState<User>();

  useEffect(() => {
    run(api.get<User>(`/users/${id}`));
  }, [id]);

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;
  return <Text>{user?.name}</Text>;
}
```

With initial data:
```typescript
const { data } = useAsyncState<User[]>([]); // starts as [], not undefined
```

---

## useSafeCall

Fire-and-forget async calls with built-in error capture.

```typescript
const { execute, error, isLoading } = useSafeCall<void>();

execute(async () => {
  await trackAnalyticsEvent('purchase', { amount: 49.99 });
});
// Won't throw even if the async function rejects
```

---

## useConnectivity

Real-time network state.

```typescript
const { isConnected } = useConnectivity();

function OfflineBanner() {
  const { isConnected } = useConnectivity();
  return isConnected ? null : <Banner text="No internet connection" />;
}
```

---

## useResponsive

Screen size category based on breakpoints from `CoreConfig.responsive`.

```typescript
const { isSmall, isMedium, isLarge, isXLarge, width } = useResponsive();
```

| Property | Default Breakpoint |
|---|---|
| `isSmall` | width < 360 |
| `isMedium` | 360 – 767 |
| `isLarge` | 768 – 1023 |
| `isXLarge` | >= 1024 |

```typescript
function AdaptiveLayout() {
  const { isLarge } = useResponsive();
  return isLarge ? <SidebarLayout /> : <StackLayout />;
}

// Override breakpoints for this component only
const { isMedium } = useResponsive({ medium: 600 });
```

---

## useDebounce

Delay value updates — essential for search inputs.

```typescript
function useDebounce<T>(value: T, delay: number): T
```

```typescript
function SearchBar() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) searchProducts(debouncedQuery);
  }, [debouncedQuery]);

  return <TextInput value={query} onChangeText={setQuery} />;
}
```

---

## useThrottle

Limit update frequency — useful for scroll and sensor events.

```typescript
function useThrottle<T>(value: T, limit: number): T
```

```typescript
const [scrollY, setScrollY] = useState(0);
const throttledY = useThrottle(scrollY, 100); // max 10 updates/second
```

---

## usePrevious

Track the previous value of state or props.

```typescript
function usePrevious<T>(value: T): T | undefined
```

```typescript
const [count, setCount] = useState(0);
const prev = usePrevious(count);
const diff = prev !== undefined ? count - prev : 0;
```

---

## useKeyboard

Keyboard visibility and height for layout adjustments.

```typescript
const { isVisible, keyboardHeight, dismiss } = useKeyboard();
```

```typescript
function ChatInput() {
  const { isVisible, keyboardHeight } = useKeyboard();

  return (
    <View style={{ paddingBottom: isVisible ? keyboardHeight : 0 }}>
      <TextInput placeholder="Type..." />
    </View>
  );
}
```

---

## useOrientation

Device orientation tracking.

```typescript
const { orientation, isPortrait, isLandscape } = useOrientation();

function VideoPlayer() {
  const { isLandscape } = useOrientation();
  return <View style={isLandscape ? styles.fullscreen : styles.inline} />;
}
```

---

## useLifecycle

App foreground/background state.

```typescript
const appState = useLifecycle(); // 'active' | 'background' | 'inactive'

function SessionRefresher() {
  const appState = useLifecycle();

  useEffect(() => {
    if (appState === 'active') checkTokenExpiry();
    if (appState === 'background') saveCurrentDraft();
  }, [appState]);

  return null;
}
```

---

## useMount

Run an effect exactly once on mount.

```typescript
function useMount(effect: () => void | (() => void)): void
```

```typescript
function AnalyticsScreen({ name }: { name: string }) {
  useMount(() => {
    trackScreenView(name);
  });

  // With cleanup
  useMount(() => {
    const sub = subscribeToUpdates();
    return () => sub.unsubscribe();
  });
}
```

---

## Composing Hooks

```typescript
function useProductSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data, isLoading, error, run } = useAsyncState<Product[]>([]);
  const { isConnected } = useConnectivity();

  useEffect(() => {
    if (!debouncedQuery || !isConnected) return;
    run(searchProducts(debouncedQuery));
  }, [debouncedQuery, isConnected]);

  return { query, setQuery, results: data, isLoading, error };
}
```

---

## See Also

- [useFormState](../FORMS.md) — Form state management
- [useTheme](../THEME.md) — Theme switching
- [useOfflineSync](../OFFLINE.md) — Offline queue
- [useRouteHelper](./NAVIGATION.md) — Navigation helper

