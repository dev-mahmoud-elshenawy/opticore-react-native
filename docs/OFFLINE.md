# 📡 Offline Sync

OptiCore's Offline Sync Engine provides automatic request queuing, background sync, conflict resolution, and retry logic — so your app works seamlessly offline.

---

## Quick Setup

```typescript
import { useOfflineSync } from 'opticore-react-native/offline';

function OrderScreen() {
  const { isOnline, isSyncing, pendingCount, enqueue, sync, clearQueue } = useOfflineSync();

  const createOrder = async (order: Order) => {
    await enqueue({
      method: 'POST',
      url: '/orders',
      data: order,
      priority: 'high',
    });
  };

  return (
    <View>
      <Text>{isOnline ? '🟢 Online' : '🔴 Offline'}</Text>
      {pendingCount > 0 && <Text>{pendingCount} requests pending sync</Text>}
      <Button onPress={sync} title="Sync Now" disabled={!isOnline} />
    </View>
  );
}
```

---

## useOfflineSync API

| Property | Type | Description |
|---|---|---|
| `isOnline` | `boolean` | Current network connectivity |
| `isSyncing` | `boolean` | Sync operation in progress |
| `pendingCount` | `number` | Queued requests awaiting sync |
| `enqueue(request)` | `Promise<void>` | Add a request to the offline queue |
| `sync()` | `Promise<void>` | Trigger immediate sync |
| `remove(id)` | `void` | Remove a specific request from queue |
| `clearQueue()` | `void` | Clear all pending requests |

---

## Queued Request Shape

```typescript
interface QueuedRequest<T = unknown> {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: T;
  headers?: Record<string, string>;
  priority?: 'low' | 'normal' | 'high';
  maxRetries?: number;       // default: 3
  retryDelay?: number;       // default: 1000ms
  conflictStrategy?: 'last-write-wins' | 'merge' | 'reject';
}
```

---

## OfflineSyncManager (Advanced)

```typescript
import { OfflineSyncManager } from 'opticore-react-native/offline';

const manager = OfflineSyncManager.getInstance();

// Enqueue programmatically
await manager.enqueue({
  method: 'PATCH',
  url: '/profile',
  data: { name: 'New Name' },
  priority: 'normal',
  conflictStrategy: 'last-write-wins',
});

// Listen to sync events
manager.addListener((event) => {
  if (event.type === 'sync-complete') {
    console.warn(`Synced ${event.count} requests`);
  }
});

// Get pending count
const count = await manager.getPendingCount();

// Pause / resume auto-sync
manager.pause();
manager.resume();
```

---

## Conflict Resolution Strategies

| Strategy | Behavior |
|---|---|
| `last-write-wins` | The most recent queued request wins (default) |
| `merge` | Attempts to merge request data with server state |
| `reject` | Rejects conflicting requests and notifies the listener |

---

## Auto-Sync Behavior

The sync engine automatically:
- Detects when the device comes back online via `ConnectivityManager`
- Processes the queue in priority order (`high` → `normal` → `low`)
- Retries failed requests with exponential backoff
- Persists the queue across app restarts via `AsyncStorage`

---

## Optimistic UI Pattern

```typescript
function CartScreen() {
  const [items, setItems] = useState<CartItem[]>([]);
  const { enqueue, isOnline } = useOfflineSync();

  const addToCart = async (item: CartItem) => {
    // 1. Update UI immediately (optimistic)
    setItems(prev => [...prev, item]);

    // 2. Queue the request (fires when online)
    await enqueue({
      method: 'POST',
      url: '/cart/items',
      data: item,
      priority: 'normal',
    });

    // 3. Show feedback
    Alert.alert(isOnline ? 'Added to cart!' : 'Saved — will sync when online');
  };
}
```

---

## Notes

- Queue is persisted in `AsyncStorage` — survives app restarts
- `OfflineSyncManager` is a singleton — share state across the entire app
- ConnectivityManager integration is automatic — no extra setup needed
