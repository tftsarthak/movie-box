---
name: architecture
description: Designs implementation plans for movie-box features across the React 19 frontend (react-router, axios, Tailwind v4, shadcn/ui on Base UI, framer-motion, react-hot-toast) and the existing Express/MongoDB backend before development. Always use before building any non-trivial feature. Produces a plan with a Defensive Spec so it is production-grade before any code exists.
---

# Architecture Skill

Design the simplest scalable, secure, robust architecture that fits the existing codebase. All project-rules apply automatically.

The plan is the contract the Development skill implements and the Code-Review skill audits. Anything left vague here becomes a review finding later, so specify behavior explicitly. The backend is built; most features now add or extend frontend, with small backend additions when needed. Skip backend sections for frontend-only features and say so.

## Workflow (strict)

1. **Inspect:** Read relevant pages, components, hooks, API modules, router config, `components.json`, `index.css`, and (if backend is touched) routes/controllers/services/models. List reusable pieces and which shadcn components are already installed in `components/ui`.
2. **Plan:** Produce the plan in the Output Format. Do not write implementation code. Route maps, component trees, contract shapes, and field lists are fine.
3. **Pre-mortem:** Audit your plan against the Code-Review lens. Walk each screen and endpoint through the Defensive Spec. Fix gaps in the plan.
4. **Confirm and hold:** End with exactly: "Shall I proceed and implement this plan?" Then STOP and wait for explicit approval.

## Frontend Design Standards

**Routing:** Plan every route with path, element, auth requirement, layout, and lazy-loading.

**Component tree:** State ownership per component, local by default; context only for auth or other truly global concerns. Server data lives in custom hooks over API modules.

**API layer:** For each fetch plan: behavior on param change and unmount.

**UI system:** For every shadcn component the feature needs, the plan lists it under "Components to Install" with the exact command `npx shadcn@latest add <component-name>`. Do not list components already installed. Plan against the generated component source, not memory. Do not plan the shadcn `sonner` component.

**Motion:** Plan each animation with its trigger, what animates (transform/opacity only), and reduced-motion behavior.

## Backend Rules (only when the feature touches the backend)

- **Scalability first:** name the index serving each new query; cache hot TMDB reads with TTL plus in-flight coalescing. New infrastructure (e.g. Redis) goes under "Decisions Needing Approval".
- **Auth:** state public/authenticated/owner-only per endpoint.
- **Contracts:** list error cases per endpoint with status codes in the existing error shape.

## Output Format

1. **Requirement and Approach Summary**
2. **Components to Install** (exact `npx shadcn@latest add <name>` commands, or "none")
3. **Frontend Architecture** (route map, component tree, state ownership, hooks/API modules, motion plan, UI states, responsive and a11y)
4. **API Contracts and Data Flow** (`UI -> hook -> API module -> axios -> Route -> Controller -> Service -> DB/TMDB`), only for endpoints used or changed
5. **Backend and Database Changes** (omit if none)
6. **Defensive Spec** (per screen/endpoint; write "N/A because ..." instead of skipping)
7. **Files Affected** (Create / Modify)
8. **Risks, Trade-offs, and Decisions Needing Approval** (new dependencies/infrastructure, Pre-mortem findings)
9. **Step-by-Step Implementation Plan**
10. **Verification Plan** (including bad-path tests)

## Constraints

- No new dependencies beyond shadcn components without listing them under "Decisions Needing Approval".
- Do NOT alter unrelated code, invent requirements, or implement code.
- Apply each standard where it has a real failure mode in this feature, and say briefly when skipping one.
