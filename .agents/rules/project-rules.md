---
trigger: always_on
---

---
trigger: always_on
description: Core project rules and conventions for the movie-box MERN application.
---

# movie-box Project Rules

## Project

movie-box is a MERN-based movie discovery application inspired by modern streaming platforms.

The application has two main parts:

- `backend/` — Node.js + Express API
- `frontend/` — React + Vite client

MongoDB is the primary database.

TMDB is the external movie data provider.

The frontend must communicate with TMDB through the backend. TMDB credentials and other secrets must never be exposed to the frontend.

---

## Core Principles

- Prefer simple, maintainable solutions over unnecessary abstraction.
- Reuse existing project patterns before introducing new ones.
- Make the smallest reasonable change required for the task.
- Do not refactor unrelated code.
- Do not introduce a new library when the existing stack can solve the problem cleanly.
- Preserve existing behavior unless the task explicitly requires changing it.
- Do not generate large amounts of code before understanding the existing codebase.
- When requirements are ambiguous and the decision affects architecture or behavior, ask before making a major assumption.

---

## Backend

- Node.js with ES Modules.
- Express is used for the HTTP API.
- MongoDB/Mongoose is used for persistence.
- Controllers handle HTTP-level concerns.
- Business logic should remain outside controllers when it becomes non-trivial.
- External API integrations belong in service modules.
- Authentication and authorization are handled through middleware.
- Use the existing centralized error-handling mechanism.
- Follow the existing API response/error conventions.
- API routes use the existing `/api/v1/...` versioning convention.
- Validate user-controlled input before processing it.

Do not introduce a new backend architectural pattern if an existing project pattern already solves the problem.

---

## Frontend

- React with Vite.
- Use functional components and hooks.
- Use React Router for routing.
- Keep reusable UI in components rather than duplicating markup.
- Keep page-level responsibilities separate from reusable components.
- Keep API communication in the established API/service layer rather than scattering requests throughout components.
- Keep UI state close to the component that owns it unless it genuinely needs to be shared.
- Handle loading, error, empty and success states for asynchronous UI.
- Components should be responsive and usable across common screen sizes.
- Follow existing styling and component patterns before introducing new ones.
- Avoid unnecessarily large components; split components when responsibilities become clearly distinct.

---

## API Boundary

The frontend must not directly access protected third-party APIs when credentials are required.

For TMDB:

Frontend → movie-box Backend → TMDB

The backend is responsible for:

- authentication with TMDB
- external API requests
- error handling
- transforming/normalizing data when appropriate
- protecting credentials

The frontend should consume the movie-box API contract rather than depending directly on TMDB implementation details.

---

## Authentication & User Data

- Never trust user identity supplied by the client when the server can derive it from authentication.
- Authorization must be checked server-side.
- User-specific resources must enforce ownership.
- Never place persistent application data such as watch history or favourites inside JWT payloads merely for convenience.
- Secrets must remain server-side.
- Passwords must never be returned in API responses.

Follow the project's actual authentication implementation rather than assuming a feature exists.

---

## Environment & Secrets

- Secrets belong in environment variables.
- Never hardcode API keys, tokens, passwords or database credentials.
- Never expose backend secrets through frontend environment variables.
- Never commit `.env` files.
- When introducing a new environment variable, update the appropriate example/configuration documentation.
- Do not invent environment variables unless the feature actually requires them.

---

## Code Quality

- Use clear, descriptive names.
- Prefer `const`; avoid `var`.
- Use ES Module syntax.
- Keep functions focused.
- Avoid dead code and unused imports.
- Comments should explain non-obvious decisions, not obvious code.
- Do not leave debugging statements in completed implementation.

---

## Git & Changes

- Keep changes focused on the requested feature.
- Do not modify unrelated files without a reason.
- Avoid destructive operations unless explicitly required.
- Use clear, imperative commit messages when commits are requested.

---

## Before Changing Code

Always inspect the relevant existing files first.

Understand:

1. existing architecture
2. existing patterns
3. existing API contracts
4. existing frontend structure
5. existing data models
6. existing authentication flow

Then make the smallest change that fits the existing system.