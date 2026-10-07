---
name: architecture
description: Designs implementation plans for movie-box features across frontend, backend, database, APIs, authentication, and external services before development.
---

# Architecture Skill

Design the simplest architecture that satisfies the requirement and fits the existing codebase. All project-rules apply automatically.

**Rule:** Plan only. Do NOT write implementation code unless explicitly requested.

## Workflow

1. **Inspect & Understand**
   - Check relevant existing code before proposing anything new.
   - Ask questions only if an ambiguity fundamentally alters the design.

2. **Design Across Boundaries**
   - **Frontend:** Pages/routes, component responsibilities, state ownership, API calls, UI states, responsive behavior.
   - **Backend:** Routes, controllers, services, middleware, validation, authorization.
   - **Database:** Schemas, relationships, indexes.
   - **External:** Failure/timeout handling for TMDB calls.

3. **Data Flow & Contracts**
   - Trace the relevant flow (`UI → API → Middleware → Controller → Service → DB/TMDB → Response`).
   - Specify HTTP method, route, auth, request/response shape, and important error cases.

## Output Format

1. **Requirement & Approach Summary**
2. **API Contracts & Data Flow**
3. **Frontend Architecture**
4. **Backend & Database Schema Changes**
5. **Files Affected** (Create / Modify)
6. **Risks, Security, & Edge Cases**
7. **Step-by-Step Implementation Plan**

## Constraints

- Reuse existing patterns. No unnecessary abstractions.
- Do NOT alter unrelated code, invent requirements, or implement code.