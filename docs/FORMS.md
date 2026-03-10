# 📋 Forms Infrastructure

OptiCore's form layer wraps **React Hook Form** + **Zod** with built-in input masks, i18n error messages, and async validation — out of the box.

---

## Quick Start

```typescript
import { useFormState } from 'opticore-react-native/forms';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone too short'),
  age: z.number().min(18, 'Must be 18+'),
});

type FormData = z.infer<typeof schema>;

function SignUpForm() {
  const { errors, handleSubmit, setValue, watch, isSubmitting, isValid } =
    useFormState<FormData>({
      schema,
      defaultValues: { email: '', phone: '', age: 18 },
      mode: 'onChange',
    });

  const onSubmit = async (data: FormData) => {
    await api.post('/register', data);
  };

  return (
    <View>
      <TextInput
        value={watch('email')}
        onChangeText={(v) => setValue('email', v)}
        placeholder="Email"
      />
      {errors.email && <Text style={{ color: 'red' }}>{errors.email.message}</Text>}

      <Button
        onPress={handleSubmit(onSubmit)}
        title={isSubmitting ? 'Submitting...' : 'Sign Up'}
        disabled={!isValid || isSubmitting}
      />
    </View>
  );
}
```

---

## useFormState API

```typescript
const {
  form,           // React Hook Form instance (full access)
  errors,         // Typed field errors
  isSubmitting,   // True during async onSubmit
  isValid,        // True when all fields pass validation
  isDirty,        // True when any field has changed
  setValue,       // Set a field value programmatically
  getValue,       // Get current field value
  watch,          // Watch field for changes
  reset,          // Reset form to defaults
  handleSubmit,   // Wrap submit handler with validation
  clearErrors,    // Clear all or specific errors
} = useFormState<T>({ schema, defaultValues, mode });
```

---

## Input Masks

```typescript
import { phoneMask, creditCardMask, currencyMask } from 'opticore-react-native/forms';

// Phone mask: (555) 123-4567
<TextInput
  value={phoneMask(watch('phone'))}
  onChangeText={(v) => setValue('phone', phoneMask(v))}
/>

// Credit card: 4111 1111 1111 1111
<TextInput
  value={creditCardMask(watch('card'))}
  onChangeText={(v) => setValue('card', creditCardMask(v))}
  keyboardType="numeric"
/>

// Currency: $1,234.56
<TextInput
  value={currencyMask(watch('amount'))}
  onChangeText={(v) => setValue('amount', currencyMask(v))}
/>
```

### Available Masks

| Mask | Example Output |
|---|---|
| `phoneMask` | `(555) 123-4567` |
| `creditCardMask` | `4111 1111 1111 1111` |
| `currencyMask` | `$1,234.56` |
| `dateMask` | `12/31/2024` |
| `cpfMask` | `123.456.789-00` |
| `cnpjMask` | `12.345.678/0001-90` |
| `zipCodeMask` | `12345-678` |

---

## Field-Level Validation Hook

```typescript
import { useFieldValidation } from 'opticore-react-native/hooks';

function EmailField() {
  const { value, error, validate, isValid, onChange } = useFieldValidation({
    schema: z.string().email(),
    debounce: 300,
  });

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={{ borderColor: error ? 'red' : isValid ? 'green' : 'gray' }}
      />
      {error && <Text>{error}</Text>}
    </View>
  );
}
```

---

## Async Validation

```typescript
const schema = z.object({
  username: z.string().min(3).refine(
    async (val) => {
      const { available } = await api.get(`/check-username/${val}`);
      return available;
    },
    { message: 'Username already taken' }
  ),
});
```

---

## Error i18n

Validation error messages are plain strings — pass them through your i18n layer:

```typescript
const schema = z.object({
  email: z.string().email(t('validation.email')),
  password: z.string().min(8, t('validation.passwordMin', { min: 8 })),
});
```

---

## Notes

- Built on React Hook Form `^7.54` + Zod `^3.24` — both fully supported
- All masks are pure functions — use them independently of `useFormState`
- `useFormState` exposes the full RHF `form` instance for advanced use cases
