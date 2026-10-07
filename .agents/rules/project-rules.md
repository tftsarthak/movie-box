---
trigger: always_on
description: Core project rules, stack, architecture conventions, security boundaries, and coding standards for movie-box.
---

# movie-box Project Rules

## Stack & Guardrails

- **Backend:** Node.js, Express, MongoDB, Mongoose, ES Modules (`import`/`export`)
- **Frontend:** React, Vite, React Router, Tailwind CSS
- **Auth & External:** JWT, TMDB API (via backend only)
- **Language/Package Manager:** Pure JavaScript, npm
- Do NOT introduce TypeScript, Prisma, alternative ORMs, or additional databases unless explicitly requested.

## Architecture & Boundaries

- **Backend:** `routes/`, `controllers/`, `services/`, `models/`, `middlewares/`, `utils/`
- **Frontend:** pages, components, state, API access
- **API Boundary:** `Frontend → movie-box Backend → MongoDB / TMDB`
- **API Prefix:** `/api/v1/...`
- Keep external API credentials strictly on the backend. Never expose TMDB secrets to the frontend or Vite client.
- Reuse existing architecture and patterns before introducing new abstractions.
- Do NOT add unnecessary layers such as repositories, factories, or microservices.

## Database & Data Modeling

- Use Mongoose for MongoDB access.
- Store **TMDB Movie IDs** as references in MongoDB; do not duplicate external TMDB metadata unless local persistence is required.
- Enforce server-side authorization and user ownership for user-specific resources such as watch history and favorites.
- Do NOT store persistent user data such as history or favorites inside JWT payloads.
- Add indexes and uniqueness constraints where they are required for correctness or query efficiency.

## Authentication & Security

- Follow the actual authentication implementation in the codebase; do not assume a token-storage mechanism.
- Never trust client-provided user identity for ownership checks.
- Validate and sanitize untrusted backend input.
- Never hardcode secrets, tokens, credentials, or private configuration.
- Keep environment-specific secrets in `.env` and document required keys in `.env.example`.

## Coding & Implementation Discipline

- Use ES Modules and `const`/`let`; never use `var`.
- Keep functions and components focused and understandable.
- Handle relevant `loading`, `error`, `empty`, and `success` states on the frontend.
- Prefer reusable existing components, utilities, and API services over duplication.
- Make the smallest surgical change required.
- Do not refactor unrelated files or introduce unrelated dependencies.
- Do not leave debug code, temporary files, or unused imports.
- Verify imports, exports, routes, and affected integration points after changes.

## Change Discipline

- Inspect existing code before modifying it.
- Preserve existing project conventions unless there is a concrete reason to change them.
- When adding environment variables, update `.env.example`.
- Never commit `.env`, credentials, `node_modules`, or temporary/generated files.