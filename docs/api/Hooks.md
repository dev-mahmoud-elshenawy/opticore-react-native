# Hooks API Reference

Custom React hooks for common patterns.

## Async Operations

### useAsyncState\<T\>(asyncFn, options?)

Manage async operations with loading, error, and data states.

See [State API](./State.md#useasyncstatet-asyncfn-options) for full documentation.

---

## Performance Hooks

### useDebounce\<T\>(value, delay)

Debounce a value.

```typescript
import { useDebounce } from 'opticore-react-native/hooks';

function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  
  useEffect(() => {
    if (debouncedQuery) {
      searchAPI(debouncedQuery);
    }
  }, [debouncedQuery]);
  
  return <TextInput value={query} onChangeText={setQuery} />;
}
```

**Parameters**:
- `value`: T - Value to debounce
- `delay`: number - Delay in milliseconds

**Returns**: T - Debounced value

---

### useThrottle\<T\>(callback, delay)

Throttle a callback function.

```typescript
import { useThrottle } from 'opticore-react-native/hooks';

function ScrollHandler() {
  const handleScroll = useThrottle((event) => {
    console.log('Scroll position:', event.nativeEvent.contentOffset.y);
  }, 200);
  
  return <ScrollView onScroll={handleScroll} />;
}
```

**Parameters**:
- `callback`: Function - Function to throttle
- `delay`: number - Throttle delay in milliseconds

**Returns**: Function - Throttled function

---

## Device Hooks

### useConnectivity()

Monitor network connectivity.

```typescript
import { useConnectivity } from 'opticore-react-native/hooks';

function NetworkStatus() {
  const { isConnected, type } = useConnectivity();
  
  return (
    <View>
      <Text>Connected: {isConnected ? 'Yes' : 'No'}</Text>
      <Text>Type: {type}</Text>
    </View>
  );
}
```

**Returns**:
```typescript
{
  isConnected: boolean;
  type: 'wifi' | 'cellular' | 'none' | 'unknown';
}
```

---

### useKeyboard()

Monitor keyboard visibility.

```typescript
import { useKeyboard } from 'opticore-react-native/hooks';

function KeyboardAware Component() {
  const { isVisible, height } = useKeyboard();
  
  return (
    <View style={{ paddingBottom: isVisible ? height : 0 }}>
      <TextInput placeholder="Type here..." />
    </View>
  );
}
```

**Returns**:
```typescript
{
  isVisible: boolean;
  height: number;
}
```

---

### useOrientation()

Monitor device orientation.

```typescript
import { useOrientation } from 'opticore-react-native/hooks';

function OrientationAware() {
  const orientation = useOrientation();
  
  return (
    <View style={orientation === 'landscape' ? styles.landscape : styles.portrait}>
      {/* Content */}
    </View>
  );
}
```

**Returns**: `'portrait' | 'landscape'`

---

## Lifecycle Hooks

### useAppState()

Monitor app lifecycle state.

```typescript
import { useAppState } from 'opticore-react-native/hooks';

function LifecycleAware() {
  const appState = useAppState();
  
  useEffect(() => {
    if (appState === 'background') {
      pauseOperations();
    } else if (appState === 'active') {
      resumeOperations();
    }
  }, [appState]);
  
  return <App />;
}
```

**Returns**: `'active' | 'background' | 'inactive'`

---

### useLifecycle(callbacks)

Execute callbacks on app state changes.

```typescript
import { useLifecycle } from 'opticore-react-native/hooks';

function App() {
  useLifecycle({
    onForeground: () => {
      console.log('App came to foreground');
      refreshData();
    },
    onBackground: () => {
      console.log('App went to background');
      saveState();
    },
  });
  
  return <AppContent />;
}
```

**Parameters**:
```typescript
{
  onForeground?: () => void;
  onBackground?: () => void;
  onInactive?: () => void;
}
```

---

## Utility Hooks

### usePrevious\<T\>(value)

Get the previous value of a state.

```typescript
import { usePrevious } from 'opticore-react-native/hooks';

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);
  
  return (
    <View>
      <Text>Current: {count}</Text>
      <Text>Previous: {prevCount}</Text>
      <Button title="+" onPress={() => setCount(count + 1)} />
    </View>
  );
}
```

**Parameters**:
- `value`: T

**Returns**: T | undefined - Previous value

---

### useToggle(initialValue?)

Toggle a boolean value.

```typescript
import { useToggle } from 'opticore-react-native/hooks';

function ToggleExample() {
  const [isVisible, toggle] = useToggle(false);
  
  return (
    <View>
      {isVisible && <Text>Visible!</Text>}
      <Button title="Toggle" onPress={toggle} />
    </View>
  );
}
```

**Parameters**:
- `initialValue?`: boolean - Default: false

**Returns**: [boolean, () => void]

---

### useInterval(callback, delay)

Run a callback at regular intervals.

```typescript
import { useInterval } from 'opticore-react-native/hooks';

function Timer() {
  const [seconds, setSeconds] = useState(0);
  
  useInterval(() => {
    setSeconds(s => s + 1);
  }, 1000); // Run every second
  
  return <Text>{seconds}s</Text>;
}
```

**Parameters**:
- `callback`: () => void
- `delay`: number | null - Milliseconds (null to pause)

---

### useTimeout(callback, delay)

Run a callback after a delay.

```typescript
import { useTimeout } from 'opticore-react-native/hooks';

function DelayedMessage() {
  const [show, setShow] = useState(false);
  
  useTimeout(() => {
    setShow(true);
  }, 3000); // 3 seconds
  
  return show ? <Text>Hello!</Text> : null;
}
```

**Parameters**:
- `callback`: () => void
- `delay`: number - Milliseconds

---

## Form Hooks

### useForm\<T\>(initialValues, validate?)

Manage form state and validation.

```typescript
import { useForm } from 'opticore-react-native/hooks';

interface LoginForm {
  email: string;
  password: string;
}

function LoginScreen() {
  const { values, errors, handleChange, handleSubmit, isValid } = useForm<LoginForm>({
    email: '',
    password: '',
  }, (values) => {
    const errors: Partial<LoginForm> = {};
    if (!values.email) errors.email = 'Email required';
    if (!values.password) errors.password = 'Password required';
    return errors;
  });
  
  const onSubmit = () => {
    handleSubmit(async (data) => {
      await login(data.email, data.password);
    });
  };
  
  return (
    <View>
      <TextInput
        value={values.email}
        onChangeText={handleChange('email')}
        error={errors.email}
      />
      <TextInput
        value={values.password}
        onChangeText={handleChange('password')}
        secureTextEntry
        error={errors.password}
      />
      <Button title="Login" onPress={onSubmit} disabled={!isValid} />
    </View>
  );
}
```

**Parameters**:
- `initialValues`: T
- `validate?`: (values: T) => Partial\<T\> - Validation function

**Returns**:
```typescript
{
  values: T;
  errors: Partial<T>;
  handleChange: (field: keyof T) => (value: any) => void;
  handleSubmit: (onValid: (data: T) => void) => void;
  reset: () => void;
  isValid: boolean;
}
```

---

## Complete Example

```typescript
import {
  useAsyncState,
  useDebounce,
  useConnectivity,
  useKeyboard,
  useAppState,
  usePrevious,
  useToggle,
} from 'opticore-react-native/hooks';

function CompleteExample() {
  // Search with debounce
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  
  // Async data fetching
  const { data, loading, execute } = useAsyncState(() =>
    searchAPI(debouncedQuery)
  );
  
  // Connectivity
  const { isConnected } = useConnectivity();
  
  // Keyboard
  const { isVisible: keyboardVisible, height } = useKeyboard();
  
  // App state
  const appState = useAppState();
  
  // Previous value
  const prevQuery = usePrevious(query);
  
  // Toggle
  const [filtersVisible, toggleFilters] = useToggle();
  
  useEffect(() => {
    if (debouncedQuery && isConnected) {
      execute();
    }
  }, [debouncedQuery, isConnected]);
  
  return (
    <View style={{ paddingBottom: keyboardVisible ? height : 0 }}>
      <TextInput value={query} onChangeText={setQuery} />
      <Button title="Filters" onPress={toggleFilters} />
      {filtersVisible && <Filters />}
      {loading ? <Loading /> : <Results data={data} />}
      {!isConnected && <OfflineBanner />}
    </View>
  );
}
```

---

**See also**:
- [State API](./State.md)
- [Infrastructure API](./Infrastructure.md)
- [Examples](../../examples/)
