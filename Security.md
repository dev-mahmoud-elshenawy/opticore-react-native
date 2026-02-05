# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of opticore-react-native seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Open a Public Issue

Please **do not** report security vulnerabilities through public GitHub issues.

### 2. Report Privately

Send an email to: **security@yourproject.com** (replace with actual email)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Fix timeline**: Depends on severity

### 4. Disclosure Policy

- We will acknowledge receipt of your vulnerability report
- We will confirm the vulnerability and determine its severity
- We will release a fix as soon as possible
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

When using opticore-react-native:

### Secure Storage

Always use `StorageManager.setSecure()` for sensitive data:

```typescript
// ✅ Good
await StorageManager.setSecure('auth_token', token);

// ❌ Bad
await StorageManager.set('auth_token', token);
```

### API Keys

Never hardcode API keys. Use environment variables:

```typescript
// ✅ Good
CoreSetup.initialize({
  apiBaseURL: process.env.EXPO_PUBLIC_API_URL,
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
});

// ❌ Bad
CoreSetup.initialize({
  apiBaseURL: 'https://api.example.com',
  apiKey: 'hardcoded_key_123',
});
```

### Error Messages

Don't expose sensitive information in error messages:

```typescript
// ✅ Good
throw new RenderError('Login failed. Please check your credentials.');

// ❌ Bad
throw new RenderError(`Login failed: ${internalErrorDetails}`);
```

### Logging

Disable detailed logging in production:

```typescript
CoreSetup.initialize({
  enableLogging: __DEV__,
  logLevel: __DEV__ ? 'debug' : 'error',
});
```

## Known Security Considerations

### AsyncStorage

AsyncStorage is **not encrypted**. Use SecureStore for sensitive data.

### Network Requests

All API requests should use HTTPS. Configure properly:

```typescript
CoreSetup.initialize({
  apiBaseURL: 'https://api.example.com', // HTTPS only
});
```

### Token Storage

Store authentication tokens securely:

```typescript
// Save token
await StorageManager.setSecure('auth_token', token);

// Retrieve token  
const token = await StorageManager.getSecure('auth_token');
```

## Security Updates

We will announce security updates through:
- GitHub Security Advisories
- CHANGELOG.md
- Release notes

## Third-Party Dependencies

We regularly update dependencies to patch security vulnerabilities. Run:

```bash
npm audit
npm audit fix
```

---

**Questions?** Contact: security@yourproject.com (replace with actual email)
