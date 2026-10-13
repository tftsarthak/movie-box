---
name: development
description: Implements movie-box features in the React 19 frontend (react-router, axios, Tailwind v4, shadcn/ui on Base UI, framer-motion, react-hot-toast) and extends the existing Express/MongoDB backend when needed. Installs shadcn components via the CLI, builds defensive production-grade code on the first pass, and self-reviews its diff before finishing.
---

# Development Skill

Implement features using the existing movie-box architecture. All project-rules apply automatically.

**If a non-trivial feature has no architecture plan, pause and recommend planning first.**

The plan's **Defensive Spec** is your contract. Where it is silent, apply the standards below. The goal is that Code-Review finds nothing to flag.

## Before Coding

- Read the architecture plan and its Components to Install list.
- Inspect `package.json`, `components.json`, `index.css`, the router config, and `components/ui` (what is already installed).
- Reuse existing axios instance, API modules, hooks, layouts, `cn()` helper, error utilities, and patterns. Put new shared helpers in the existing utils location once.

## Installing shadcn Components (mandatory procedure)

1. If a needed component is missing, install it with the terminal (several at once are allowed). Never hand-write or copy-paste a shadcn component from memory.
2. After installing, read the generated file in `components/ui/` and follow its actual API.
3. Import from the project alias (e.g. `@/components/ui/button`). Extend via props and `className` plus `cn()`; edit the generated file only when the plan requires it.
4. Report newly installed components in the output.

## Frontend Standards

**Routing:** Use `<Link>`/`<NavLink>`/`useNavigate` for internal navigation, never `<a href>`. Lazy-loaded pages with `Suspense` fallbacks (or the router's lazy API). Params and search params are strings: validate them.

**React 19:** Function components with hooks. `ref` is a regular prop (no `forwardRef` needed in new code). Use `useOptimistic`/`useActionState`/`use` only where they fit existing patterns. Code must be StrictMode-safe (effects run twice in dev). Stable unique `key` props (ids, not indexes, for dynamic lists). Compute derived data, do not store it in state.

**Data fetching (axios):** Wrap fetching in a custom hook returning `{ data, loading, error, refetch }` (or match the existing pattern). Every fetch effect cancels on cleanup:

```jsx
useEffect(() => {
  const controller = new AbortController();
  setLoading(true);
  getMovies({ page, query }, controller.signal)
    .then((res) => setData(res.data))
    .catch((err) => { if (!axios.isCancel(err)) setError(getErrorMessage(err)); })
    .finally(() => { if (!controller.signal.aborted) setLoading(false); });
  return () => controller.abort();
}, [page, query]);
```

Disable controls during in-flight mutations. Correct dependency arrays (no stale closures, no per-render object/array literals as deps).

**Styling (Tailwind v4):** No v3 directives or patterns. Never build class names dynamically (`bg-${x}-500` is not detected); use full literal classes or a lookup map. Use shadcn tokens (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border`). Compose classes with `cn()`.

**Animation:**
- Ensure `@import "tw-animate-css"` exists in `index.css`; do not add `tailwindcss-animate`.
- Import `framer-motion` from `framer-motion`.
- Page transitions: `AnimatePresence` keyed by `location.pathname` around the `<Outlet />`.
- Keep durations short (about 0.2 to 0.5s) and define variants outside the component to avoid re-creation. Add `layout` props sparingly. Clean up, avoid animating long lists all at once (stagger a visible page only).

**Toasts and icons:** Use `toast.promise` for async mutations; avoid duplicate toasts. Icons: named imports only; icon-only buttons need `aria-label`, decorative icons `aria-hidden`.

**UI states and quality:** Render TMDB data defensively (fallback poster, missing date/overview, empty arrays, optional chaining).

**Security:** Never `dangerouslySetInnerHTML` with API data.

## Backend Rules (only when the plan touches the backend)

- **Scalability first:** `lean()`/`select()` on reads; no sync-blocking work; apply planned TMDB caching and coalescing. No new infrastructure without plan approval.
- **Auth:** exclude `password`/tokens from responses; generic auth errors.
- **Async and errors:** `await` everything, no floating promises or empty `catch`; map `CastError`/`ValidationError` to 400, `11000` to 409, else generic 500; never leak internals.
- **TMDB:** retries only on idempotent GETs (max 2, jittered backoff, never on 4xx).

## Implementation Discipline

- Do NOT add unapproved dependencies.

## Self-Review Pass (required before reporting done)

Re-read your diff as Code-Review would and fix any Medium-or-higher issue:

1. **Shadcn/UI:** Components installed via CLI (not hand-written)? Base UI API followed (`render`, not `asChild`)? Existing components reused?
2. **Animation split:** shadcn primitives left to tw-animate-css, custom motion in framer-motion, transform/opacity only, reduced motion respected?
3. **Lifecycle:** Effect cleanup and cancellation, StrictMode safety, stale closures, double submits, correct deps?
4. **UI states:** Loading, error, empty, success on every data view; no undefined access on TMDB data?
5. **Styling:** No dynamic Tailwind class strings, no v3 patterns, tokens instead of hex, responsive at all breakpoints?
6. **Routing:** Route guards, 404, lazy loading, `Link` not `<a>`, params validated?
7. **Contracts:** Frontend matches backend response, error, and pagination shapes exactly?
8. **Backend (if touched):** Unbounded queries, missing indexes, N+1, unvalidated input, missing ownership filter, unmapped errors, TMDB timeout/`res.ok`?

## Post-Implementation Verification

1. Verify imports/exports, aliases, routing, and API contracts.
2. Verify auth and ownership on user-owned endpoints and protected routes.
3. Check UI states and responsive layout.
4. Run available build, lint, and test commands (e.g. `npm run build`, `npm run lint`). Exercise bad paths where practical: invalid route params, `page=abc`, API 500/offline, rapid param changes, TMDB timeout.
5. Inspect the git diff for unintended changes.

## Output Format

1. **Summary of Changes**
2. **Files Created / Modified** (and shadcn components installed)
3. **Defensive Spec Coverage** (plan or standards items mapped to implementation, or N/A with reason)
4. **Verification Steps Completed** (including self-review findings fixed)
5. **Manual Verification Required** (if any)
