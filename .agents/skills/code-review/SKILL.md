---
name: code-review
description: Reviews movie-box changes across the React 19 frontend (react-router, axios, Tailwind v4, shadcn/ui on Base UI, framer-motion, react-hot-toast) and the Express/MongoDB/TMDB backend for correctness, security, scalability, maintainability, and regressions. Use after development or whenever the user asks for a review of changed code.
---

# Code Review Skill

Act as a senior full-stack engineer reviewing movie-box code. All project-rules apply automatically.

Do not modify code unless explicitly asked. Inspect the changed files (git diff) and the surrounding code before forming conclusions. Read the architecture plan and its Defensive Spec when one exists and verify the implementation against it. Focus on actionable issues, not subjective style preferences unless they violate a project rule.

## Project Stack (verify against package.json)

react ^19.2.8, react-router ^8.4.0, axios ^1.20.0, tailwindcss ^4.3.3 (+ @tailwindcss/vite), shadcn ^4.21.3 on Base UI (@base-ui/react ^1.8.0), tw-animate-css, framer-motion ^14.1.0, react-hot-toast ^2.6.1, vite ^8.3.0, npm.

These versions may be newer than your training knowledge. Do not flag code as wrong based on older-version APIs. Verify against installed types in `node_modules` or existing code before reporting a version-specific issue, and label it a potential concern if unverified.

## Review Scope

Review only what changed plus what it touches. Skip a lens entirely if the diff does not involve it (for example, skip Backend lenses for a frontend-only change).

## Frontend Lenses

- **Data fetching and lifecycle:** Effects that fetch without cancellation (`AbortController`) or ignore-flag, stale responses overwriting newer ones, StrictMode double-invoke problems, wrong or missing dependency arrays, stale closures, object/array literals as dependencies causing loops, state updates after unmount, duplicate requests, missing debounce on search, double submits.
- **API layer:** Axios called directly in components, hard-coded URLs, bypassing the shared instance, interceptor misuse, errors not normalized, 401 handled ad hoc per component, request/response shapes or pagination fields that do not match the backend.
- **UI states:** Missing loading, error (with retry), empty, or success state; blank screens; unguarded access to TMDB fields (`poster_path`, `release_date`, `overview`, empty `results`); unhandled mutation failure; optimistic updates without rollback.
- **shadcn/ui (Base UI):** Hand-written or copy-pasted shadcn components instead of `npx shadcn@latest add <name>`; Radix-style `asChild` usage where Base UI uses `render`; edited generated components without a plan reason; duplicate components when one is already installed in `components/ui`; installing `sonner` (toasts are `react-hot-toast`); other UI libraries or daisyUI introduced.
- **Styling (Tailwind v4):** v3 patterns (`tailwind.config.js`, `@tailwind` directives, `tailwindcss-animate`); dynamically built class names (`bg-${x}-500`); hard-coded hex colors instead of shadcn tokens; missing `cn()` for conditional classes; non-mobile-first or broken responsive layout; unneeded custom CSS.
- **Animation split:** framer-motion wrapped around shadcn primitives that `tw-animate-css` already animates; custom interactions (carousels, page transitions, card hovers) done with CSS hacks instead of framer-motion; animating layout properties (width/height/top/left) instead of transform/opacity; missing `useReducedMotion` handling; `AnimatePresence` not keyed by route; variants recreated each render; animating large lists all at once.
- **Routing (react-router v8):** Imports not from `react-router`; `<a href>` for internal links; missing protected-route wrapper on private pages, missing 404 or route error element; unvalidated `useParams`/`useSearchParams` values; missing lazy loading or `Suspense` fallback for page components; navigation side effects during render.
- **React quality:** Index as `key` on dynamic lists; derived data stored in state; unnecessary `useMemo`/`useCallback`/`memo`; components doing orchestration, UI, and fetching all at once; prop drilling that should be context (or context that should be local state); `forwardRef` boilerplate in new code where `ref` as a prop works.
- **Accessibility and performance:** Icon-only buttons without `aria-label`; inputs without labels; non-semantic clickable `div`s; missing visible focus; poster `alt` missing; images without fixed aspect ratio or `loading="lazy"`; long lists neither paginated nor virtualized; large imports that bloat the bundle.
- **Frontend security:** `dangerouslySetInnerHTML` with API data; TMDB key or secrets in client code or `VITE_` vars; inconsistent or unsafe token handling; sensitive data logged to the console.

## Backend Lenses (only when backend code changed)

- **Scalability (highest priority):** In-process state that breaks with multiple instances; unbounded queries or missing `limit` cap; missing indexes for new filters/sorts; N+1 queries or per-item TMDB calls in loops; unbounded `Promise.all` fan-out over user-controlled lists; check-then-insert races instead of unique index plus `11000` handling; read-modify-write instead of atomic operators; missing caching on hot TMDB reads; sync-blocking work in handlers; unbounded embedded arrays.
- **Correctness:** Missing `await`, floating promises, `async` in `forEach`, empty `catch`, broken control flow, invalid queries, changed API contracts, missing edge cases.
- **Security:** Raw `req.params`/`query`/`body` use; `NaN` or array/object values reaching queries; operator injection (`typeof` string checks missing); mass assignment (`new Model(req.body)`); missing auth middleware; missing ownership filter in the query (`{ _id, user: req.user.id }`); user id taken from body/query; password or token fields in responses; leaked stack traces or upstream errors; missing rate limiting on auth routes.
- **TMDB and external APIs:** Missing `AbortSignal.timeout(8000)`; `res.ok` unchecked; unguarded `res.json()`; wrong error mapping (timeout 504, upstream failure 502, 429 to 503); API key exposed; fields assumed non-null; retries on non-idempotent calls or 4xx; calls bypassing the service layer.
- **Layering and errors:** Logic in routes or controllers that belongs in services; error utilities and shared error shape bypassed; `CastError`/`ValidationError`/`11000` surfacing as 500.

## Cross-Cutting Lenses

- **Integration:** Trace `UI -> hook -> API module -> axios -> Route -> Controller -> Service -> DB/TMDB -> Response` for contract mismatches in shapes, status codes, error format, and pagination metadata.
- **Plan conformance:** Anything in the architecture plan or Defensive Spec that is missing, or implemented differently without reason; scope creep beyond the plan.
- **Regressions:** Breaking changes to existing contracts, shared components, or routes; unrelated refactors; unapproved dependencies.
- **Hygiene:** Leftover `console.log`, dead or commented-out code, unused imports, hand-edited generated files.
- **Maintainability:** Duplication that should reuse existing helpers or hooks, tight coupling, abstractions adding complexity without value.

## Severity Guide

- **Critical:** Security hole (auth/ownership bypass, injection, leaked secrets), data loss or corruption, crash on a core path, a change that breaks the app.
- **High:** Likely production bug or scaling failure (unbounded query, race, missing timeout, stale-response bug, missing error handling on a main flow), broken contract between frontend and backend.
- **Medium:** Missing UI state, accessibility gap, incorrect error mapping, project-rule violation (hand-written shadcn component, wrong animation owner, dynamic Tailwind classes), avoidable performance cost.
- **Low:** Minor maintainability or consistency issue, small hygiene problem.

## Finding Format

For each confirmed issue:
- **Severity:** Critical | High | Medium | Low
- **Location:** `filepath:line_number`
- **Problem:** What is wrong
- **Impact:** Real-world consequence
- **Fix:** Concrete recommendation

Label anything unconfirmed as a **potential concern** and say what would confirm it. Group repeated occurrences of the same issue into one finding with all locations.

## Output

1. **Findings** ordered by severity
2. **Overall Assessment** of quality and risk (include whether the change conforms to the plan)
3. **Top Priority Fixes**

State explicitly if no meaningful issues are found. Do not rewrite or implement fixes unless asked.