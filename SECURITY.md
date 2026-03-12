# SOLIDARITY PLATFORM — Security Policy

**Owner:** Scott Charles Olson
**Trademark:** TRADEMARKED BY SCOTT CHARLES OLSON

---

## Supported Versions

| Version | Supported | Notes |
|---------|-----------|-------|
| 2.41.x | Yes | Current production release |
| 2.40.x | Yes | Security patches only |
| < 2.40 | No | Unsupported — upgrade required |

---

## Reporting a Vulnerability

If you discover a security vulnerability in the Solidarity Platform, please report it responsibly:

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. **Email:** contact@solidarity.com with subject "SECURITY: [brief description]"
3. **Phone:** +1 (913) 548-5715 (for critical/urgent vulnerabilities)

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

| Severity | Acknowledgment | Resolution Target |
|----------|---------------|-------------------|
| Critical | 24 hours | 72 hours |
| High | 48 hours | 1 week |
| Medium | 1 week | 2 weeks |
| Low | 2 weeks | Next release |

---

## Security Architecture

### Authentication
- **JWT tokens** with 24-hour expiration (jsonwebtoken)
- **Password hashing** with bcryptjs (10 salt rounds)
- **Bearer token validation** on all protected endpoints

### License Key System
- **HMAC-SHA256 signed** license keys
- **4-tier access control** (observer/student/practitioner/operator)
- **Expiration enforcement** — keys have defined validity periods
- **Feature gating** — each tier only accesses permitted features
- **Test mode enforcement** — non-operator tiers cannot access live financial data

### Data Protection
- **SQLite with prepared statements** — prevents SQL injection
- **Input validation** via express-validator
- **CORS** configured for allowed origins
- **Helmet.js** security headers
- **Rate limiting** per tier

### Safety System
- **7-tier safety framework** (0.00–1.00) prevents unsafe operations
- **Safety level propagation** across all subsystems
- **Emergency stabilization** at 0.618 baseline
- **Financial operations** default to test mode

---

## Secure Development Practices

1. All dependencies are audited: `npm audit --omit=dev` returns 0 vulnerabilities
2. GitHub Actions CI runs security checks on every push
3. Prepared statements for all database operations
4. No secrets in source code (environment variables for sensitive values)
5. License keys are cryptographically signed and expiring

---

## Known Limitations

1. **Frontend CRA** has internal vulnerabilities in react-scripts dependencies (not exploitable in app context). Migration to Vite is planned.
2. **JWT secret** defaults to a static string in development. Must be set via `JWT_SECRET` environment variable in production.
3. **License secret** defaults to a static string in development. Must be set via `LICENSE_SECRET` environment variable in production.

---

## License Key Security

License keys are generated using HMAC-SHA256 with a server-side secret. Keys encode:
- Tier level (access permissions)
- User identifier
- Expiration date
- Cryptographic signature

**Keys cannot be forged** without the signing secret. Tampering with any component invalidates the signature.

**Keys can be revoked** by changing the `LICENSE_SECRET` environment variable (invalidates all existing keys).

---

**Last Updated:** March 12, 2026
**Document Version:** 2.0
