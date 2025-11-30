# Implementation Plan: LLM Chat Interface

**Branch**: `feature/001-llm-chat-interface` | **Date**: 2025-11-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-llm-chat-interface/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a web-based LLM chat interface with real-time streaming responses. Frontend displays user messages in bubbles and LLM responses with Markdown rendering. Backend acts as secure proxy to ai-proxy service (github.com/slaveeks/ai-proxy), forwarding user prompts and streaming NDJSON responses via Server-Sent Events. MVP focuses on text-only responses with in-memory session storage; reasoning display and file attachments deferred to post-MVP.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (both frontend and backend)
**Primary Dependencies**:
- Backend: Express.js 5.0, eventsource-parser for SSE streaming, native fetch for ai-proxy requests
- Frontend: Svelte 5.43.8 + SvelteKit 2.48.5, marked.js 17.0.1 for Markdown parsing, highlight.js 11.11.1 for syntax highlighting, native EventSource for SSE
**Storage**: In-memory only (no persistence for MVP)
**Testing**: Vitest (unit/integration), @testing-library/svelte (component tests), Playwright (E2E)
**Target Platform**: Modern web browsers (last 2 versions Chrome/Firefox/Safari/Edge), Node.js backend
**Project Type**: Web application (backend + frontend)
**Performance Goals**:
- Streaming responses begin within 1 second
- UI interaction lag < 100ms
- Full conversation flow < 30 seconds first use
**Constraints**:
- Backend p95 latency < 200ms (excluding ai-proxy time)
- Frontend FCP < 1.5s, TTI < 3.5s
- No CORS issues between frontend and backend
**Scale/Scope**:
- Single conversation session per user
- Support 20-line messages without layout issues
- 95% Markdown rendering accuracy

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Quality-First Development (NON-NEGOTIABLE)

**Status**: ✅ PASS

**Evidence**:
- Feature spec includes comprehensive acceptance scenarios for all user stories
- Test-first workflow enforced: contract tests for API endpoints required
- Integration tests required for frontend-backend SSE streaming
- Unit tests required for Markdown AST parsing
- E2E tests for full conversation flow

**Gates to verify**:
- [ ] API contract tests written and reviewed before backend implementation
- [ ] Frontend component tests written before UI implementation
- [ ] SSE streaming integration tests pass
- [ ] Markdown rendering tests cover edge cases

### II. Developer Experience

**Status**: ✅ PASS

**Evidence**:
- README/quickstart.md to be generated in Phase 1
- API contracts documented via OpenAPI in Phase 1
- Architecture decisions (SSE vs WebSocket, in-memory vs localStorage) recorded in spec clarifications
- Project structure documented in this plan

**Gates to verify**:
- [ ] quickstart.md includes local dev setup
- [ ] API contracts include request/response examples
- [ ] Backend and frontend setup automated via npm scripts
- [ ] Inline comments for non-obvious SSE stream handling

### III. Performance & Scalability

**Status**: ✅ PASS

**Evidence**:
- Performance targets defined in spec (SC-001 through SC-010)
- SSE chosen for efficient unidirectional streaming
- In-memory storage for minimal latency
- Frontend bundle size target < 500KB gzipped

**Gates to verify**:
- [ ] API endpoints < 200ms p95 (excluding ai-proxy)
- [ ] Frontend FCP < 1.5s, TTI < 3.5s
- [ ] SSE streaming latency < 1s from backend to frontend
- [ ] Markdown rendering < 100ms interaction lag

**Constitution Compliance**: All three core principles satisfied. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-llm-chat-interface/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api.openapi.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── server.ts              # Express/Fastify app setup
│   ├── routes/
│   │   ├── health.ts          # Health check endpoint
│   │   ├── chat.ts            # POST /chat (sync), GET /chat/stream (SSE)
│   │   └── index.ts           # Route aggregation
│   ├── services/
│   │   ├── aiProxyClient.ts   # ai-proxy integration (POST /generate, POST /stream)
│   │   └── sseStream.ts       # SSE response streaming logic
│   ├── middleware/
│   │   ├── errorHandler.ts    # Centralized error handling
│   │   └── validation.ts      # Request validation
│   └── types/
│       ├── aiProxy.ts         # ai-proxy request/response types
│       └── chat.ts            # Chat message types
└── tests/
    ├── contract/
    │   └── chat.contract.test.ts    # API contract tests
    ├── integration/
    │   └── aiProxy.integration.test.ts  # ai-proxy integration tests
    └── unit/
        ├── sseStream.test.ts
        └── aiProxyClient.test.ts

frontend/
├── src/
│   ├── routes/
│   │   └── +page.svelte        # Main chat page (SvelteKit routing)
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ChatInterface.svelte   # Main chat container
│   │   │   ├── MessageList.svelte     # Scrollable message history
│   │   │   ├── MessageBubble.svelte   # Single message component
│   │   │   ├── ChatInput.svelte       # Auto-resizing input form
│   │   │   ├── MarkdownRenderer.svelte # Markdown parser & renderer
│   │   │   └── ErrorDisplay.svelte    # Error message with retry button
│   │   ├── services/
│   │   │   └── api.ts          # Backend API client + SSE streaming
│   │   ├── stores/
│   │   │   ├── conversation.ts # Chat state management (Svelte stores)
│   │   │   └── ui.ts           # UI state (loading, errors)
│   │   └── types/
│   │       ├── message.ts      # Message, Session types
│   │       └── api.ts          # API request/response types
│   └── app.css                 # Global styles + CSS variables
└── tests/
    ├── e2e/
    │   └── chat.spec.ts        # Full conversation flow E2E
    ├── integration/
    │   └── sseStream.integration.test.ts  # SSE streaming tests
    └── unit/
        ├── components/
        │   ├── MarkdownRenderer.test.ts
        │   └── ChatInput.test.ts
        ├── services/
        │   └── api.test.ts
        └── stores/
            └── conversation.test.ts
```

**Structure Decision**: Web application structure with TypeScript monorepo. Backend (Express.js) handles ai-proxy integration and SSE streaming. Frontend (Svelte + SvelteKit) uses file-based routing (`routes/+page.svelte`), component library in `lib/components/`, and Svelte stores for state management in `lib/stores/`. Shared types defined in each project's `types/` directory (duplicated for simplicity in MVP; can be extracted to shared package post-MVP).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations - constitution compliance verified.*
