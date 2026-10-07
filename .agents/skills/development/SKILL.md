---
name: development
description: Implements movie-box features across React frontend, Express backend, MongoDB, APIs, and external integrations following the project's architecture.
---

# Development Skill

Implement features using the existing movie-box architecture. All project-rules apply automatically.

**If a non-trivial feature has no architecture plan, pause and recommend planning first.**

## Before Coding

- Inspect relevant existing code and identify reusable components, utilities, and patterns.
- Read the architecture plan when one exists.
- Understand affected API contracts, data models, auth, and integration points.

## Frontend

- Keep state as local/narrow as practical; use shared state only when multiple components genuinely need it.
- Keep API calls inside the established data-access/API layer.
- Handle `loading`, `error`, `empty`, and `success` states.
- Consider responsive behavior, accessibility, and stale/duplicate requests for interactive features.

## Backend

- Maintain route → controller → service boundaries.
- Use the existing error-handling utilities/middleware.
- Preserve existing API response contracts unless the change explicitly requires modifying them.
- Handle expected external-service and database failures appropriately.

## Database

- Avoid unnecessary queries, duplicate writes, and unbounded data retrieval.

## External APIs

- Use the existing service layer for external API communication.
- Handle upstream timeouts, failures, unexpected responses, and rate-limit behavior without exposing sensitive information.

## Implementation Discipline

- Make the smallest surgical change required; reuse before creating.
- Do NOT refactor unrelated files, add unapproved dependencies, or leave debug/dead code.

## Post-Implementation Verification

1. Verify imports/exports, routing, and API response contracts.
2. Verify authentication and ownership checks on user-owned endpoints.
3. Check frontend UI states (loading/error/empty/success).
4. Check DB queries, indexes, and data relationships.
5. Check external API error handling and credential boundaries.
6. Run available build, lint, and test commands.
7. Inspect the git diff for unintended changes.

## Output Format

1. **Summary of Changes**
2. **Files Created / Modified**
3. **Verification Steps Completed**
4. **Manual Verification Required** (if any)
