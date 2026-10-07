---
name: code-review
description: Reviews movie-box changes across React, Express, MongoDB, APIs, and integrations for correctness, security, maintainability, performance, and regressions.
---

# Code Review Skill

Act as a senior full-stack engineer reviewing movie-box code. All project-rules apply automatically.

Do not modify code unless explicitly asked. Inspect changed files and surrounding code before forming conclusions. Focus on actionable issues — not subjective style preferences unless they violate a project rule.

## Review Focus

- **Correctness:** Async/await bugs, state races, broken API contracts, invalid queries, incorrect control flow, missing edge cases.
- **Backend & Security:** Input validation, auth/authz, ownership checks, controller/service boundaries, error handling, unsafe data access, credential boundaries.
- **Frontend:** State management errors, unnecessary re-renders, duplicate API calls, stale closures, missing UI states.
- **Database:** Incorrect queries, missing indexes/constraints, inefficient access, unintended duplication, incorrect ownership relationships.
- **Integration:** Trace `Frontend → API → Controller → Service → DB/TMDB → Response` for contract or data-flow mismatches.
- **External APIs:** TMDB request handling, timeouts/failures, response assumptions, unnecessary upstream calls, incorrect error propagation.
- **Performance & Regressions:** Unbounded queries, N+1, duplicate network calls, excessive payloads, breaking changes to existing contracts.
- **Maintainability:** Unnecessary duplication, tight coupling, abstractions that add complexity without value.

## Finding Format

For each confirmed issue:
- **Severity:** Critical | High | Medium | Low
- **Location:** `filepath:line_number`
- **Problem:** What is wrong
- **Impact:** Real-world consequence
- **Fix:** Concrete recommendation

Label anything unconfirmed as a potential concern.

## Output

1. **Findings** ordered by severity
2. **Overall Assessment** of quality and risk
3. **Top Priority Fixes**

State explicitly if no meaningful issues are found. Do not rewrite or implement fixes unless asked.