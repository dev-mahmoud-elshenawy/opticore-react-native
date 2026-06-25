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
  // Runs validation, then awaits onValid (or onInvalid). Returns a Promise — NOT a thunk.
  handleSubmit: (onValid: SubmitHandler<T>, onInvalid?: SubmitErrorHandler<T>) => Promise<void>;
  reset: UseFormReset<T>;     // RHF reset — accepts values AND a ResetOptions second arg
  setValue: UseFormSetValue<T>;
  getValue: UseFormGetValues<T>;
  watch: UseFormWatch<T>;
  control: Control<T>;        // RHF control object, for <Controller>-based fields
  register: UseFormRegister<T>; // RHF register, for uncontrolled inputs
}
```

> `handleSubmit` returns a `Promise<void>` directly — call it as `handleSubmit(onSubmit)`, not
> `handleSubmit(onSubmit)()`. Other field-level helpers (e.g. `clearErrors`) live on the
> `form` instance: `form.clearErrors()`.

---

## Complete Example

```typescript
import { api } from 'opticore-react-native';
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
    await api.post('/auth/login', data);
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

Pure standalone functions that format input as the user types. Each has a matching `unmask*`
function that strips formatting back to raw input.

```typescript
import {
  applyPhoneMask, unmaskPhone,
  applyCreditCardMask, unmaskCreditCard, validateCardNumber, detectCardType,
  applyCurrencyMask, unmaskCurrency,
} from 'opticore-react-native/forms';
```

### applyPhoneMask

```typescript
applyPhoneMask('5551234567')   // '(555) 123-4567'
applyPhoneMask('555123')       // '(555) 123'
```

```typescript
<TextInput
  value={applyPhoneMask(String(watch('phone') ?? ''))}
  onChangeText={(v) => setValue('phone', unmaskPhone(v))} // store raw digits
  keyboardType="phone-pad"
  placeholder="(555) 123-4567"
/>
```

### applyCreditCardMask

`detectCardType` returns the card brand and `validateCardNumber` runs a Luhn check.

```typescript
applyCreditCardMask('4111111111111111')  // '4111 1111 1111 1111'
detectCardType('4111111111111111')       // CardType.VISA
validateCardNumber('4111111111111111')   // true
```

```typescript
<TextInput
  value={applyCreditCardMask(String(watch('card') ?? ''))}
  onChangeText={(v) => setValue('card', unmaskCreditCard(v))}
  keyboardType="numeric"
  maxLength={19}
  placeholder="4111 1111 1111 1111"
/>
```

### applyCurrencyMask

`applyCurrencyMask` takes a **number** (not a string) plus optional `CurrencyOptions`
(`currency`, `locale`, `symbol`, `precision`).

```typescript
applyCurrencyMask(1234.56)   // '$1,234.56'
applyCurrencyMask(1000)      // '$1,000.00'
```

```typescript
<TextInput
  value={applyCurrencyMask(Number(watch('amount') ?? 0))}
  onChangeText={(v) => setValue('amount', unmaskCurrency(v))}
  keyboardType="numeric"
  placeholder="$0.00"
/>
```

---

## useFieldValidation

Standalone per-field validation with optional debounce. Use for async validation or inline field feedback.

It takes the field `value`, a `Validator<T>` function (NOT a Zod schema), and options. The
returned `validate()` takes **no arguments** — it validates the hook's debounced `value`.

```typescript
function useFieldValidation<T>(
  value: T,
  validator: Validator<T>,
  options?: ValidationOptions
): FieldValidationReturn
```

```typescript
// A Validator returns an error message string, or undefined when valid (may be async).
type Validator<T> = (value: T) => string | undefined | Promise<string | undefined>;

interface ValidationOptions {
  debounceMs?: number;        // default: 300
  message?: string;
}

interface FieldValidationReturn {
  error: string | undefined;
  isValid: boolean;
  isValidating: boolean;
  validate: () => Promise<boolean>;   // validates the hook's (debounced) value — no args
}
```

> Pass a **stable** `validator` reference (module-level or `useCallback`'d). An inline function
> is a new identity each render, so the auto-validate effect would re-run every render.

```typescript
const validateEmail = (v: string) =>
  /^[^@]+@[^@]+$/.test(v) ? undefined : 'Invalid email';

function EmailField() {
  const [value, setValue] = useState('');
  const { error, isValid, isValidating, validate } = useFieldValidation(
    value,
    validateEmail,
    { debounceMs: 300 }
  );

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={async (v) => {
          setValue(v);
          await validate(); // no args — validates the debounced value
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
import { validators, PhoneFormat } from 'opticore-react-native/forms';
```

```typescript
const schema = z.object({
  email: validators.email('Please enter a valid email'),
  phone: validators.phone({ format: PhoneFormat.US }),
  password: validators.password({ minLength: 8, requireUppercase: true }),
  website: validators.url('Enter a valid URL'),
  name: validators.required('Name is required')
    .pipe(validators.minLength(2, 'Name too short'))
    .pipe(validators.maxLength(50, 'Name too long')),
});
```

### Validators Reference

| Validator | Options | Description |
|---|---|---|
| `validators.email(msg?)` | — | Valid email format |
| `validators.phone(opts?)` | `format: PhoneFormat.US \| PhoneFormat.INTERNATIONAL` | Phone number |
| `validators.password(opts?)` | `minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecial` | Password strength |
| `validators.required(msg?)` | — | Non-empty string |
| `validators.minLength(n, msg?)` | — | Minimum length |
| `validators.maxLength(n, msg?)` | — | Maximum length |
| `validators.matches(regex, msg?)` | — | Regex pattern |
| `validators.url(msg?)` | — | Valid URL |

---

## Async Validation

```typescript
import { api } from 'opticore-react-native';

const schema = z.object({
  username: z.string()
    .min(3, 'Too short')
    .refine(
      async (val) => {
        const { data } = await api.get<{ available: boolean }>(`/check-username/${val}`);
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
