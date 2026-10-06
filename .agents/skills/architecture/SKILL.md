---
name: architecture
description: >-
  Use this skill when the user needs to plan a new feature, design API
  endpoints, define data models, decide data flow, or produce an
  implementation plan before coding. Activate before any significant
  development work begins.
---

# Architecture Skill

Plan before you build. This skill produces a concrete implementation plan
that the development skill can directly execute.

## Workflow

1.  **Clarify Requirements**
    - Ask targeted questions if the scope, user stories, or acceptance
      criteria are ambiguous. Do not assume unstated requirements.

2.  **Inspect the Existing Codebase**
    - Read relevant models, controllers, routes, services, and middlewares.
    - Identify existing patterns (ApiError/ApiResponse, asyncHandler,
      service layer, middleware chain) and which pieces can be reused.
    - Note the current Mongoose schemas, route prefixes, and auth flow.

3.  **Design — Produce These Sections**

    | Section | What to Define |
    |---|---|
    | **Data Models** | Mongoose schema fields, types, indexes, refs, virtuals, pre/post hooks |
    | **API Endpoints** | Method, path (`/api/v1/...`), auth requirement, request/response shape |
    | **Data Flow** | Request → middleware → controller → service → DB/external API → response |
    | **Frontend Components** | Component tree, state management approach, API integration points |
    | **File Changes** | Exact files to create or modify, in which directory |

4.  **Identify Risks & Decisions**
    - Flag edge cases, performance concerns, security considerations, and
      any design trade-offs that need the user's input.

5.  **Produce the Plan**
    - Output a numbered, step-by-step implementation plan.
    - Each step must map to a specific file and function.
    - Mark steps as `[backend]` or `[frontend]`.

## Constraints

- Do NOT write implementation code — only plan, schemas, and signatures.
- Respect existing patterns; do not propose alternative utilities or
  response formats unless there is a clear deficiency.
- The plan must be complete enough that the development skill can execute
  it without re-reading requirements.
- When designing endpoints, include request body validation rules.
