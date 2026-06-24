# Utilities API Reference

40+ pure, tree-shakable utility functions with zero side effects.

### Import

```typescript
import { capitalize, formatDate, clamp } from 'opticore-react-native/utils';
// or from main entry
import { capitalize } from 'opticore-react-native';
```

---

## String Utilities

```typescript
import { capitalize, truncate, maskSensitive, toCamelCase,
         toSnakeCase, toKebabCase, isEmpty, isEmail, isURL } from 'opticore-react-native/utils';
```

| Function | Signature | Example |
|---|---|---|
| `capitalize` | `(str: string) => string` | `capitalize('hello')` → `'Hello'` |
| `truncate` | `(str, length, suffix?)` | `truncate('Hello World', 8)` → `'Hello...'` |
| `maskSensitive` | `(str, visibleChars?, maskChar?)` | `maskSensitive('4111111111111111', 4)` → `'************1111'` |
| `toCamelCase` | `(str: string) => string` | `toCamelCase('hello_world')` → `'helloWorld'` |
| `toSnakeCase` | `(str: string) => string` | `toSnakeCase('helloWorld')` → `'hello_world'` |
| `toKebabCase` | `(str: string) => string` | `toKebabCase('helloWorld')` → `'hello-world'` |
| `isEmpty` | `(str: string) => boolean` | `isEmpty('  ')` → `true` |
| `isEmail` | `(str: string) => boolean` | `isEmail('a@b.com')` → `true` |
| `isURL` | `(str: string) => boolean` | `isURL('https://example.com')` → `true` |
| `notNull` | `(str, fallback?) => string` | `notNull(null, 'N/A')` → `'N/A'` |

```typescript
// Real usage examples
capitalize('john doe');              // 'John doe'
truncate('A very long sentence', 12);// 'A very lon...'
maskSensitive('secret@email.com', 5);// '*************l.com'
toCamelCase('user_profile_data');    // 'userProfileData'
isEmpty('');                         // true
isEmpty('   ');                      // true
isEmail('invalid-email');            // false
```

---

## Number Utilities

```typescript
import { toInt, toDouble, clamp, random } from 'opticore-react-native/utils';
```

| Function | Signature | Description |
|---|---|---|
| `toInt` | `(value: unknown, fallback?: number) => number` | Safe `parseInt` with fallback |
| `toDouble` | `(value: unknown, fallback?: number) => number` | Safe `parseFloat` with fallback |
| `clamp` | `(value, min, max) => number` | Constrain value to range |
| `random` | `(min, max) => number` | Random integer (inclusive) |

```typescript
toInt('42');          // 42
toInt('abc');         // 0 (fallback)
toInt(null, -1);      // -1
toDouble('3.14');     // 3.14
clamp(150, 0, 100);   // 100
clamp(-10, 0, 100);   // 0
random(1, 6);         // 1..6 (dice roll)
```

---

## Array Utilities

```typescript
import { filterNonNull, groupBy, unique, sortBy } from 'opticore-react-native/utils';
```

| Function | Signature | Description |
|---|---|---|
| `filterNonNull` | `(arr: (T \| null \| undefined)[]) => T[]` | Remove null/undefined |
| `groupBy` | `(arr: T[], key: keyof T) => Record<string, T[]>` | Group by field |
| `unique` | `(arr: T[]) => T[]` | Remove duplicates |
| `sortBy` | `(arr, key, order?) => T[]` | Sort by field (asc/desc) |

```typescript
filterNonNull([1, null, 2, undefined, 3]);
// [1, 2, 3]

groupBy(users, 'role');
// { admin: [User, ...], viewer: [User, ...] }

unique([1, 2, 2, 3, 3, 3]);
// [1, 2, 3]

sortBy(products, 'price', 'asc');
// sorted by price ascending
```

---

## Date Utilities

Powered by `date-fns`.

```typescript
import { formatDate, parseDate, timeAgo, isToday, isYesterday, isSameDay } from 'opticore-react-native/utils';
```

| Function | Signature | Description |
|---|---|---|
| `formatDate` | `(date: Date \| string, format: string) => string` | Format with pattern |
| `parseDate` | `(str: string, format: string) => Date` | Parse from pattern |
| `timeAgo` | `(date: Date \| string) => string` | Relative time |
| `isToday` | `(date: Date \| string) => boolean` | Check if today |
| `isYesterday` | `(date: Date \| string) => boolean` | Check if yesterday |
| `isSameDay` | `(a, b) => boolean` | Compare two dates |

```typescript
formatDate(new Date(), 'MMM dd, yyyy');   // 'Mar 10, 2026'
formatDate(new Date(), 'HH:mm');          // '14:30'
parseDate('2026-03-10', 'yyyy-MM-dd');    // Date object
timeAgo(new Date(Date.now() - 3 * 60000)); // '3 minutes ago'
isToday(new Date());                       // true
isSameDay(date1, date2);                   // boolean
```

**Common format patterns** (date-fns):
- `yyyy-MM-dd` → `2026-03-10`
- `dd/MM/yyyy` → `10/03/2026`
- `MMM dd, yyyy` → `Mar 10, 2026`
- `HH:mm:ss` → `14:30:00`
- `EEE, MMM d` → `Tue, Mar 10`

---

## Object Utilities

```typescript
import { get, deepMerge, pick, omit } from 'opticore-react-native/utils';
```

| Function | Signature | Description |
|---|---|---|
| `get` | `(obj, path, fallback?) => unknown` | Safely read nested path |
| `deepMerge` | `(target, source) => object` | Deep merge two objects |
| `pick` | `(obj, keys) => Partial<T>` | Select properties |
| `omit` | `(obj, keys) => Partial<T>` | Exclude properties |

```typescript
const user = { profile: { address: { city: 'Cairo' } } };
get(user, 'profile.address.city');      // 'Cairo'
get(user, 'profile.phone', 'N/A');      // 'N/A' (fallback)

deepMerge(
  { a: 1, b: { x: 1 } },
  { b: { y: 2 }, c: 3 }
);
// { a: 1, b: { x: 1, y: 2 }, c: 3 }

pick(user, ['id', 'name']);             // { id, name }
omit(user, ['password', 'secret']);     // user without those keys
```

---

## Formatting Utilities

```typescript
import { formatPhone, formatCurrency, formatPercentage } from 'opticore-react-native/utils';
```

| Function | Signature | Example |
|---|---|---|
| `formatPhone` | `(phone: string) => string` | `formatPhone('5551234567')` → `'(555) 123-4567'` |
| `formatCurrency` | `(amount, currency?) => string` | `formatCurrency(1234.5)` → `'$1,234.50'` |
| `formatPercentage` | `(value, decimals?) => string` | `formatPercentage(0.845)` → `'84.5%'` |

```typescript
formatPhone('5551234567');           // '(555) 123-4567'
formatCurrency(1234.5);             // '$1,234.50'
formatCurrency(99.99, 'EUR');       // '€99.99'
formatPercentage(0.845);            // '84.5%'
formatPercentage(0.845, 0);         // '85%'
```

---

## Color Utilities

```typescript
import { hexToRgb, rgbToHex, lighten, darken } from 'opticore-react-native/utils';
```

| Function | Signature | Description |
|---|---|---|
| `hexToRgb` | `(hex: string) => { r, g, b }` | Convert hex to RGB |
| `rgbToHex` | `(r, g, b) => string` | Convert RGB to hex |
| `lighten` | `(color: string, amount: number) => string` | Lighten by % (0–1) |
| `darken` | `(color: string, amount: number) => string` | Darken by % (0–1) |

```typescript
hexToRgb('#6C63FF');              // { r: 108, g: 99, b: 255 }
rgbToHex(108, 99, 255);          // '#6C63FF'
lighten('#6C63FF', 0.2);         // lighter variant
darken('#6C63FF', 0.2);          // darker variant
```

---

## Platform Utilities

```typescript
import { isIOS, isAndroid, getDeviceWidth, copyToClipboard, getClipboard } from 'opticore-react-native/utils';
```

| Function | Signature | Description |
|---|---|---|
| `isIOS` | `() => boolean` | Check if running on iOS |
| `isAndroid` | `() => boolean` | Check if running on Android |
| `isWeb` | `() => boolean` | Check if running on web |
| `getDeviceWidth` | `() => number` | Screen width in dp |
| `getDeviceHeight` | `() => number` | Screen height in dp |
| `getOSVersion` | `() => string` | OS version string |
| `copyToClipboard` | `(text: string) => Promise<void>` | Copy to system clipboard |
| `getClipboard` | `() => Promise<string>` | Read from clipboard |

```typescript
if (isIOS()) {
  // iOS-specific behavior
}

const width = getDeviceWidth();
const isTablet = width >= 768;

await copyToClipboard('Hello!');
const text = await getClipboard();
```

---

## See Also

- [String masks](../FORMS.md) — phoneMask, creditCardMask, currencyMask
- [Theme colorUtils](../THEME.md) — colorUtils in the theme context
- [Types](../TYPES.md) — TypeScript type definitions

## String Utilities

### capitalize(str)

Capitalize first letter.

```typescript
import { capitalize } from 'opticore-react-native/utils/string';

capitalize('hello'); // 'Hello'
```

### truncate(str, maxLength, suffix?)

Truncate string to max length.

```typescript
truncate('Hello World', 8); // 'Hello...'
truncate('Hello World', 8, '…'); // 'Hello W…'
```

### slugify(str)

Convert to URL-friendly slug.

```typescript
slugify('Hello World!'); // 'hello-world'
```

### camelCase(str), kebabCase(str), snakeCase(str)

Convert case styles.

```typescript
camelCase('hello-world'); // 'helloWorld'
kebabCase('helloWorld'); // 'hello-world'
snakeCase('helloWorld'); // 'hello_world'
```

---

## Number Utilities

### clamp(value, min, max)

Clamp value between min and max.

```typescript
import { clamp } from 'opticore-react-native/utils/number';

clamp(150, 0, 100); // 100
clamp(-10, 0, 100); // 0
```

### round(value, decimals?)

Round to decimal places.

```typescript
round(3.14159, 2); // 3.14
```

### formatCurrency(amount, currency?)

Format as currency.

```typescript
formatCurrency(1234.56); // '$1,234.56'
formatCurrency(1234.56, 'EUR'); // '€1,234.56'
```

### percentage(value, total)

Calculate percentage.

```typescript
percentage(25, 100); // 25
percentage(1, 3); // 33.33
```

---

## Date Utilities

### formatDate(date, format?)

Format date.

```typescript
import { formatDate } from 'opticore-react-native/utils/date';

formatDate(new Date()); // '2026-02-05'
formatDate(new Date(), 'MM/DD/YYYY'); // '02/05/2026'
```

### isToday(date), isYesterday(date), isTomorrow(date)

Check date relativity.

```typescript
isToday(new Date()); // true
```

### getDaysBetween(start, end)

Get days between dates.

```typescript
getDaysBetween(new Date('2026-02-01'), new Date('2026-02-05')); // 4
```

### addDays(date, days)

Add days to date.

```typescript
addDays(new Date(), 7); // Date one week from now
```

---

## Array Utilities

### chunk(array, size)

Split into chunks.

```typescript
import { chunk } from 'opticore-react-native/utils/array';

chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
```

### unique(array)

Remove duplicates.

```typescript
unique([1, 2, 2, 3, 3, 3]); // [1, 2, 3]
```

### groupBy(array, key)

Group by property.

```typescript
const users = [
  { name: 'John', role: 'admin' },
  { name: 'Jane', role: 'user' },
  { name: 'Bob', role: 'admin' }
];

groupBy(users, 'role');
// { admin: [...], user: [...] }
```

### shuffle(array)

Randomly shuffle.

```typescript
shuffle([1, 2, 3, 4, 5]); // [3, 1, 5, 2, 4]
```

---

## Object Utilities

### deepMerge(target, ...sources)

Deep merge objects.

```typescript
import { deepMerge } from 'opticore-react-native/utils/object';

deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 } });
// { a: 1, b: { c: 2, d: 3 } }
```

### pick(object, keys)

Pick properties.

```typescript
pick({ a: 1, b: 2, c: 3 }, ['a', 'c']); // { a: 1, c: 3 }
```

### omit(object, keys)

Omit properties.

```typescript
omit({ a: 1, b: 2, c: 3 }, ['b']); // { a: 1, c: 3 }
```

### isEmpty(value)

Check if empty.

```typescript
isEmpty({}); // true
isEmpty([]); // true
isEmpty(''); // true
isEmpty(null); // true
```

---

## Color Utilities

### hexToRgb(hex)

Convert hex to RGB.

```typescript
import { hexToRgb } from 'opticore-react-native/utils/color';

hexToRgb('#FF5733'); // { r: 255, g: 87, b: 51 }
```

### rgbToHex(r, g, b)

Convert RGB to hex.

```typescript
rgbToHex(255, 87, 51); // '#FF5733'
```

### adjustOpacity(color, opacity)

Adjust opacity.

```typescript
adjustOpacity('#FF5733', 0.5); // 'rgba(255, 87, 51, 0.5)'
```

---

## Validation Utilities

### isEmail(str)

Validate email.

```typescript
import { isEmail } from 'opticore-react-native/utils/validation';

isEmail('user@example.com'); // true
```

### isUrl(str)

Validate URL.

```typescript
isUrl('https://example.com'); // true
```

### isPhoneNumber(str)

Validate phone number.

```typescript
isPhoneNumber('+1234567890'); // true
```

---

## Platform Utilities

### isIOS(), isAndroid(), isWeb()

Check platform.

```typescript
import { isIOS, isAndroid } from 'opticore-react-native/utils/platform';

if (isIOS()) {
  // iOS-specific code
}
```

### getDeviceInfo()

Get device information.

```typescript
const info = getDeviceInfo();
// { platform: 'ios', version: '17.0', model: 'iPhone' }
```

## URL Utilities

### buildUrl(path, params?)

Build a URL path with an encoded query string. Keys and values are URL-encoded;
`null` / `undefined` / empty-string values are dropped. Replaces manual string concatenation and
`encodeURIComponent` when constructing API paths.

```typescript
import { buildUrl } from 'opticore-react-native';

buildUrl('/search', { q: 'hello world', pageSize: 30 });
// '/search?q=hello%20world&pageSize=30'

buildUrl('/users', { active: true, role: undefined });
// '/users?active=true'   (undefined dropped)

buildUrl('/users');
// '/users'               (no params → unchanged)
```

Param values are typed as `QueryParamValue` (`string | number | boolean | null | undefined`).

> For requests, prefer passing a `params` object straight to `ApiClient.request({ url, params })` —
> the client serializes the query string for you. Reach for `buildUrl` only to build a URL string
> *outside* a request.

---

**See also**:
- [Hooks API](./HOOKS.md)
- [Infrastructure API](./INFRASTRUCTURE.md) — `ApiClient`
- [QuickStart Guide](../QUICK_START.md)
