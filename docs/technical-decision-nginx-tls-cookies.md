# Technical Decision: Nginx Reverse Proxy + TLS/HTTPS + Secure Cookies

## Status
**Accepted**

## Context
MedSecure currently runs as a monolithic Express backend (port 5000) with a Vite frontend. Authentication uses JWT tokens returned in JSON responses and stored in `localStorage`. This approach has several security weaknesses:
- **XSS vulnerability**: Tokens in `localStorage` are accessible to JavaScript, making them stealable via XSS attacks
- **No TLS**: All traffic (including credentials and medical data) is unencrypted over HTTP
- **No reverse proxy**: Direct exposure of backend; no centralized security headers or request filtering
- **CSRF risk**: No `SameSite` cookie protection

## Decision
We will implement a hardened production-ready architecture with three layers:

### 1. Nginx Reverse Proxy
Nginx will serve as the single entry point:
- Terminates TLS/HTTPS on port 443
- Redirects HTTP (80) → HTTPS (443)
- Serves frontend static files directly
- Proxies `/api/*` requests to the Express backend
- Adds centralized security headers (HSTS, CSP, X-Frame-Options, etc.)
- Handles static asset caching and compression

### 2. TLS/HTTPS
- Self-signed certificates for local development
- Production: Replace with certificates from a trusted CA (Let's Encrypt / commercial)
- TLS 1.2+ only; strong cipher suites
- HTTP Strict Transport Security (HSTS) header enabled

### 3. Secure Cookies (HttpOnly, Secure, SameSite)
Move JWT storage from `localStorage` to `httpOnly` cookies:
- **`httpOnly`**: Prevents JavaScript access (XSS protection)
- **`Secure`**: Cookie sent only over HTTPS
- **`SameSite=Strict`**: Cookie not sent in cross-site requests (CSRF protection)
- Cookie maxAge aligned with JWT expiry (7 days default)

## Consequences

### Positive
- **XSS-resistant authentication**: Tokens are no longer accessible to JavaScript
- **Encrypted traffic**: All data in transit protected by TLS
- **Centralized security**: Nginx handles TLS termination, headers, rate limiting at the edge
- **CSRF protection**: `SameSite=Strict` prevents cross-origin cookie leakage
- **Production alignment**: Architecture matches industry best practices for healthcare applications

### Negative / Trade-offs
- **Cross-domain complexity**: Frontend and backend must share the same domain (or use subdomain with proper cookie domain settings)
- **Local development**: Requires HTTPS setup locally; self-signed certs accepted by browser
- **Mobile/API clients**: Non-browser clients must be updated to handle cookies instead of Bearer tokens
- **Logout complexity**: Server-side cookie clearing required for logout

## Implementation Details

### Cookie Configuration
```
Name: token
httpOnly: true
secure: true
sameSite: strict
maxAge: 7 * 24 * 60 * 60 * 1000  (7 days)
path: /
```

### Nginx Security Headers
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
```

### Migration Strategy
1. Backend updated to set cookies on login/register
2. Auth middleware reads token from cookie (with header fallback for backward compatibility during transition)
3. Frontend updated to send `credentials: 'include'` on all API calls
4. Frontend removes `localStorage` token storage
5. Logout endpoint clears the cookie server-side

## References
- OWASP Secure Cookie Practices: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- Nginx SSL Best Practices: https://nginx.org/en/docs/http/ngx_http_ssl_module.html
- MDN SameSite cookies: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite

