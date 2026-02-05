# Error Handling API Reference

Error classification and handling for UI and logging.

## Error Types

### BaseError (abstract)

Base class for all opticore errors.

```typescript
abstract class BaseError extends Error {
  code?: string;
  timestamp: Date;
}
```

---

### RenderError

Errors that should be shown to users.

```typescript
import { RenderError } from 'opticore-react-native';

throw new RenderError('Invalid email address', 'VALIDATION_ERROR');
```

**Use for**:
- Validation errors
- User input errors
- Business logic errors
- API errors with user-friendly messages

---

### NonRenderError

Errors that should only be logged (not shown to users).

```typescript
import { NonRenderError } from 'opticore-react-native';

throw new NonRenderError('Database connection failed', 'DB_ERROR');
```

**Use for**:
- System errors
- Developer errors
- Infrastructure failures
- Unexpected errors

---

## Custom Error Types

### Creating Custom Errors

```typescript
// Custom RenderError
export class PaymentError extends RenderError {
  constructor(message: string, public amount?: number) {
    super(message, 'PAYMENT_ERROR');
    this.name = 'PaymentError';
  }
}

// Custom NonRenderError
export class DatabaseError extends NonRenderError {
  constructor(message: string, public query?: string) {
    super(message, 'DB_ERROR');
    this.name = 'DatabaseError';
  }
}

// Usage
throw new PaymentError('Insufficient funds', 1000);
throw new DatabaseError('Query failed', 'SELECT * FROM users');
```

---

## Error Handling Patterns

### Try-Catch with Classification

```typescript
import { RenderError, NonRenderError, Logger } from 'opticore-react-native';

async function fetchUserData() {
  try {
    const response = await apiClient.get('/user');
    return response.data;
  } catch (error) {
    if (error instanceof RenderError) {
      // Show to user
      Alert.alert('Error', error.message);
    } else if (error instanceof NonRenderError) {
      // Log only
      Logger.error('Background error', error);
    } else {
      // Unknown error - log and show generic message
      Logger.error('Unexpected error', error);
      Alert.alert('Error', 'Something went wrong');
    }
    throw error;
  }
}
```

---

### Error Boundaries

```typescript
import { Component, ReactNode } from 'react';
import { Logger } from 'opticore-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    Logger.error('React Error Boundary caught error', {
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorScreen />;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorScreen />}>
  <App />
</ErrorBoundary>
```

---

### Global Error Handler

```typescript
import { Logger } from 'opticore-react-native';
import { ErrorUtils } from 'react-native';

// Set global error handler
const globalErrorHandler = (error: Error, isFatal: boolean) => {
  Logger.error('Global error', { error, isFatal });
  
  if (isFatal) {
    // Show crash screen or restart app
    Alert.alert(
      'Unexpected Error',
      'The app has encountered an error and needs to restart.',
      [{ text: 'Restart', onPress: () => /* restart */ }]
    );
  }
};

ErrorUtils.setGlobalHandler(globalErrorHandler);
```

---

## API Error Handling

### Axios Interceptor

```typescript
import { ApiClient } from 'opticore-react-native';

const apiClient = ApiClient.getInstance();

apiClient.client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new RenderError(data.message || 'Invalid request', 'BAD_REQUEST');
        case 401:
          throw new RenderError('Please log in again', 'UNAUTHORIZED');
        case 403:
          throw new RenderError('Access denied', 'FORBIDDEN');
        case 404:
          throw new RenderError('Resource not found', 'NOT_FOUND');
        case 500:
          throw new NonRenderError('Server error', 'SERVER_ERROR');
        default:
          throw new NonRenderError(`HTTP ${status}`, 'HTTP_ERROR');
      }
    }
    
    throw new NonRenderError('Network error', 'NETWORK_ERROR');
  }
);
```

---

## Validation Errors

```typescript
import { RenderError } from 'opticore-react-native';

export class ValidationError extends RenderError {
  constructor(
    message: string,
    public field?: string,
    public value?: any
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

// Usage
function validateEmail(email: string) {
  if (!email.includes('@')) {
    throw new ValidationError('Invalid email format', 'email', email);
  }
}

// In form
try {
  validateEmail(formData.email);
  await submitForm(formData);
} catch (error) {
  if (error instanceof ValidationError) {
    setFieldError(error.field, error.message);
  }
}
```

---

## Error Logging

### With Logger

```typescript
import { Logger } from 'opticore-react-native';

try {
  await riskyOperation();
} catch (error) {
  Logger.error('Operation failed', {
    error,
    context: 'user_action',
    userId: currentUser.id,
  });
}
```

---

### With Remote Logging

```typescript
import { Logger } from 'opticore-react-native';

// Configure remote logging (e.g., Sentry)
CoreSetup.initialize({
  enableLogging: true,
  remoteLogging: {
    enabled: true,
    endpoint: 'https://logging.example.com',
    apiKey: 'xxx',
  },
});

// Errors will be sent to remote service
Logger.error('Critical error', error);
```

---

## Best Practices

### 1. Use Specific Error Types

```typescript
// ❌ Bad
throw new Error('Invalid input');

// ✅ Good
throw new ValidationError('Email is required', 'email');
```

### 2. Provide Context

```typescript
// ❌ Bad
throw new RenderError('Failed');

// ✅ Good
throw new RenderError('Failed to save profile. Please check your connection.');
```

### 3. Log NonRenderErrors

```typescript
// ❌ Bad
catch (error) {
  // Silent failure
}

// ✅ Good
catch (error) {
  if (error instanceof NonRenderError) {
    Logger.error('Background error', error);
  }
}
```

### 4. Don't Show Technical Details to Users

```typescript
// ❌ Bad
Alert.alert('Error', error.stack);

// ✅ Good
if (error instanceof RenderError) {
  Alert.alert('Error', error.message);
} else {
  Alert.alert('Error', 'Something went wrong. Please try again.');
}
```

---

**See also**:
- [Infrastructure API](./Infrastructure.md)
- [Testing Guide](../Testing.md)
- [Architecture](../Architecture.md)
