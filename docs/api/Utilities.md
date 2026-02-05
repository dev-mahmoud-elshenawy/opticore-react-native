# Utilities API Reference

Pure utility functions for common operations.

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

---

**See also**:
- [Hooks API](./Hooks.md)
- [QuickStart Guide](../QuickStart.md)
