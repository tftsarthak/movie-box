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

- **Frontend Folder Structure:**
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

## React Stack Versions (Frontend)

react ^19.2.8, react-dom ^19.2.8, react-router ^8.4.0, axios ^1.20.0, tailwindcss ^4.3.3 + @tailwindcss/vite, shadcn ^4.21.3 on **Base UI** (@base-ui/react ^1.8.0), tw-animate-css ^1.4.0, framer-motion ^14.1.0, react-hot-toast ^2.6.1, vite ^8.3.0, npm.

These versions may be newer than your training knowledge. When unsure of an API, read the installed package's types/README in `node_modules` or copy the pattern from existing code. Never guess from older versions.

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

## **UI system: shadcn/ui on Base UI only.**
- Components come from shadcn. For every shadcn component the feature needs, the plan lists it under "Components to Install" with the exact command `npx shadcn@latest add <component-name>`. Check `components/ui` first; do not list components already installed.
- Reference for names and usage: https://ui.shadcn.com/docs/components. Because this project uses the Base UI variant, composition differs from Radix-era examples (e.g. a `render` prop instead of `asChild`). Plan against the generated component source, not memory.
- Do not plan hand-written clones of shadcn components. Custom components are composed from shadcn primitives plus Tailwind.
- Toasts use `react-hot-toast` (one `<Toaster />` at the app root). Do not plan the shadcn `sonner` component.
- Icons use the icon library configured in `components.json` (check it; lucide-react is shadcn's default).

## Styling and Motion (Strict Split)

### Styling (Tailwind v4)
* CSS-first configuration in `index.css` via `@import "tailwindcss"`, `@theme`, and CSS variables; do not use `tailwind.config.js`, version 3 directives, or old configuration patterns.
* Never build class names dynamically (e.g., `bg-${x}-500` will not be detected by the compiler); use full literal classes or a lookup map.
* Use shadcn tokens (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border`); never use hard-coded hex colors.
* Follow mobile-first design principles using `sm:`, `md:`, and `lg:` prefixes.
* Compose conditional classes cleanly using `cn()`.

### Animation (Strict Split)

#### `tw-animate-css`
* Owns shadcn/ui utility animations, handling enter and exit transitions for components like dialogs, popovers, dropdowns, sheets, tooltips, and accordions via `animate-in`, `fade-in`, `zoom-in`, and `data-[state=...]` attributes.
* Do not wrap shadcn primitives in `framer-motion` just to re-animate them.
* Ensure `@import "tw-animate-css"` exists in `index.css`; do not add `tailwindcss-animate`.

#### `framer-motion`
* Owns custom movie-site interactions, including page transitions, carousels, hero sections, animated or hover cards, staggered lists, and layout animations. Import directly from `framer-motion`.
* **Page Transitions:** Wrap content using `<AnimatePresence>` keyed by `location.pathname` around the `<Outlet />`.
* **Performance Best Practices:**
  * Animate transform and opacity properties only (`x`, `y`, `scale`, `opacity`); never animate layout properties like `width`, `height`, `top`, or `left`.
  * Respect user preferences by checking `useReducedMotion()` to disable or simplify movement.
  * Keep transition durations short (approximately 0.2s to 0.5s).
  * Define variants outside components to prevent re-creation on every render.
  * Use layout props sparingly.
  * Keep things clean by avoiding the animation of long lists all at once—stagger only the visible elements on the current page.

## Backend Standards & Rules (when touched)

* **Architecture Boundaries:** Reuse existing route -> controller -> service boundaries, error utilities, async wrapper, auth middleware, and TMDB service. Preserve existing response contracts.
* **Scalability First:** 
  * Stateless handlers.
  * Paginate every list with a clamped hard limit (cursor for growing collections).
  * Declare indexes in the schema for every new query.
  * No N+1 queries (`$in`, populate with select, bounded aggregation).
  * Chunk fan-out over user-controlled lists.
  * Atomic idempotent writes (upsert, `$addToSet`, unique index with 11000 handling, no check-then-insert).
  * `lean()`/`select()` on reads.
  * No sync-blocking work.
  * Apply planned TMDB caching and coalescing. No new infrastructure without plan approval.
* **Inputs:** 
  * Never use raw `req.*`.
  * Parse and clamp (`Number.parseInt` + `Number.isFinite`, never `NaN`).
  * Validate `tmdbId` against `/^\d+$/`.
  * Validate `mongoose.isValidObjectId`, `typeof v === 'string'`.
  * Whitelist body fields (never `new Model(req.body)`).
  * Encode user text in outbound URLs.
* **Auth:** 
  * Ownership inside the query (`findOne({ _id, user: req.user.id })`).
  * User ID strictly from the token.
  * Exclude password/tokens from responses.
  * Generic auth errors.
* **Async and Errors:** 
  * Await everything, no floating promises or empty catch blocks.
  * Map `CastError`/`ValidationError` to `400`, `11000` to `409`, upstream timeout to `504`, upstream failure to `502`, upstream `429` to `503`, else generic `500`.
  * Never leak internals.
* **TMDB Integration:** 
  * Through the service layer only.
  * Request signal: `AbortSignal.timeout(8000)`.
  * Check `res.ok`, guard `res.json()`.
  * Treat fields as optional.
  * Retries only on idempotent GETs (max 2, jittered backoff, never on `4xx`).
  * API key never exposed.

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