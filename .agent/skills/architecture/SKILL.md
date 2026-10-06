---
name: architecture
description: Designs implementation architecture for movie-box features across frontend, backend, database, APIs, authentication and external services. Use before implementing non-trivial features or when architectural decisions are required.
---

# Architecture Skill

Design the simplest architecture that correctly satisfies the requirement and fits the existing movie-box codebase.

Do not write implementation code unless explicitly requested.

## Workflow

### 1. Understand the Requirement

Identify:

- feature goal
- user flow
- functional requirements
- affected user roles
- inputs and outputs
- acceptance criteria
- important edge cases

If a major requirement is ambiguous, ask a targeted question instead of inventing behavior.

### 2. Inspect the Existing System

Before designing anything:

- inspect the relevant frontend structure
- inspect relevant backend routes/controllers/services
- inspect relevant models
- inspect authentication/authorization
- inspect existing API contracts
- inspect existing reusable components/utilities

Prefer extending existing patterns over introducing new ones.

### 3. Design the Feature

Consider all affected layers:

#### Frontend
- pages/routes
- component hierarchy
- reusable components
- local/shared state
- API integration
- loading/error/empty states
- responsive behavior
- user interactions

#### Backend
- routes
- controllers
- services/business logic
- middleware
- validation
- error handling
- authorization

#### Database
- required collections/models
- fields
- relationships
- indexes
- uniqueness constraints
- read/write patterns

#### External Services
If applicable:

- TMDB
- authentication providers
- file storage
- AI services
- other third-party APIs

Define where the integration belongs and how failures are handled.

### 4. Define Data Flow

Describe the relevant flow, for example:

User action
→ React component
→ API layer
→ Express route
→ middleware
→ controller
→ service
→ database/external API
→ response
→ UI state update

Only include layers that are actually involved.

### 5. Define Contracts

For affected APIs specify:

- method
- path
- authentication requirement
- parameters/query/body
- validation rules
- response shape
- important error cases

For frontend/backend boundaries, make the contract explicit.

### 6. Identify Changes

List:

- files/modules to create
- files/modules to modify
- database changes
- dependencies, if any
- environment changes, if any

Do not force artificial file changes simply to satisfy a template.

### 7. Evaluate Risks

Check:

- authorization
- data ownership
- race conditions
- duplicate requests
- pagination
- external API failures
- invalid input
- performance
- backwards compatibility
- frontend UX failure states

### 8. Produce the Plan

Output:

1. Requirement understanding
2. Proposed approach
3. Frontend design
4. Backend design
5. Database design
6. API contracts
7. Data flow
8. Files/modules affected
9. Edge cases and risks
10. Ordered implementation steps

Clearly label frontend/backend/database work where useful.

## Constraints

- Prefer the simplest viable architecture.
- Do not introduce microservices, repositories, factories or other abstractions without a concrete need.
- Do not redesign unrelated parts of the application.
- Do not duplicate existing utilities or patterns.
- Do not assume a technology or feature exists simply because it appears in documentation.
- The architecture must be implementable by the development skill without requiring major reinterpretation.