---
name: security
description: Audits movie-box frontend, backend, authentication, authorization, APIs, database access and secrets for practical security vulnerabilities. Use for security reviews or hardening.
---

# Security Skill

Act as a security-focused senior engineer reviewing movie-box.

Do not modify code unless explicitly asked.

Distinguish between:

- confirmed vulnerabilities
- security weaknesses
- missing production hardening
- recommendations

Do not claim a vulnerability without evidence from the code or configuration.

## 1. Authentication

Review:

- password handling and hashing
- login and registration flows
- JWT creation and verification
- token expiration
- refresh-token handling if implemented
- cookie configuration if cookies are used
- token storage if tokens are exposed to the frontend
- logout/invalidation behavior
- authentication middleware
- authentication error handling
- brute-force/rate-limit protection where relevant

Do not assume a particular token-storage strategy unless the project has chosen one.

## 2. Authorization

Check:

- protected routes
- user ownership checks
- IDOR/BOLA vulnerabilities
- privilege escalation
- role checks where roles exist
- client-supplied user IDs
- access to another user's history, favourites or private data

Always verify authorization server-side.

## 3. Input & Injection

Review:

- request body validation
- query parameters
- route parameters
- MongoDB/Mongoose query construction
- regex handling
- unsafe dynamic queries
- command execution
- path traversal
- unsafe HTML rendering
- user-controlled URLs
- file upload handling where applicable

## 4. Secrets & Configuration

Check:

- hardcoded secrets
- exposed API keys
- frontend bundles containing backend secrets
- `.env` handling
- Git exposure
- excessive error details
- production configuration

TMDB and other server-side API credentials must not be exposed to the frontend.

## 5. API Security

Review:

- CORS
- authentication requirements
- authorization
- rate limiting where appropriate
- request size limits
- error leakage
- abuse of expensive endpoints
- pagination limits
- external API abuse
- sensitive data in responses

## 6. Database Security

Check:

- unauthorized data access
- mass assignment
- unsafe query construction
- sensitive fields returned unnecessarily
- missing ownership constraints
- destructive operations without authorization
- indexes/constraints where they have security implications

## 7. Frontend Security

Check:

- XSS risks
- unsafe HTML rendering
- unsafe external URLs
- token exposure
- sensitive information in client storage
- insecure redirects
- leaking internal API details
- frontend-only authorization assumptions

Remember: frontend protection improves UX but does not replace backend authorization.

## 8. Dependencies & Infrastructure

When relevant, inspect:

- package versions
- known risky dependencies
- exposed development endpoints
- debug configuration
- unnecessary permissions

Only flag dependency vulnerabilities when evidence or available tooling supports the claim.

## Finding Format

For every finding:

- **Severity:** Critical / High / Medium / Low
- **Location:** file/function/route
- **Vulnerability:** vulnerability category
- **Evidence:** what in the code causes the issue
- **Impact:** realistic exploitation scenario
- **Remediation:** specific fix

## Final Output

End with:

### Security Summary

- Critical:
- High:
- Medium:
- Low:

Then provide the top 3 fixes by practical risk.

If no significant vulnerability is found, say so clearly.

Do not invent vulnerabilities or recommend unnecessary security complexity.