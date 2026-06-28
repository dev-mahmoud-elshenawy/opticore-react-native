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
function useFormState<T extends object>(config: FormConfig<T>): FormStateReturn<T>;
```

### FormConfig

```typescript
interface FormConfig<T> {
  schema?: ZodSchema<T>; // Zod schema for validation
  defaultValues?: Partial<T>; // Initial field values
  mode?: 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched' | 'all'; // default: 'onSubmit'
  reValidateMode?: 'onSubmit' | 'onBlur' | 'onChange'; // default: 'onChange'
}
```

### FormStateReturn

A simple facade over React Hook Form — use `field()` + `submit()`; never touch RHF's
`control`/`register`/`handleSubmit` directly.

```typescript
interface FormStateReturn<T> {
  // Spread onto a TextInput: <TextInput {...field('email')} /> — value/onChangeText/onBlur/error
  field: (name: Path<T>) => {
    value: string;
    onChangeText: (t: string) => void;
    onBlur: () => void;
    error?: string;
  };
  // Validate, then run onValid if valid. Just call it (returns a Promise).
  submit: (onValid: SubmitHandler<T>, onInvalid?: SubmitErrorHandler<T>) => Promise<void>;
  errors: FieldErrors<T>; // Typed validation errors
  isValid: boolean; // All fields pass validation
  isSubmitting: boolean; // True during async onValid
  isDirty: boolean; // At least one field changed
  reset: UseFormReset<T>; // RHF reset — accepts values AND a ResetOptions second arg
  setValue: UseFormSetValue<T>;
  getValue: UseFormGetValues<T>;
  watch: UseFormWatch<T>;
  form: UseFormReturn<T>; // escape hatch: full RHF (control/register/trigger/clearErrors/…)
}
```

> `field('name')` is for **text** inputs. `submit(onValid)` validates then runs `onValid` —
> call it on press (`onPress={() => submit(save)}`), not at render. Anything RHF that the facade
> doesn't surface lives on `form` (e.g. `form.clearErrors()`, `form.control` for `<Controller>`).

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
  const { field, submit, isValid, isSubmitting } = useFormState<LoginForm>({
    schema,
    defaultValues: { email: '', password: '', phone: '', age: 18 },
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginForm) => {
    await api.post('/auth/login', data);
  };

  // field('email') → { value, onChangeText, onBlur, error }
  const email = field('email');
  const password = field('password');

  return (
    <ScrollView>
      <TextInput
        value={email.value}
        onChangeText={email.onChangeText}
        onBlur={email.onBlur}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {email.error && <Text style={{ color: 'red' }}>{email.error}</Text>}

      <TextInput
        value={password.value}
        onChangeText={password.onChangeText}
        onBlur={password.onBlur}
        placeholder="Password"
        secureTextEntry
      />
      {password.error && <Text style={{ color: 'red' }}>{password.error}</Text>}

      <Button
        title={isSubmitting ? 'Signing in...' : 'Sign In'}
        onPress={() => submit(onSubmit)}
        disabled={!isValid || isSubmitting}
      />
    </ScrollView>
  );
}
```

> **Tip:** with a small wrapper component that accepts an `error` prop (e.g. a `TextField`),
> the binding is a one-liner — `<TextField {...field('email')} />` — since `field()`'s shape
> (`value`/`onChangeText`/`onBlur`/`error`) is designed to spread straight onto it.

---

## Input Masks

Pure standalone functions that format input as the user types. Each has a matching `unmask*`
function that strips formatting back to raw input.

```typescript
import {
  applyPhoneMask,
  unmaskPhone,
  applyCreditCardMask,
  unmaskCreditCard,
  validateCardNumber,
  detectCardType,
  applyCurrencyMask,
  unmaskCurrency,
} from 'opticore-react-native/forms';
```

### applyPhoneMask

```typescript
applyPhoneMask('5551234567'); // '(555) 123-4567'
applyPhoneMask('555123'); // '(555) 123'
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
applyCreditCardMask('4111111111111111'); // '4111 1111 1111 1111'
detectCardType('4111111111111111'); // CardType.VISA
validateCardNumber('4111111111111111'); // true
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
applyCurrencyMask(1234.56); // '$1,234.56'
applyCurrencyMask(1000); // '$1,000.00'
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
): FieldValidationReturn;
```

```typescript
// A Validator returns an error message string, or undefined when valid (may be async).
type Validator<T> = (value: T) => string | undefined | Promise<string | undefined>;

interface ValidationOptions {
  debounceMs?: number; // default: 300
  message?: string;
}

interface FieldValidationReturn {
  error: string | undefined;
  isValid: boolean;
  isValidating: boolean;
  validate: () => Promise<boolean>; // validates the hook's (debounced) value — no args
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
  name: validators
    .required('Name is required')
    .pipe(validators.minLength(2, 'Name too short'))
    .pipe(validators.maxLength(50, 'Name too long')),
});
```

### Validators Reference

| Validator                         | Options                                                                         | Description        |
| --------------------------------- | ------------------------------------------------------------------------------- | ------------------ |
| `validators.email(msg?)`          | —                                                                               | Valid email format |
| `validators.phone(opts?)`         | `format: PhoneFormat.US \| PhoneFormat.INTERNATIONAL`                           | Phone number       |
| `validators.password(opts?)`      | `minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecial` | Password strength  |
| `validators.required(msg?)`       | —                                                                               | Non-empty string   |
| `validators.minLength(n, msg?)`   | —                                                                               | Minimum length     |
| `validators.maxLength(n, msg?)`   | —                                                                               | Maximum length     |
| `validators.matches(regex, msg?)` | —                                                                               | Regex pattern      |
| `validators.url(msg?)`            | —                                                                               | Valid URL          |

---

## Async Validation

```typescript
import { api } from 'opticore-react-native';

const schema = z.object({
  username: z
    .string()
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

  const onAccountSubmit = () =>
    accountForm.submit(async (data) => {
      setFormData((prev) => ({ ...prev, ...data }));
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
