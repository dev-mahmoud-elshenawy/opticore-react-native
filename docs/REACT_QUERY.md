# React Query Integration

OptiCore integrates with [TanStack React Query](https://tanstack.com/query) as the recommended
server-state layer. As of **v2.0.0**, `@tanstack/react-query` is a **required peer dependency**
(install it once: `npx expo install @tanstack/react-query`).

OptiCore stays the **transport + error** layer (`ApiClient`, `RenderError`/`ApiError`), and React
Query owns **caching, deduping, background refetch, and retries**. The glue is one helper:
`createQueryClient`.

---

## `createQueryClient(overrides?)`

```typescript
import { createQueryClient } from 'opticore-react-native';
```

Returns a `QueryClient` pre-wired with OptiCore-aware defaults:

| Default | Value | Why |
|---|---|---|
| `staleTime` | `5 * 60 * 1000` (5 min) | Mobile data changes less often than a tab refresh; cuts redundant requests |
| `retry` | **error-aware** | Skips retries on actionable errors, retries transient ones |

### Error-aware retry

OptiCore surfaces failures as `RenderError` (and its subclass `ApiError`). A `RenderError` carries
`isActionable` — `true` when the user must fix something (most 4xx: bad input, unauthorized, not
found). Retrying those just wastes requests, so the default retry policy is:

```typescript
retry: (failureCount, error) => {
  if (error instanceof RenderError && error.isActionable) return false; // 4xx → don't retry
  return failureCount < 2;                                              // transient → retry twice
}
```

### Everything is overridable

Your `QueryClientConfig` is merged on top (yours wins), so you can tune any default:

```typescript
// defaults
export const queryClient = createQueryClient();

// override only what you need
export const queryClient = createQueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,                 // always refetch
      gcTime: 10 * 60 * 1000,       // keep unused data 10 min
      refetchOnWindowFocus: false,  // mobile: don't refetch on refocus
    },
  },
});
```

---

## Wiring it up

`OptiCoreProvider` already mounts a React Query provider with a default client. To use a **custom**
client (e.g. with `createQueryClient` overrides), wrap your tree in your own
`QueryClientProvider` — the nearest provider wins:

```tsx
// app/_layout.tsx
import { OptiCoreProvider } from 'opticore-react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/core/query/queryClient';
import { opticoreConfig } from '@/core/opticore.config';

export default function RootLayout() {
  return (
    <OptiCoreProvider config={opticoreConfig}>
      <QueryClientProvider client={queryClient}>
        <Stack />
      </QueryClientProvider>
    </OptiCoreProvider>
  );
}
```

> **Monorepo / `file:` link:** `withOptiCoreMetroConfig` forces `@tanstack/react-query` and
> `@tanstack/query-core` to resolve from the **app's** `node_modules`, so the app and OptiCore
> share one React Query instance (no "two QueryClients" / context mismatch). See the Metro section
> in the README.

---

## Recommended pattern — repository + query hook

Keep the data source behind a repository, wrap it in a query hook, and let UI consume the hook:

```typescript
// repository — the only place that knows the API shape; throws ApiError on failure
export const newsRepository = {
  getTopHeadlines: (category: string) =>
    ApiClient.getInstance()
      .request<ArticlesResponse>({ method: HttpMethod.GET, url: `/top-headlines?category=${category}` })
      .then((res) => res.data.articles ?? []),
};

// query hook — caching/retry handled by the client defaults
export function useTopHeadlines(category: string) {
  return useQuery({
    queryKey: ['news', 'top-headlines', category],
    queryFn: () => newsRepository.getTopHeadlines(category),
  });
}
```

In the UI, surface errors with [`toMessage`](./api/ERRORS.md#tomessageerror-fallback):

```tsx
const { data, isError, error, refetch } = useTopHeadlines(category);
if (isError) return <Text>{toMessage(error)}</Text>;
```

---

**See also**:
- [Error Handling API](./api/ERRORS.md) — `RenderError`, `ApiError`, `toMessage`
- [Infrastructure API](./api/INFRASTRUCTURE.md) — `ApiClient`
- [Types](./TYPES.md) — `ApiResult`
