# Tailwind / NativeWind Preset

If your app uses [NativeWind](https://www.nativewind.dev/), OptiCore can generate a Tailwind
**preset** from a theme — so your `className` utilities (`bg-card`, `p-md`, `text-body`,
`rounded-lg`) draw from the **same design system** as `useTheme()`.

This is **opt-in** and dependency-free: it lives behind the `opticore-react-native/tailwind`
subpath and is never imported from the main entry, so apps that don't use Tailwind are unaffected.
`nativewind` and `tailwindcss` are **optional** peers.

---

## `createTailwindPreset(theme)`

```typescript
import { createTailwindPreset } from 'opticore-react-native/tailwind';
```

Maps OptiCore theme tokens into a Tailwind preset:

| Theme token | Tailwind utility |
|---|---|
| `colors` | `bg-*`, `text-*`, `border-*` (e.g. `bg-card`, `text-primary`) |
| `spacing` | `p-*`, `m-*`, `gap-*` (e.g. `p-md`, `gap-lg`) |
| `borderRadius` | `rounded-*` (e.g. `rounded-lg`) |
| `typography.sizes` | `text-xs … text-xxl` (font size only) |
| **semantic variants** | `text-body`, `text-caption`, `text-h1`, `text-title`, … (size **+ lineHeight + weight**) |

Semantic variants are emitted as Tailwind's `[size, { lineHeight, fontWeight }]` tuple, so
`text-body` sets all three properties at once.

---

## Setup

1. Install the optional peers:

   ```bash
   npx expo install nativewind tailwindcss
   ```

2. Build your `tailwind.config.js` from an OptiCore theme:

   ```js
   // tailwind.config.js
   import { createTailwindPreset } from 'opticore-react-native/tailwind';
   import { lightTheme } from 'opticore-react-native';

   export default {
     presets: [createTailwindPreset(lightTheme)],
     content: ['./src/**/*.{ts,tsx}'],
   };
   ```

3. Use the classes:

   ```tsx
   <View className="bg-card p-md rounded-lg">
     <Text className="text-h1 text-primary">Title</Text>
     <Text className="text-body">Body copy with the theme's line-height and weight.</Text>
     <Text className="text-caption">Caption</Text>
   </View>
   ```

---

## Exported type

```typescript
import type { TailwindFontSize } from 'opticore-react-native/tailwind';
// number | [number, { lineHeight: number; fontWeight: string }]
```

---

**See also**:
- [Theme Engine](./THEME.md) — the source design tokens, semantic typography variants
