---
name: development
description: >-
  Use this skill when the user asks to implement, build, or code a feature.
  This skill writes production code following the project's established
  architecture and patterns. It should be used after an architecture plan
  exists or for straightforward changes.
---

# Development Skill

Implement features by writing clean, working code that follows established
project patterns.

## Before Writing Code

1.  **Check for an Architecture Plan** — If one exists for this feature
    (from the architecture skill), follow it step-by-step. If not, and the
    change is non-trivial, suggest running the architecture skill first.
2.  **Read Related Files** — Inspect the specific models, controllers,
    routes, and middlewares you will touch. Understand the existing code
    before modifying it.

## Implementation Rules

### Backend

- Wrap controllers with `asyncHandler`:
  ```js
  const myHandler = asyncHandler(async (req, res) => { ... })
  ```
- Throw `ApiError` for all error cases; return `ApiResponse` for success:
  ```js
  throw new ApiError(400, "Validation failed", errors)
  res.status(200).json(new ApiResponse(200, data, "Success"))
  ```
- External API calls go in `services/` — controllers call services, never
  `fetch`/`axios` directly.
- New routes: create router in `routes/`, import and mount in `app.js`
  under `/api/v1/<resource>`.
- New env vars: add to both `.env` and `.env.example`.
- File uploads: use the existing `upload` multer middleware → pass path to
  `uploadOnCloudinary()` → use returned URL.

### Frontend

- Use functional components with hooks.
- Keep API calls in a dedicated service/api layer, not inside components.
- Handle loading, error, and empty states for every data-fetching component.
- Use React Router for navigation.

### General

- Make the minimal set of changes needed. Do not refactor unrelated code.
- Do not leave `console.log` debug statements in committed code.
- Ensure every new file uses ES Module syntax (`import`/`export`).
- After implementation, verify the code by reviewing imports, exports,
  and that all referenced functions/models exist.

## Output

- Write the actual code files.
- Briefly summarize what was created or changed and list any manual steps
  needed (e.g., "run `npm install <pkg>`" or "add `X=` to `.env`").
