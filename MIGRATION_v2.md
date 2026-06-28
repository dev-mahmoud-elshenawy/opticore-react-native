# Migrating to OptiCore React Native v2.0.0

`2.0.0` is mostly additive (semantic theming, React Query helpers, a NativeWind preset, store persistence), but two changes are **breaking** and need a quick edit when you upgrade.

---

## What changed at a glance

| Concern                      | 1.x                                           | 2.0.0                                                      |
| ---------------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| `@tanstack/react-query`      | Bundled `dependency` (installed transitively) | **Required `peerDependency`** (`>=5`) — you install it     |
| `theme.typography`           | `sizes` + `weights` scales only               | Adds semantic variants (`body`, `h1`, …); scales unchanged |
| `nativewind` / `tailwindcss` | n/a                                           | **Optional** peers (only for the Tailwind preset)          |
| Tailwind preset              | raw sizes only (`text-md`)                    | also semantic classes (`text-body`, `text-h1`, …)          |

---

## Step-by-step upgrade

### 1. Bump the dependency

```bash
npm install opticore-react-native@2.0.0
```

### 2. Install React Query (required)

It is no longer bundled. The peers CLI installs it for you:

```bash
npx opticore-install-peers          # installs React Query + the native peers
# or just React Query, manually:
npx expo install @tanstack/react-query
# or
npm install @tanstack/react-query
```

Any `>=5` version works. This is the only **mandatory** step — skipping it causes a
`Cannot find module '@tanstack/react-query'` at runtime.

### 3. If you author a _complete_ custom `Theme` literal

`ThemeTypography` now has nine required semantic-variant fields. If you build a full
`Theme` object from scratch, add them. The common pattern of spreading a default theme
needs **no change**:

```ts
// ✅ Unaffected — spreads include the new fields automatically
const brand: Theme = {
  ...lightTheme,
  colors: { ...lightTheme.colors, primary: '#6C63FF' },
};

// ✅ Overriding just typography — spread the default typography first
const compact: Theme = {
  ...lightTheme,
  typography: {
    ...lightTheme.typography,
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  },
};
```

Only a hand-written `typography: { ... }` literal that omits the variants will fail to type-check.

---

## Optional — adopt the new APIs

None of these are required, but they're why 2.0 exists:

- **Semantic typography:** `style={theme.typography.body}` or `theme.typography.h1.fontSize` — no more memorizing `sizes.md`.
- **React Query client:** `export const queryClient = createQueryClient();` — OptiCore-aware retry (skips retries on actionable 4xx errors) and a 5-minute `staleTime`, all overridable.
- **Error messages:** `toast(toMessage(error))` — prefers `RenderError.userMessage`.
- **URLs:** `buildUrl('/everything', { q, pageSize })` — encoded query strings.
- **Store persistence:** `createBaseStore({ name, persist: true, partialize })` — persists via OptiCore storage.
- **NativeWind:** add `nativewind` + `tailwindcss`, then `presets: [createTailwindPreset(lightTheme)]` gives `text-body`, `text-h1`, `bg-card`, `p-md`, … from the same theme.
