# Forms Infrastructure

React Hook Form + Zod + input masks + field-level validation. Everything you need for production forms.

---

## Setup

No extra setup required. Import directly:

```typescript
import { useFormState } from 'opticore-react-native/forms';
import { z } from 'zod';
```

---

## useFormState

The primary form hook. Wraps React Hook Form with schema-based validation.

```typescript
function useFormState<T extends object>(config: FormConfig<T>): FormStateReturn<T>
```

### FormConfig

```typescript
interface FormConfig<T> {
  schema?: ZodSchema<T>;              // Zod schema for validation
  defaultValues?: Partial<T>;         // Initial field values
  mode?: 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched' | 'all';  // default: 'onSubmit'
  reValidateMode?: 'onSubmit' | 'onBlur' | 'onChange';               // default: 'onChange'
}
```

### FormStateReturn

```typescript
interface FormStateReturn<T> {
  form: UseFormReturn<T>;      // Full React Hook Form instance
  errors: FieldErrors<T>;     // Typed validation errors
  isValid: boolean;           // All fields pass validation
  isSubmitting: boolean;      // True during async onSubmit
  isDirty: boolean;           // At least one field changed
  handleSubmit: (fn: (data: T) => Promise<void> | void) => () => void;
  reset: (values?: Partial<T>) => void;
  setValue: (name: keyof T, value: unknown) => void;
  getValue: (name: keyof T) => unknown;
  watch: (name?: keyof T) => unknown;
  clearErrors: (name?: keyof T | Array<keyof T>) => void;
}
```

---

## Complete Example

```typescript
import { ApiClient, HttpMethod } from 'opticore-react-native';
import { useFormState } from 'opticore-react-native/forms';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  age: z.number().min(18, 'Must be 18 or older'),
});

type LoginForm = z.infer<typeof schema>;

function LoginScreen() {
  const {
    errors,
    isValid,
    isSubmitting,
    handleSubmit,
    setValue,
    watch,
  } = useFormState<LoginForm>({
    schema,
    defaultValues: { email: '', password: '', phone: '', age: 18 },
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginForm) => {
    await ApiClient.getInstance().request({ method: HttpMethod.POST, url: '/auth/login', data: data });
  };

  return (
    <ScrollView>
      <TextInput
        value={String(watch('email') ?? '')}
        onChangeText={(v) => setValue('email', v)}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={{ color: 'red' }}>{errors.email.message}</Text>}

      <TextInput
        value={String(watch('password') ?? '')}
        onChangeText={(v) => setValue('password', v)}
        placeholder="Password"
        secureTextEntry
      />
      {errors.password && <Text style={{ color: 'red' }}>{errors.password.message}</Text>}

      <Button
        title={isSubmitting ? 'Signing in...' : 'Sign In'}
        onPress={handleSubmit(onSubmit)}
        disabled={!isValid || isSubmitting}
      />
    </ScrollView>
  );
}
```

---

## Input Masks

Pure functions that format input as the user types.

```typescript
import { phoneMask, creditCardMask, currencyMask } from 'opticore-react-native/forms';
```

### phoneMask

```typescript
phoneMask.apply('5551234567')   // '(555) 123-4567'
phoneMask.apply('555123')       // '(555) 123'
```

```typescript
<TextInput
  value={phoneMask.apply(String(watch('phone') ?? ''))}
  onChangeText={(v) => setValue('phone', v.replace(/\D/g, ''))} // store raw digits
  keyboardType="phone-pad"
  placeholder="(555) 123-4567"
/>
```

### creditCardMask

```typescript
creditCardMask.apply('4111111111111111')  // '4111 1111 1111 1111'
```

```typescript
<TextInput
  value={creditCardMask.apply(String(watch('card') ?? ''))}
  onChangeText={(v) => setValue('card', v.replace(/\D/g, ''))}
  keyboardType="numeric"
  maxLength={19}
  placeholder="4111 1111 1111 1111"
/>
```

### currencyMask

```typescript
currencyMask.apply('1234.56')   // '$1,234.56'
currencyMask.apply('1000')      // '$1,000.00'
```

```typescript
<TextInput
  value={currencyMask.apply(String(watch('amount') ?? ''))}
  onChangeText={(v) => setValue('amount', parseFloat(v.replace(/[^0-9.]/g, '')))}
  keyboardType="numeric"
  placeholder="$0.00"
/>
```

---

## useFieldValidation

Standalone per-field validation with optional debounce. Use for async validation or inline field feedback.

```typescript
function useFieldValidation<T>(config: FieldValidationConfig<T>): FieldValidationReturn
```

```typescript
interface FieldValidationConfig<T> {
  schema: ZodSchema<T>;
  debounceMs?: number;        // default: 0 (immediate)
}

interface FieldValidationReturn {
  error: string | undefined;
  isValid: boolean;
  isValidating: boolean;
  validate: (value: unknown) => Promise<boolean>;
}
```

```typescript
function EmailField() {
  const [value, setValue] = useState('');
  const { error, isValid, isValidating, validate } = useFieldValidation({
    schema: z.string().email('Invalid email'),
    debounceMs: 300,
  });

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={async (v) => {
          setValue(v);
          await validate(v);
        }}
        style={{
          borderColor: error ? '#EF4444' : isValid ? '#10B981' : '#D1D5DB',
          borderWidth: 1,
        }}
      />
      {isValidating && <ActivityIndicator size="small" />}
      {error && <Text style={{ color: '#EF4444' }}>{error}</Text>}
      {isValid && !isValidating && <Text style={{ color: '#10B981' }}>✓</Text>}
    </View>
  );
}
```

---

## Built-in Validators

Pre-built Zod validators for common fields:

```typescript
import { validators } from 'opticore-react-native/forms';
```

```typescript
const schema = z.object({
  email: validators.email('Please enter a valid email'),
  phone: validators.phone({ format: 'US' }),
  password: validators.password({ minLength: 8, requireUppercase: true }),
  website: validators.common.url('Enter a valid URL'),
  name: validators.common.required('Name is required')
    .pipe(validators.common.minLength(2, 'Name too short'))
    .pipe(validators.common.maxLength(50, 'Name too long')),
});
```

### Validators Reference

| Validator | Options | Description |
|---|---|---|
| `validators.email(msg?)` | — | Valid email format |
| `validators.phone(opts?)` | `format: 'US' \| 'International'` | Phone number |
| `validators.password(opts?)` | `minLength, requireUppercase, requireNumber, requireSpecial` | Password strength |
| `validators.common.required(msg?)` | — | Non-empty string |
| `validators.common.minLength(n, msg?)` | — | Minimum length |
| `validators.common.maxLength(n, msg?)` | — | Maximum length |
| `validators.common.matches(regex, msg?)` | — | Regex pattern |
| `validators.common.url(msg?)` | — | Valid URL |

---

## Async Validation

```typescript
import { ApiClient, HttpMethod } from 'opticore-react-native';

const schema = z.object({
  username: z.string()
    .min(3, 'Too short')
    .refine(
      async (val) => {
        const { data } = await ApiClient.getInstance().request({ method: HttpMethod.GET, url: `/check-username/${val}` });
        return data.available;
      },
      { message: 'Username already taken' }
    ),
});
```

---

## Multi-Step Form

```typescript
function SignUpFlow() {
  const [step, setStep] = useState<'account' | 'profile' | 'payment'>('account');
  const [formData, setFormData] = useState({});

  const accountForm = useFormState({
    schema: accountSchema,
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const profileForm = useFormState({
    schema: profileSchema,
    defaultValues: { name: '', phone: '' },
    mode: 'onChange',
  });

  const onAccountSubmit = accountForm.handleSubmit(async (data) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep('profile');
  });

  // ...
}
```

---

## Error i18n

Validation errors are plain strings — pass them through your i18n system:

```typescript
import { useTranslation } from 'react-i18next';

function useLoginForm() {
  const { t } = useTranslation();

  return useFormState({
    schema: z.object({
      email: z.string().email(t('validation.email')),
      password: z.string().min(8, t('validation.passwordMin', { min: 8 })),
    }),
    defaultValues: { email: '', password: '' },
  });
}
```

---

## See Also

- [Hooks → useAsyncState](./api/HOOKS.md) — For non-form async operations
- [Configuration → forms](./CONFIGURATION.md#forms--optional) — Default form settings
- [Zod Documentation](https://zod.dev) — Full Zod schema reference
