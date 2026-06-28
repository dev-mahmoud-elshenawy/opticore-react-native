# Offline Sync

Request queuing, automatic background sync, conflict resolution, and retry logic. Your app works seamlessly offline.

---

## How It Works

1. **Enqueue** — When offline (or always), add requests to the persistent queue
2. **Persist** — Queue survives app restarts via AsyncStorage
3. **Reconnect** — `ConnectivityManager` detects network reconnection
4. **Sync** — `SyncEngine` processes the queue in priority order with retry logic
5. **Resolve** — `ConflictResolver` handles conflicts per the configured strategy

---

## Setup

```typescript
<OptiCoreProvider
  config={{
    api: { baseURL: 'https://api.example.com' },
    offline: {
      maxRetries: 3,
      syncOnReconnect: true,
      conflictStrategy: 'server-wins',
    },
  }}
>
  <App />
</OptiCoreProvider>
```

---

## useOfflineSync

```typescript
import { useOfflineSync } from 'opticore-react-native/offline';

const {
  isOnline, // boolean — current connectivity
  isSyncing, // boolean — sync in progress
  pendingCount, // number — queued requests awaiting sync
  enqueue, // (request) => Promise<string> — resolves with the queued request id
  sync, // () => Promise<SyncResult>
  remove, // (id: string) => boolean
  clearQueue, // () => void
} = useOfflineSync();
```

### Enqueue a Request

```typescript
await enqueue({
  method: 'POST',
  url: '/orders',
  data: { product: 'Widget', qty: 2 },
  priority: 'high',
});
```

### Trigger Manual Sync

```typescript
<Button
  title={isSyncing ? 'Syncing...' : `Sync (${pendingCount})`}
  onPress={sync}
  disabled={!isOnline || isSyncing}
/>
```

---

## QueuedRequest

```typescript
interface QueuedRequest<T = unknown> {
  id?: string; // auto-generated if omitted
  method: HttpMethod; // enum from 'opticore-react-native'
  url: string;
  data?: T;
  headers?: Record<string, string>;
  priority?: 'low' | 'normal' | 'high'; // default: 'normal'
  maxRetries?: number; // overrides global config for this request
  retryCount?: number; // current attempt count (managed internally)
  createdAt?: number; // timestamp (managed internally)
  lastAttempt?: number; // timestamp of last sync attempt
}
```

`retryDelay` and `conflictStrategy` are **global** options on `OfflineSyncConfig` (see
Configuration Reference) — they are not per-request fields on `QueuedRequest`.

Priority order during sync: `high` → `normal` → `low`

---

## Conflict Resolution

| Strategy      | Behavior                                                     |
| ------------- | ------------------------------------------------------------ |
| `server-wins` | Server state takes precedence (default)                      |
| `client-wins` | Local queued data takes precedence, retries with client data |
| `manual`      | Custom conflict handler — you decide the resolution          |

The conflict strategy is a **global** setting (`OfflineSyncConfig.conflictStrategy`); it is
not overridable per request. The default is `server-wins`.

Set globally using the `ConflictStrategy` constant (recommended) or the raw string value:

```typescript
import { ConflictStrategy } from 'opticore-react-native/offline';

offline: {
  conflictStrategy: ConflictStrategy.SERVER_WINS;
} // or 'server-wins'
```

Custom manual handler:

```typescript
offline: {
  conflictStrategy: 'manual',
  onConflict: async (clientData, serverData) => {
    // Merge or choose based on your business logic
    return { ...serverData, ...clientData };
  },
}
```

---

## OfflineSyncManager (Advanced)

Direct programmatic access outside React.

```typescript
import { OfflineSyncManager } from 'opticore-react-native/offline';
const manager = OfflineSyncManager.getInstance();
```

```typescript
// Enqueue
const id = await manager.enqueue({
  method: 'POST',
  url: '/orders',
  data: order,
  priority: 'high',
});

// Trigger sync
const result = await manager.sync();
// SyncResult: { success: number, failed: number, pending: number, errors: SyncError[], results: SyncItemResult[] }

// Queue management
await manager.getPendingCount(); // number
manager.remove(id); // remove specific request
manager.clearQueue(); // remove all
manager.pause(); // pause auto-sync
manager.resume(); // resume auto-sync
manager.isSyncing(); // boolean

// Listen to events
const unsubscribe = manager.addListener((event) => {
  switch (event.type) {
    case 'sync_start':
      console.log('Sync started');
      break;
    case 'sync_complete':
      console.log('Sync done', event.result);
      break;
    case 'sync_error':
      console.log('Sync failed', event.error);
      break;
    case 'request_success':
      console.log('Request synced', event.requestId);
      break;
    case 'request_failed':
      console.log('Request failed', event.requestId, event.error);
      break;
    case 'request_retry':
      console.log('Retrying', event.requestId, `attempt ${event.attempt}`);
      break;
    case 'disposed':
      console.log('Manager disposed');
      break;
  }
});
unsubscribe();

// Dispose (emits 'disposed' event, clears queue, removes all listeners, stops auto-sync)
manager.dispose();
```

---

## Optimistic UI Pattern

```typescript
function CartScreen() {
  const [items, setItems] = useState<CartItem[]>([]);
  const { enqueue, isOnline } = useOfflineSync();

  const addToCart = async (item: CartItem) => {
    // 1. Update UI immediately (optimistic)
    setItems((prev) => [...prev, item]);

    try {
      // 2. Queue the server request
      await enqueue({
        method: 'POST',
        url: '/cart/items',
        data: item,
        priority: 'normal',
      });

      Alert.alert(isOnline ? 'Added to cart!' : 'Saved — will sync when online');
    } catch {
      // 3. Revert on queue failure
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    }
  };
}
```

---

## Network Status Banner

```typescript
function OfflineBanner() {
  const { isOnline, pendingCount, sync, isSyncing } = useOfflineSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <View style={styles.banner}>
      {!isOnline && <Text>📴 Offline — changes will sync when connected</Text>}
      {isOnline && pendingCount > 0 && (
        <>
          <Text>🔄 {pendingCount} pending changes</Text>
          <TouchableOpacity onPress={sync} disabled={isSyncing}>
            <Text>{isSyncing ? 'Syncing...' : 'Sync Now'}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
```

---

## Sync Events

| Event             | Fields                                 | Description                                                                                                                                         |
| ----------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sync_start`      | —                                      | Sync cycle began                                                                                                                                    |
| `sync_complete`   | `result: SyncResult`                   | Sync cycle finished                                                                                                                                 |
| `sync_error`      | `error: Error`                         | Sync cycle failed unexpectedly                                                                                                                      |
| `request_success` | `requestId: string`                    | A single request synced successfully (auto-removed from queue)                                                                                      |
| `request_failed`  | `requestId: string`, `error: Error`    | A single request failed. Non-retryable failures (4xx) are auto-removed from queue; retryable failures (network, 5xx) remain for the next sync cycle |
| `request_retry`   | `requestId: string`, `attempt: number` | A request is about to be retried after a transient failure                                                                                          |
| `disposed`        | —                                      | Manager was disposed — all listeners will be removed after this event                                                                               |

---

## Configuration Reference

| Option             | Type      | Default         | Description                                  |
| ------------------ | --------- | --------------- | -------------------------------------------- |
| `maxRetries`       | `number`  | `3`             | Retries per request before marking as failed |
| `retryDelay`       | `number`  | `1000`          | Delay between retries (ms)                   |
| `maxBackoff`       | `number`  | `30000`         | Maximum backoff delay (ms)                   |
| `maxQueueSize`     | `number`  | `100`           | Maximum queued requests                      |
| `persistQueue`     | `boolean` | `true`          | Persist queue across restarts                |
| `syncOnReconnect`  | `boolean` | `true`          | Auto-sync when network returns               |
| `syncDelay`        | `number`  | `1000`          | Delay after reconnect before syncing (ms)    |
| `conflictStrategy` | `string`  | `'server-wins'` | Default conflict resolution                  |

---

## See Also

- [Configuration → offline](./CONFIGURATION.md#offline--optional) — Full offline config
- [useConnectivity](./api/HOOKS.md#useconnectivity) — Network state hook
- [ConnectivityManager](./api/INFRASTRUCTURE.md#connectivitymanager) — Network monitoring service
