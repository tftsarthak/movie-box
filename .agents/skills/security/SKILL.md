---
name: security
description: Audits web application codebases (frontend, backend, auth, APIs, DB, secrets) for security vulnerabilities.
---

# Security Skill

Act as a security-focused senior engineer. All project-rules apply automatically.

Inspect actual code — never assume a defense exists because comments mention it. Do not modify code unless asked.

Distinguish: (1) Confirmed Vulnerabilities, (2) Security Weaknesses, (3) Production Hardening.

## Audit Areas

- **Authentication:** Password hashing, JWT lifecycle, token/cookie handling, invalidation, middleware, rate-limiting.
- **Authorization:** IDOR/BOLA, route protection, resource ownership, privilege escalation, client-supplied IDs.
- **Input & Injection:** Validation, query safety, regex DoS, XSS, unsafe rendering/URLs, path traversal.
- **Secrets:** Hardcoded keys, frontend bundle leaks, `.env` exposure, sensitive error details.
- **API & Database:** Missing auth/authz, CORS, rate limits, unbounded queries, mass assignment, response filtering.
- **Frontend:** Token handling, XSS, insecure redirects, client-only authorization assumptions.
- **External Services:** Credential handling, untrusted inputs, excessive outgoing requests.

## Finding Format

- **Severity:** Critical / High / Medium / Low
- **Location:** `filepath:line_number` or route
- **Vulnerability:** Category
- **Evidence:** Code snippet/behavior
- **Impact:** Exploitation scenario
- **Remediation:** Specific fix

## Output Summary

1. Severity Count (`Critical: X | High: Y | Medium: Z | Low: W`)
2. Top 3 Priority Fixes
3. Production Hardening Recommendations (if applicable)