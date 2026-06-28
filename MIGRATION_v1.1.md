# Migrating to OptiCore React Native v1.1.0

`1.1.0` is a small migration but a meaningful architectural shift: OptiCore no longer ships native modules transitively. They are now **peer dependencies** that the consumer installs to match their own Expo SDK.

This eliminates the class of cross-SDK runtime crashes (most famously `ClassNotFoundException: AnyTypeProvider`) that affected `1.0.0` on Expo SDK 55+.

---

## What changed at a glance

| Concern                                                        | 1.0.0                             | 1.1.0                                      |
| -------------------------------------------------------------- | --------------------------------- | ------------------------------------------ |
| Native modules (`expo-secure-store`, NetInfo, AsyncStorage, …) | Pinned `dependencies` of OptiCore | Optional `peerDependencies`                |
| `expo-modules-core`                                            | Pinned to `^3.0.29`               | Not declared — consumer's Expo controls it |
| `expo` peer range                                              | `^54.0.33` (one SDK)              | `>=54.0.0` (54 / 55 / 56 / future)         |
| Storage / connectivity backends                                | Hardcoded                         | Pluggable via adapter interfaces           |
| Memory fallback when peer missing                              | Crashes at import                 | Falls back silently — no native crash      |

---

## Step-by-step upgrade

### 1. Bump the dependency

```bash
npm install opticore-react-native@1.1.0
# or
yarn add opticore-react-native@1.1.0
```

### 2. Install the peers in one command

The bundled CLI installs every peer at SDK-aligned versions:

```bash
npx opticore-install-peers
```

Flags: `--required` (storage + network only), `--optional` (clipboard + device), `--dry-run` (show command, don't run).

You can skip any peer you don't use — OptiCore will fall back to an in-memory implementation rather than crashing. (Helpful for unit tests and SSR; **not** a replacement for real secure storage in production.)

> Prefer the manual approach? `npx expo install expo-secure-store @react-native-async-storage/async-storage @react-native-community/netinfo expo-clipboard expo-device expo-application`
>
> On bare React Native (no Expo Go), substitute the `expo-clipboard`/`expo-device`/`expo-application` modules with the bare peers `@react-native-clipboard/clipboard` and `react-native-device-info`.

### 3. Rebuild your dev client

Because native module versions changed, you need a fresh native build:

```bash
rm -rf ios android
npx expo prebuild --clean
npx expo run:ios       # or run:android
```

If you use EAS Build, just bump the dependency and queue a new build — EAS handles the rest.

### 4. (Optional) Inject a custom adapter

If you'd rather use MMKV for local storage, react-native-keychain for secure storage, or a test double in Jest, supply an adapter via `OptiCoreProvider`:

```tsx
import { MMKV } from 'react-native-mmkv';
import { OptiCoreProvider, type LocalStorageAdapter } from 'opticore-react-native';

const mmkv = new MMKV();

const mmkvAdapter: LocalStorageAdapter = {
  setItem: async (k, v) => {
    mmkv.set(k, v);
  },
  getItem: async (k) => mmkv.getString(k) ?? null,
  removeItem: async (k) => {
    mmkv.delete(k);
  },
  clear: async () => {
    mmkv.clearAll();
  },
};

<OptiCoreProvider
  config={{
    api: { baseURL: 'https://api.example.com' },
    adapters: { localStorage: mmkvAdapter },
  }}
>
  <App />
</OptiCoreProvider>;
```

Any adapter you omit falls back to the default chain (popular peer → memory).

---

## Adapter API reference

All interfaces live in `opticore-react-native/adapters`:

```ts
import type {
  SecureStorageAdapter,
  LocalStorageAdapter,
  ConnectivityAdapter,
  ConnectivitySnapshot,
  DeviceAdapter,
  ClipboardAdapter,
  OptiCoreAdapters,
} from 'opticore-react-native';
```

Each is a small, stable contract — see the [interfaces file](./src/adapters/interfaces.ts) for the canonical definition.

---

## Common upgrade issues

| Symptom                                             | Cause                                              | Fix                                                |
| --------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| `Cannot find module 'expo-secure-store'` at runtime | Peer not installed                                 | `npx expo install expo-secure-store`               |
| Storage seems to lose values between launches       | Falling back to memory adapter (no peer installed) | Install AsyncStorage as peer                       |
| `useConnectivity` always reports "online"           | NetInfo peer not installed                         | `npx expo install @react-native-community/netinfo` |
| Old `getClipboard` behavior unchanged               | Backwards compatible — no fix needed               | —                                                  |

---

## Rolling back

If you need to revert:

```bash
npm install opticore-react-native@1.0.0
```

…and accept the SDK-version pinning that comes with it. We recommend staying on `1.1.0` and pinning peers in your own `package.json` instead.
