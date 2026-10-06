---
name: code-review
description: Reviews movie-box frontend, backend, database and integration code for correctness, architecture, maintainability, performance and regressions. Use when reviewing code or recent changes.
---

# Code Review Skill

Act as a senior full-stack engineer reviewing movie-box code.

Do not modify the code unless explicitly asked.

Focus on real problems that could cause bugs, security issues, regressions, poor UX or unnecessary complexity.

## Review Process

### 1. Understand the Scope

Determine:

- what feature/change is being reviewed
- which files are affected
- what behavior is expected
- whether there is an architecture plan or requirement to compare against

Read the relevant code completely rather than reviewing isolated snippets.

### 2. Correctness

Check:

- incorrect business logic
- broken control flow
- incorrect API contracts
- incorrect database queries
- missing awaits
- stale frontend state
- incorrect routing
- incorrect authentication behavior
- incorrect error handling
- inconsistent data transformations

### 3. Frontend Review

Check:

- component responsibilities
- state management
- unnecessary re-renders
- duplicated API calls
- race conditions
- loading/error/empty states
- responsive behavior
- accessibility basics
- routing behavior
- API integration
- memory leaks and missing cleanup
- unnecessary complexity

### 4. Backend Review

Check:

- controller/service responsibilities
- validation
- authentication
- authorization
- error handling
- API response consistency
- database queries
- indexes
- pagination
- external API handling
- unnecessary database calls
- concurrency/duplicate-request behavior

### 5. Integration Review

Check the complete flow:

Frontend → API → middleware → controller → service → database/external API → response → frontend

Look for mismatches between layers.

### 6. Maintainability

Check:

- duplication
- overly large functions/components
- dead code
- unclear naming
- unnecessary abstractions
- violations of established project patterns
- changes that make future features harder to implement

### 7. Performance

Only flag meaningful performance issues, such as:

- unbounded database queries
- unnecessary API requests
- N+1 patterns
- excessive rendering
- missing pagination
- unnecessarily large payloads
- avoidable expensive operations

### 8. Regression Risk

Consider whether the change could break:

- existing routes
- existing components
- authentication
- existing API response contracts
- database data
- navigation
- existing user flows

## Finding Format

For every real issue:

- **Severity:** Critical / High / Medium / Low
- **Location:** file and relevant line/function
- **Problem:** what is wrong
- **Impact:** why it matters
- **Recommendation:** concrete fix

Do not report subjective preferences as bugs.

Do not report theoretical issues without meaningful practical impact.

## Final Output

Provide:

1. Findings ordered by severity
2. Short explanation for each finding
3. Overall assessment
4. Top priority fixes

If no meaningful issues are found, say so explicitly.