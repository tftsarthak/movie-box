---
name: code-review
description: >-
  Use this skill when the user asks to review code, check for bugs, audit
  code quality, or evaluate recent changes. Covers correctness, edge cases,
  performance, maintainability, and architectural adherence.
---

# Code Review Skill

Review code systematically and produce actionable findings.

## Review Process

1.  **Understand Scope** — Determine what to review: specific files, a
    feature, recent changes, or the full codebase. Ask if unclear.

2.  **Read the Code** — Read every file in scope thoroughly. Do not skim.

3.  **Evaluate Against These Criteria**

    | Category | What to Check |
    |---|---|
    | **Correctness** | Logic errors, wrong status codes, incorrect query/filter, missing `await`, broken control flow |
    | **Edge Cases** | Null/undefined inputs, empty arrays, missing fields, duplicate entries, concurrent requests |
    | **Error Handling** | Missing `ApiError` throws, unhandled promise rejections, generic error messages that leak info |
    | **Architecture** | Violations of project patterns (e.g., try/catch in controllers instead of asyncHandler, direct API calls in controllers instead of services) |
    | **Performance** | Missing DB indexes, N+1 queries, unbounded queries without pagination, large payloads without limits |
    | **Maintainability** | Dead code, duplicated logic, overly complex functions, unclear naming, missing validation |
    | **Regressions** | Changes that could break existing endpoints or alter response shapes relied upon by the frontend |

4.  **Produce Findings**

    For each issue found, provide:
    - **File & location** (file name and line range)
    - **Severity**: `critical` | `warning` | `nitpick`
    - **Problem**: One-sentence description
    - **Suggestion**: Concrete fix (code snippet or specific instruction)

5.  **Summary**
    - Count of findings by severity.
    - Top recommendations prioritized by impact.
    - If no issues found, explicitly state the code looks good and why.

## Constraints

- Do NOT fix the code yourself — only report findings. The user decides
  whether to apply suggestions.
- Do NOT report style preferences already handled by project rules
  (e.g., "use const") unless they are actually violated.
- Focus on real issues, not theoretical concerns with no practical impact.
