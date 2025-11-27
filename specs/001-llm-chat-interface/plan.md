# Implementation Plan: LLM Chat Interface

**Branch**: `feature/001-llm-chat-interface` | **Date**: 2025-11-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-llm-chat-interface/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the
execution workflow.

## Summary

Build an LLM-powered chat interface with real-time streaming responses, Markdown rendering, and collapsible reasoning
blocks. The interface features user messages in bubbles (right-aligned) and LLM responses without backgrounds (
left-aligned), with progressive text animation during streaming. The implementation uses **Svelte** for the frontend to
provide an excellent learning experience with reactive components, **Node.js/Express** for the backend API, and *
*Server-Sent Events (SSE)** for real-time streaming. This architecture keeps the MVP focused on core Svelte concepts
while delivering a functional chat application.

## Technical Context

**Language/Version**: TypeScript 5.x (both frontend and backend for type safety and better developer experience)
**Frontend Framework**: Svelte 4.x with SvelteKit for routing and SSR capabilities
**Backend Runtime**: Node.js 20.x LTS with Express 4.x for API server
**Primary Dependencies**:

- **Frontend**: `svelte@4`, `@sveltejs/kit`, `marked` (Markdown AST parser), `highlight.js` (syntax highlighting)
- **Backend**: `express`, `cors`, `dotenv`, `eventsource-parser` (SSE stream parsing)

**Constraint**: No external UI component libraries. All Svelte components are custom-built.

**Storage**: N/A (in-memory conversation state - single session per user, no persistence required for MVP)
**Testing**:

- **Frontend**: Vitest + @testing-library/svelte for component tests
- **Backend**: Vitest for unit tests, Supertest for API integration tests
- **E2E**: Playwright for end-to-end user flow testing

**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Web application (frontend + backend)
**Performance Goals**:

- API response initiation: < 200ms p95
- Frontend FCP (First Contentful Paint): < 1.5s
- Frontend TTI (Time to Interactive): < 3.5s
- Streaming latency: < 100ms from chunk arrival to display
- UI responsiveness during streaming: < 100ms interaction lag

**Constraints**:

- Frontend bundle size: < 500KB initial load (gzipped)
- Memory usage: Reasonable for 1000+ concurrent users on backend
- No database required (simplifies architecture for learning)
- Single conversation session (no multi-session management)

**Scale/Scope**:

- MVP: 1 frontend app + 1 backend API
- Components: ~8-12 Svelte components
- API endpoints: 2-3 endpoints (chat, health check)
- Lines of code estimate: ~1500-2000 total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Quality-First Development (TDD)

**Status**: ✅ PASS (with learning accommodation)

**Compliance**:

- Test structure planned: `tests/contract/`, `tests/integration/`, `tests/unit/`
- Testing frameworks identified: Vitest, @testing-library/svelte, Playwright
- TDD workflow will be followed with educational focus

**Learning Accommodation**:
Since this is explicitly a learning project for Svelte, we'll adapt TDD to support learning:

- **Phase 1**: Write component interface tests first (what props, what events)
- **Phase 2**: Implement components to pass tests
- **Phase 3**: Add integration tests for component interactions
- This maintains TDD principles while allowing exploration of Svelte concepts

**Integration Testing Requirements (per constitution)**:

- ✅ API endpoint contract tests: Planned for `/api/chat` streaming endpoint
- ✅ Frontend-backend integration tests: SSE streaming integration test planned
- ✅ State management tests: Svelte store tests for conversation state
- ✅ External service integration tests: LLM proxy service integration test

---

### Principle II: Developer Experience

**Status**: ✅ PASS

**Compliance**:

- **Documentation**: quickstart.md will be generated in Phase 1
- **API Documentation**: Contract definitions in `/contracts/` directory
- **Inline Comments**: Will document non-obvious Svelte reactivity patterns
- **ADRs**: Key decisions (Svelte over React, SSE over WebSockets) documented in research.md

**Tooling Requirements (per constitution)**:

- ✅ CLI commands: `npm run dev`, `npm run build`, `npm test`
- ✅ Linting/Formatting: ESLint + Prettier configured, enforced in package.json scripts
- ✅ Environment setup: Documented in quickstart.md with step-by-step instructions

**Learning-Specific Documentation**:

- Svelte concepts explained inline (reactivity, stores, lifecycle)
- Progressive complexity: Start with simple components, build to advanced patterns
- Comments explaining "why" not just "what" for Svelte-specific patterns

---

### Principle III: Performance & Scalability

**Status**: ✅ PASS

**Compliance**:

- **API Targets**: < 200ms p95 (LLM streaming initiation measured separately)
- **Frontend Targets**: FCP < 1.5s, TTI < 3.5s (enforced via Lighthouse CI)
- **Database**: N/A (no database in MVP)
- **Concurrent Users**: 1000+ supported via stateless API design

**Optimization Strategy**:

- **Bundle Size**: Svelte compiles to minimal vanilla JS (< 500KB target)
- **Streaming**: SSE for efficient real-time updates without WebSocket overhead
- **Caching**: LLM responses not cached (per-session uniqueness)
- **Pagination**: Implemented for long conversation history (lazy rendering)

**Performance Monitoring**:

- Lighthouse CI in testing pipeline
- Bundle analyzer for frontend builds
- API response time logging

---

### Quality Gates Summary

| Gate                       | Status | Evidence                                           |
|----------------------------|--------|----------------------------------------------------|
| 1. Constitution Compliance | ✅ PASS | All three principles addressed above               |
| 2. Test Coverage           | ✅ PASS | Testing strategy defined, TDD adapted for learning |
| 3. Documentation           | ✅ PASS | quickstart.md, contracts, inline comments planned  |
| 4. Performance             | ✅ PASS | Targets defined, monitoring strategy in place      |
| 5. Security Review         | ✅ PASS | Input validation, env vars, CORS configured        |

**No violations requiring justification in Complexity Tracking table.**

## Project Structure

### Documentation (this feature)

```text
specs/001-llm-chat-interface/
├── plan.md              # This file (Phase 0 planning complete)
├── research.md          # Phase 0 output (technology decisions and rationale)
├── data-model.md        # Phase 1 output (entities and state shape)
├── quickstart.md        # Phase 1 output (setup and development guide)
├── contracts/           # Phase 1 output (API contracts)
│   └── chat-api.yaml    # OpenAPI 3.0 spec for chat endpoints
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT YET CREATED)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── server.ts           # Express app setup
│   ├── routes/
│   │   ├── chat.ts         # POST /api/chat - streaming endpoint
│   │   └── health.ts       # GET /health - health check
│   ├── services/
│   │   ├── llm.ts          # LLM proxy client (SSE streaming)
│   │   └── markdown.ts     # Markdown preprocessing if needed
│   └── types/
│       └── index.ts        # Shared TypeScript types
└── tests/
    ├── integration/
    │   └── chat.test.ts    # API endpoint tests
    └── unit/
        └── llm.test.ts     # LLM client unit tests

frontend/
├── src/
│   ├── routes/
│   │   └── +page.svelte    # Main chat page (SvelteKit route)
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ChatContainer.svelte       # Main chat UI container
│   │   │   ├── MessageList.svelte         # Scrollable message list
│   │   │   ├── MessageBubble.svelte       # User message (right-aligned bubble)
│   │   │   ├── LLMResponse.svelte         # LLM response (left-aligned, no bubble)
│   │   │   ├── ThinkingIndicator.svelte   # "Thinking..." animation
│   │   │   ├── ReasoningBlock.svelte      # Collapsible reasoning text
│   │   │   ├── MarkdownRenderer.svelte    # Markdown AST renderer
│   │   │   ├── MessageInput.svelte        # Auto-resizing input form
│   │   │   └── AttachButton.svelte        # Placeholder file attach button
│   │   ├── stores/
│   │   │   ├── conversation.ts            # Svelte store for messages
│   │   │   └── ui.ts                      # UI state (thinking, streaming, etc.)
│   │   ├── services/
│   │   │   ├── api.ts                     # API client (fetch + SSE)
│   │   │   └── markdown-parser.ts         # Markdown to AST conversion
│   │   └── types/
│   │       └── index.ts                   # TypeScript interfaces
│   └── app.css                            # Global styles
└── tests/
    ├── unit/
    │   ├── components/                    # Component unit tests
    │   └── stores/                        # Store unit tests
    └── e2e/
        └── chat-flow.spec.ts              # Playwright end-to-end test

shared/
└── types.ts                               # Shared TypeScript types (Message, etc.)

.env.example                               # Environment variable template
package.json                               # Root workspace config
```

**Structure Decision**: Selected **Option 2: Web application** (frontend + backend) structure. This separation provides:

1. **Clear Learning Boundaries**: Frontend focuses on Svelte concepts, backend on API/streaming patterns
2. **Type Safety**: Shared types ensure frontend-backend contract alignment
3. **Independent Testing**: Component tests don't require backend, API tests don't require frontend
4. **Deployment Flexibility**: Can deploy frontend (static) and backend (Node) separately if needed

The `shared/` directory contains TypeScript types used by both frontend and backend to ensure type safety across the API
boundary.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations - table not needed.*

All complexity is justified by core requirements:

- **Svelte + SvelteKit**: Learning goal (explicitly requested by user)
- **SSE Streaming**: Required for FR-004 (real-time streaming responses)
- **Markdown Parser**: Required for FR-003 (render Markdown formatting)
- **TypeScript**: Best practice for maintainability, no added complexity vs JavaScript