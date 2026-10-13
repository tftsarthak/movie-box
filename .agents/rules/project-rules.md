---
trigger: always_on
description: Core project rules, stack, architecture conventions, security boundaries, and coding standards for movie-box.
---

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
- **Frontend versions (verify against package.json):** react ^19.2.8, react-dom ^19.2.8, react-router ^8.4.0, axios ^1.20.0, tailwindcss ^4.3.3 + @tailwindcss/vite, shadcn ^4.21.3 on **Base UI** (@base-ui/react ^1.8.0), tw-animate-css ^1.4.0, framer-motion ^14.1.0, react-hot-toast ^2.6.1, vite ^8.3.0, npm.
- These versions may be newer than your training knowledge. When unsure of an API, read the installed package's types/README in `node_modules` or the existing code. Do not guess from older versions.
- Do NOT introduce TypeScript, Prisma, alternative ORMs, or additional databases unless explicitly requested.


## Architecture & Boundaries

- **Backend:** `routes/`, `controllers/`, `services/`, `models/`, `middlewares/`, `utils/`
- **Frontend:** pages, components, state, API access
- **API Boundary:** `Frontend → movie-box Backend → MongoDB / TMDB`
- **API Prefix:** `/api/v1/...`
- Keep external API credentials strictly on the backend. Never expose TMDB secrets to the frontend or Vite client.
- Reuse existing architecture and patterns before introducing new abstractions.
- Do NOT add unnecessary layers such as repositories, factories, or microservices.

- **Backend Folder Structure:**
  ```text
  backend/
  ├── package.json
  └── src/
      ├── api/           # TMDB client & fetch wrappers
      ├── app.js         # Express app initialization & middleware mounting
      ├── controllers/   # Route controllers (account, auth, movie)
      ├── db/            # Db connection setup
      ├── middlewares/   # Custom middlewares (auth, error handling, multer)
      ├── models/        #     
      ├── routes/        # API route definitions
      ├── server.js      # Server entry point
      ├── services/      # Business logic & external service integrations
      └── utils/         # Helper utilities (ApiError, ApiResponse, asyncHandler, cloudinary)
  ```

- **Frontend Folder Structure:**
  ```text
  frontend/
  ├── package.json
  └── src/
      ├── App.jsx
      ├── main.jsx
      ├── api/           # Axios instance and API calls
      ├── components/    # Reusable components categorized by domain
      │   ├── common/    # EmptyState, ErrorState, LoadingSpinner, ThemeToggle
      │   ├── layout/    # AppLayout, Footer, Navbar
      │   ├── movie/     # HeroBanner, MovieCard, MovieCarousel
      │   └── ui/        # Primitives (button, input)
      ├── context/       # React context providers (ThemeContext)
      ├── hooks/         # Custom hooks (useTheme)
      ├── lib/           # Constants and utility helpers
      └── pages/         # Page views (HomePage, DiscoverPage, MovieDetailPage, etc.)
  ```

## Frontend Standards

**Routing (react-router v8):**
- Import from `react-router`. Follow the existing router style (data router vs declarative).
- Nested routes with a layout and `<Outlet />`, a protected-route wrapper, a catch-all 404, and a route-level error element.
- Lazy-load page components except the landing path.

**API layer & data fetching (axios):**
- One shared axios instance (baseURL from `import.meta.env`, timeout, interceptors for auth header, error normalization, central 401 handling) and per-resource API modules. Components never import axios or hard-code URLs.
- Every fetch cancels via `AbortController`; debounce search input; pagination matches the backend contract exactly.

**UI system: shadcn/ui on Base UI only:**
- Components come from shadcn. Check `components/ui` and `components.json` (style, aliases, icon library) first.
- Install missing components with `npx shadcn@latest add <component-name>`.
- Reference for names and usage: https://ui.shadcn.com/docs/components. This project uses the Base UI variant, so composition differs from Radix-era examples (a `render` prop instead of `asChild`). Follow the generated component source, not Radix-based snippets or memory.
- Never hand-write or clone shadcn components. Custom components are composed from shadcn primitives plus Tailwind.
- Toasts use `react-hot-toast` with a single `<Toaster />` at the app root. Do not use the shadcn `sonner` component.
- Icons come from the library configured in `components.json` (lucide-react is shadcn's default).

**Styling & motion (strict split):**
- Tailwind v4 is CSS-first: configuration lives in `index.css` (`@import "tailwindcss"`, `@theme`, CSS variables), no `tailwind.config.js`. Design tokens via shadcn CSS variables, no hard-coded hex colors. Mobile-first breakpoints (`sm:`, `md:`, `lg:`).
- `tw-animate-css` owns the shadcn/ui utility animations (dialogs, popovers, dropdowns, accordions, sheets, tooltips: `animate-in`, `fade-in`, `zoom-in`, `data-[state=...]`). Do not re-animate shadcn primitives with framer-motion.
- `framer-motion` owns custom movie-site interactions: page transitions, carousels, hero sections, animated and hover cards, staggered lists, layout animations.
- Animate `transform` and `opacity` only (use `x`, `y`, `scale`, `opacity`), never width/height/top/left. Respect `useReducedMotion()` by disabling or simplifying movement.

**UI states & quality:**
- Every data-driven view renders loading (skeleton for lists/cards), error with retry, empty with helpful message/CTA, and success.
- Mutations: pending state, toast feedback; optimistic updates roll back on failure with a toast.
- Forms: validation matching backend rules, inline errors, pending state, server errors surfaced.
- Accessibility: semantic HTML, labels, keyboard operation, visible focus.
- Posters: fixed `aspect-[2/3]`, `loading="lazy"`, descriptive `alt` with fallback image.
- Responsive layout for mobile, tablet, desktop.
- Paginate or virtualize long lists.
- Pages orchestrate (data hooks), feature components render movie UI, shared UI stays generic.
- No premature memoization: do not add `useMemo`/`useCallback`/`memo` without a clear re-render cost.

## Backend Standards (only when the feature touches the backend)

- Reuse existing routes -> controllers -> services, error utilities, async wrapper, auth middleware, and TMDB service. Preserve existing response contracts.
- **Scalability first:** stateless handlers; paginate every list with a clamped hard `limit` (cursor pagination for growing collections); an index serving every new query; no N+1 (`$in`, `populate` with `select`, bounded aggregation); chunk fan-out over user-controlled lists; atomic idempotent writes (`upsert`, `$addToSet`, unique index with `11000` handling, no check-then-insert).
- **Inputs:** never use raw `req.*`; parse and clamp (`Number.parseInt` + `Number.isFinite`, never `NaN`), `tmdbId` against `/^\d+$/`, `mongoose.isValidObjectId`, `typeof v === 'string'` (operator injection), whitelist body fields (never `new Model(req.body)`), encode user text in outbound URLs.
- **Auth:** ownership inside the query (`findOne({ _id, user: req.user.id })`); user id only from the token.
- **TMDB:** through the service layer only, `signal: AbortSignal.timeout(8000)`, check `res.ok`, guard `res.json()`, treat fields as optional, key never exposed. Error mapping: upstream timeout 504, upstream failure 502, upstream 429 to 503.

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
