---
name: development
description: Implements movie-box features across React, Express, MongoDB and external APIs using the existing architecture and project conventions. Use when building, modifying or fixing application code.
---

# Development Skill

Implement the requested feature cleanly within the existing movie-box architecture.

Prioritize correctness, maintainability and minimal changes over generating large amounts of code.

## Before Coding

1. Read the relevant existing files.
2. Understand the current implementation and conventions.
3. Check for an existing architecture plan.
4. Identify reusable components, utilities, services and middleware.
5. Determine the smallest set of changes required.

For non-trivial features without an architecture plan, pause and recommend architecture planning before implementation.

---

## Frontend Development

### Components

- Use functional React components and hooks.
- Reuse existing components before creating new ones.
- Keep components focused on a clear responsibility.
- Separate page-level composition from reusable UI.
- Avoid deeply nested or unnecessarily large components.

### State

- Keep state local when possible.
- Lift state only when multiple components genuinely need it.
- Do not introduce global state for a problem that local state can solve.
- Keep server/API data handling separate from purely visual UI state when practical.

### API Integration

- Use the project's existing API/service layer.
- Do not place repeated API request logic directly in multiple components.
- Handle loading, error, empty and success states.
- Handle request cancellation or stale responses when the feature can produce race conditions.
- Do not expose backend secrets or third-party credentials.

### UI / UX

- Follow the existing design system and styling approach.
- Make new UI responsive.
- Provide useful feedback for loading and failed actions.
- Handle empty results intentionally.
- Preserve accessibility basics such as semantic elements, labels and keyboard interaction where applicable.

### Routing

- Use the existing React Router structure.
- Add routes consistently with existing conventions.
- Protect authenticated routes using the existing authentication mechanism.

---

## Backend Development

### API

- Follow existing route/versioning conventions.
- Keep controllers focused on HTTP concerns.
- Keep non-trivial business logic in appropriate services/modules.
- Use the existing validation and error-handling patterns.
- External API requests belong in dedicated service modules.

### Database

- Reuse existing Mongoose models when appropriate.
- Add indexes for fields involved in frequent lookup, uniqueness or sorting when justified.
- Avoid unnecessary database queries.
- Consider pagination for potentially large result sets.
- Preserve data ownership boundaries.

### Authentication & Authorization

- Use the existing authentication middleware.
- Derive the authenticated user from the verified authentication context.
- Never trust a client-provided user ID for authorization.
- Check ownership before accessing or modifying user-specific data.

---

## External APIs

When integrating an external API:

- use the existing service layer
- keep credentials server-side
- handle timeout/failure/error responses
- validate required inputs
- avoid leaking provider-specific errors unnecessarily
- transform provider responses only when it improves the application's API contract

For TMDB specifically, the frontend should communicate with the movie-box backend rather than directly with TMDB.

---

## Implementation Rules

- Make the smallest reasonable change.
- Reuse existing patterns.
- Do not refactor unrelated code.
- Do not add dependencies without justification.
- Do not overwrite working code unnecessarily.
- Do not create duplicate utilities/components.
- Do not leave debug code behind.

---

## Verification

After implementation:

1. Check imports and exports.
2. Check affected API contracts.
3. Check frontend/backend integration.
4. Check loading/error/empty states.
5. Check authentication and authorization where applicable.
6. Run the relevant tests, linting or build commands available in the project.
7. Inspect the final diff for unrelated changes.

If something could not be verified, state it clearly.

## Output

After implementation, briefly report:

- what changed
- important design decisions
- files created/modified
- tests/checks performed
- anything requiring manual verification