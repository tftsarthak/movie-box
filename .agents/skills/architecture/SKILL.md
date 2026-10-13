---
name: architecture
description: Designs implementation plans for movie-box features across frontend, backend, database, APIs, authentication, and external services before development.
---

# Architecture Skill

Design the simplest, resilient architecture that satisfies the requirement and fits the existing codebase. All project-rules apply automatically.

**Rule:**
Act as an expert senior software engineer architect, Always follow this multi-step workflow strictly:

1. **Plan:** Generate a comprehensive, step-by-step implementation plan based on my requirements. Do not write any code yet.
2. **Confirm:** At the end of your plan, explicitly ask me: "Shall I proceed and implement this plan?"
3. **Hold:** STOP execution immediately after the prompt. Wait for my explicit approval before writing or delivering any code.



## Workflow

1. **Inspect & Understand**
   - Check relevant existing code before proposing anything new.
   - Ask questions only if an ambiguity fundamentally alters the design.

2. **Design Across Boundaries (Defensive by Default)**
   - **Frontend:** Pages/routes, component responsibilities, state ownership, API calls, UI states (`loading`, `error`, `empty`, `success`), responsive behavior.
   - **Backend:** Routes, controllers, services, middleware, validation, authorization.
     - *Input Sanitation:* Specify strict casting/validation for query params (e.g., parsing/clamping `page` numbers safely to prevent `NaN`) and format validation for route parameters (e.g., numeric regex checks for IDs like `tmdbId`).
   - **Database:** Schemas, relationships, indexes, uniqueness constraints.
   - **External APIs (TMDB):** 
     - *Timeouts:* Mandate outbound fetch timeouts using `AbortSignal.timeout(8000)` to prevent hung sockets/worker blocking.
     - *Response Safety:* Handle safe upstream JSON parsing and map gateway errors gracefully.
     
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