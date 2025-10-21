# Security Module

## Overview

This module provides comprehensive security features for the Solidarity Platform, including input validation, sanitization, XSS prevention, SQL injection prevention, and security headers.

## Features

### 1. Enhanced URL Validation
- **SecureURLValidator** - Multi-layer URL validation addressing GHSA-9965-vmph-33xx
  - Protocol validation (only http/https allowed)
  - Dangerous pattern detection (javascript:, data:, etc.)
  - XSS pattern detection
  - Private IP and localhost filtering
  - SSRF protection

### 2. Input Sanitization
- **InputSanitizer** - Comprehensive input sanitization
  - HTML tag stripping
  - Script content removal
  - SQL injection prevention
  - Path traversal prevention
  - Email validation and sanitization
  - Number validation with min/max constraints

### 3. Security Headers
- **SecurityHeaders** - HTTP security headers
  - Content-Security-Policy
  - X-Frame-Options
  - X-XSS-Protection
  - Strict-Transport-Security
  - X-Content-Type-Options
  - Referrer-Policy
  - Permissions-Policy

### 4. Rate Limiting
- **RateLimitHelper** - Request rate limiting
  - Configurable time windows
  - Per-identifier tracking
  - Automatic cleanup

### 5. Security Configuration
- **SecurityConfig** - Central security configuration
  - Express middleware integration
  - File upload validation
  - Blockchain transaction security
  - Security event logging

## Usage

### Basic Usage

```javascript
const { SecureURLValidator, InputSanitizer, SecurityHeaders } = require('./security/input-validator');

// URL Validation
const urlValidator = new SecureURLValidator();
const result = urlValidator.validateURL('https://example.com');
if (result.valid) {
  console.log('URL is safe:', result.sanitized);
} else {
  console.log('URL validation failed:', result.errors);
}

// Input Sanitization
const clean = InputSanitizer.sanitizeHTML('<script>alert(1)</script>Hello');
console.log(clean); // Output: "Hello"

const email = InputSanitizer.sanitizeEmail('TEST@EXAMPLE.COM');
console.log(email); // Output: "test@example.com"

const num = InputSanitizer.sanitizeNumber(150, { min: 0, max: 100 });
console.log(num); // Output: 100
```

### Express Middleware

```javascript
const { securityConfig } = require('./security/security-config');
const express = require('express');
const app = express();

// Apply security headers to all responses
app.use(securityConfig.getSecurityHeadersMiddleware());

// Sanitize all incoming requests
app.use(securityConfig.getSanitizationMiddleware());

// Validate file uploads
app.use('/upload', securityConfig.getFileUploadValidationMiddleware());

// Blockchain transaction security
app.use('/blockchain', securityConfig.getBlockchainSecurityMiddleware());
```

### Custom Validation

```javascript
const { securityConfig } = require('./security/security-config');

// Validate URL with custom options
const result = securityConfig.validateURL('http://localhost:3000', {
  allowLocalhost: true,
  allowRelative: false
});

if (result.valid) {
  console.log('URL is valid');
}
```

## Testing

Run the security test suite:

```bash
npm run security:test
```

The test suite includes:
- URL validation tests (8 tests)
- Input sanitization tests (6 tests)
- XSS prevention tests (10 tests)
- SQL injection prevention tests (5 tests)

**Total: 29 tests**

## Security Best Practices

### 1. Always Validate User Input
```javascript
// Good
const email = InputSanitizer.sanitizeEmail(req.body.email);
if (email) {
  // Process email
}

// Bad
const email = req.body.email; // No validation!
```

### 2. Use URL Validator for External URLs
```javascript
// Good
const validator = new SecureURLValidator();
const result = validator.validateURL(req.body.url);
if (result.valid) {
  // Safe to use result.sanitized
}

// Bad
const url = req.body.url; // Could be javascript:alert(1)
```

### 3. Sanitize Before Database Operations
```javascript
// Good
const query = 'SELECT * FROM users WHERE name = ?';
const sanitizedName = InputSanitizer.sanitizeSQL(req.body.name);
db.execute(query, [sanitizedName]);

// Bad
const query = `SELECT * FROM users WHERE name = '${req.body.name}'`; // SQL injection!
```

### 4. Apply Security Headers
```javascript
// Good
app.use(securityConfig.getSecurityHeadersMiddleware());

// Or manually
SecurityHeaders.applyHeaders(res);
```

## Configuration

Security settings can be configured via environment variables:

```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png

# Blockchain Security
FINANCIAL_TEST_MODE=true
MAX_GAS_PRICE=100
```

## Known Vulnerabilities

### Validator.js URL Validation Bypass (GHSA-9965-vmph-33xx)
- **Severity**: Moderate
- **Status**: Mitigated by SecureURLValidator
- **Details**: See [SECURITY.md](../SECURITY.md)

## API Reference

### SecureURLValidator

#### `validateURL(url, options)`
Validates a URL with comprehensive security checks.

**Parameters:**
- `url` (string): URL to validate
- `options` (object):
  - `allowRelative` (boolean): Allow relative URLs
  - `allowLocalhost` (boolean): Allow localhost URLs
  - `allowPrivateIP` (boolean): Allow private IP addresses

**Returns:** Object with properties:
- `valid` (boolean): Whether URL is valid
- `sanitized` (string): Sanitized URL
- `errors` (array): Validation errors
- `protocol` (string): URL protocol
- `hostname` (string): URL hostname
- `pathname` (string): URL pathname

### InputSanitizer

#### `sanitizeString(input, maxLength)`
Sanitizes string input with length limits.

#### `sanitizeHTML(input)`
Removes HTML tags and dangerous patterns.

#### `sanitizeSQL(input)`
Escapes SQL special characters.

#### `sanitizeFilePath(input)`
Removes path traversal attempts.

#### `sanitizeEmail(input)`
Validates and normalizes email addresses.

#### `sanitizeNumber(input, options)`
Validates and constrains numeric input.

## Contributing

When adding new security features:

1. Add tests to `security-tests.js`
2. Update this README
3. Document in [SECURITY.md](../SECURITY.md)
4. Run test suite: `npm run security:test`

## License

See [LICENSE](../LICENSE) file.

---

**TRADEMARKED BY SCOTT CHARLES OLSON**
