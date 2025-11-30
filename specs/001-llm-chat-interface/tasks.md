---
description: "Task list for LLM Chat Interface implementation - Updated 2025-11-30"
---

# Tasks: LLM Chat Interface

**Input**: Design documents from `/specs/001-llm-chat-interface/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/chat-api.yaml

**Tests**: Tests are included per the constitution (Principle I: Quality-First Development with TDD). Tests follow the learning-adapted TDD approach documented in plan.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Status**: Updated based on current codebase analysis - many foundational tasks complete, US1/US2 partially complete, US3/US4 need work.

## Format: `- [ ] [TaskID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

This is a **web application** with separate frontend and backend:
- Backend: `backend/src/`, `backend/tests/`
- Frontend: `frontend/src/`, `frontend/tests/`
- Shared types: `shared/types.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

**Status**: ✅ COMPLETE

- [x] T001 Create project directory structure (backend/, frontend/, shared/)
- [x] T002 [P] Initialize backend Node.js project with TypeScript 5.x, Express 5.x, cors, dotenv
- [x] T003 [P] Initialize frontend SvelteKit project with TypeScript 5.x, Svelte 5.x, marked, highlight.js
- [x] T004 [P] Configure ESLint and Prettier for both backend and frontend
- [x] T005 [P] Setup Vitest for backend unit/integration tests in backend/tests/
- [x] T006 [P] Setup Vitest + @testing-library/svelte for frontend component tests in frontend/tests/
- [x] T007 [P] Setup Playwright for E2E tests in frontend/tests/e2e/
- [x] T008 Create shared/types.ts with TypeScript interfaces (Message, ConversationSession, StreamChunk)
- [x] T009 Create .env.example with LLM_API_URL, LLM_API_TOKEN, PORT placeholders
- [x] T010 [P] Configure TypeScript strict mode for both backend and frontend
- [x] T011 [P] Setup global CSS variables in frontend/src/app.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**Status**: ✅ COMPLETE

- [x] T012 Create backend/src/server.ts with Express app initialization and CORS configuration
- [x] T013 [P] Implement backend/src/routes/health.ts with GET /health endpoint
- [x] T014 [P] Create backend/src/services/llm.ts for LLM proxy client (SSE streaming)
- [x] T015 [P] Create frontend/src/lib/stores/conversation.ts with Svelte writable store for messages array
- [x] T016 [P] Create frontend/src/lib/stores/ui.ts with stores for isThinking, isStreaming, errorMessage
- [x] T017 [P] Create frontend/src/lib/services/api.ts for API client (fetch + SSE handling)
- [x] T018 Setup backend error handling middleware in backend/src/server.ts
- [x] T019 Setup environment configuration loading in backend/src/server.ts using dotenv
- [x] T020 Verify health endpoint returns 200 OK

**Checkpoint**: ✅ Foundation ready - user story implementation can now proceed

---

## Phase 3: User Story 1 - Initiate Conversation with LLM (Priority: P1) 🎯 MVP

**Goal**: Users can open the interface, type a message, send it, and receive a visible response from the LLM with Markdown formatting

**Independent Test**: Open interface, type "Hello", press Enter, see message appear right-aligned in bubble, see LLM response left-aligned with formatted text

**Status**: 🔄 PARTIALLY COMPLETE (Components exist, need testing and Markdown rendering)

### Tests for User Story 1

> **NOTE**: TDD approach - tests should be written/verified before marking implementation complete

- [x] T021 [P] [US1] Component test for ChatInput in frontend/tests/unit/components/ChatInput.test.ts
- [x] T022 [P] [US1] Component test for MessageList in frontend/tests/unit/components/MessageList.test.ts
- [ ] T023 [P] [US1] Component test for MessageBubble: verify user/LLM rendering, styling in frontend/tests/unit/components/MessageBubble.test.ts
- [ ] T024 [P] [US1] Component test for Markdown rendering: verify headers, lists, code blocks display correctly
- [ ] T025 [P] [US1] Integration test for POST /api/chat: validates request body, returns SSE stream in backend/tests/integration/chat.test.ts
- [x] T026 [P] [US1] Store tests for conversation store in frontend/tests/unit/stores/conversation.test.ts

### Implementation for User Story 1

- [x] T027 [P] [US1] Create frontend/src/lib/components/MessageBubble.svelte (user message, right-aligned, bubble styling)
- [x] T028 [P] [US1] Create frontend/src/lib/components/ChatInput.svelte (textarea, auto-resize, Enter to submit, validation)
- [ ] T029 [P] [US1] Implement Markdown rendering in MessageBubble.svelte using marked library with AST pattern (FR-018)
- [ ] T030 [P] [US1] Add syntax highlighting for code blocks using highlight.js in MessageBubble
- [x] T031 [US1] Create frontend/src/lib/components/MessageList.svelte (scrollable container, renders MessageBubble)
- [x] T032 [US1] Implement backend/src/routes/chat.ts with POST /api/chat endpoint
- [x] T033 [US1] Implement backend/src/services/llm.ts LLM proxy client with SSE streaming
- [x] T034 [US1] Implement frontend/src/lib/services/api.ts sendMessage function with SSE EventSource
- [x] T035 [US1] Wire conversation store functions (addMessage, updateMessage) in frontend/src/lib/stores/conversation.ts
- [x] T036 [US1] Create frontend/src/routes/+page.svelte (main route, use MessageList + ChatInput, subscribe to stores)
- [x] T037 [US1] Add input validation in ChatInput: prevent empty message submission (FR-016)
- [ ] T038 [US1] Add comprehensive error handling for LLM connection failures with user-friendly messages
- [ ] T039 [US1] Run all User Story 1 tests and verify they pass
- [ ] T040 [US1] Manual test: send message "Hello", verify user bubble right-aligned, LLM response left-aligned with Markdown

**Checkpoint**: User Story 1 MVP should be functional after T040

---

## Phase 4: User Story 2 - Experience Real-Time Streaming Responses (Priority: P2)

**Goal**: Users see LLM responses appear progressively word-by-word as they are generated

**Independent Test**: Send message "Explain JavaScript in 100 words", observe words appearing progressively with smooth animation

**Status**: 🔄 PARTIALLY COMPLETE (SSE streaming implemented, needs streaming animation refinement)

### Tests for User Story 2

- [ ] T041 [P] [US2] Component test for MessageBubble: verify streaming status triggers animation
- [x] T042 [P] [US2] Integration test for SSE streaming: verify chunks arrive sequentially in frontend/tests/unit/services/api.test.ts
- [x] T043 [P] [US2] E2E test for chat flow in frontend/tests/e2e/chat.spec.ts

### Implementation for User Story 2

- [x] T044 [US2] Update api.ts sendMessage to handle SSE chunk events, append to message content in real-time
- [ ] T045 [P] [US2] Add smooth animation to MessageBubble.svelte for streaming text updates (CSS transition, FR-005)
- [ ] T046 [US2] Update conversation store to handle streaming status transitions (pending → streaming → complete)
- [ ] T047 [US2] Add scroll stability logic to MessageList.svelte: prevent jumps during streaming
- [ ] T048 [US2] Update backend chat.ts to properly stream text-delta events from ai-proxy
- [ ] T049 [US2] Test streaming with long response (200+ words), verify smooth animation and stable scrolling
- [ ] T050 [US2] Run all User Story 2 tests and verify they pass

**Checkpoint**: User Stories 1 AND 2 should both work - basic chat with streaming animation

---

## Phase 5: User Story 4 - Compose and Submit Messages Efficiently (Priority: P2)

**Goal**: Intuitive message input with keyboard shortcuts, auto-resizing, fixed positioning

**Independent Test**: Type multi-line message, see auto-expand, press Enter to send, press Shift+Enter for new line, scroll conversation and see fixed input form

**Status**: 🔄 PARTIALLY COMPLETE (Basic input exists, needs refinement)

### Tests for User Story 4

- [x] T051 [P] [US4] Component test for ChatInput: Enter submits, Shift+Enter adds newline
- [ ] T052 [P] [US4] Component test for ChatInput: auto-resize functionality up to 20 lines (SC-006)
- [ ] T053 [P] [US4] E2E test: verify fixed positioning with gradient overlay during scroll

### Implementation for User Story 4

- [x] T054 [P] [US4] Implement Enter/Shift+Enter keyboard shortcuts in ChatInput.svelte (FR-013, FR-014)
- [ ] T055 [US4] Enhance auto-resize logic in ChatInput.svelte to handle up to 20 lines (FR-012)
- [ ] T056 [US4] Add fixed positioning with gradient overlay to ChatInput in frontend/src/routes/+page.svelte (FR-011, FR-017)
- [ ] T057 [P] [US4] Add file attachment placeholder button UI to ChatInput (FR-015) - shows "Coming soon" on click
- [ ] T058 [US4] Test multi-line input behavior, verify auto-resize and keyboard shortcuts
- [ ] T059 [US4] Run all User Story 4 tests and verify they pass

**Checkpoint**: User Stories 1, 2, AND 4 complete - full MVP experience

---

## Phase 6: Error Handling & Edge Cases (Cross-Cutting)

**Goal**: Robust error handling for connection loss, rate limiting, authentication errors

**Independent Test**: Disconnect network during streaming, verify error message with retry button appears

**Status**: ⏳ NOT STARTED

### Tests for Error Handling

- [ ] T060 [P] Integration test: simulate connection loss mid-stream, verify error handling
- [ ] T061 [P] Integration test: simulate 429 rate limit error, verify error message
- [ ] T062 [P] Integration test: simulate 401/403 auth errors, verify appropriate error display
- [ ] T063 [P] E2E test: test connection loss recovery with retry button

### Implementation for Error Handling

- [ ] T064 [P] Implement connection loss detection in api.ts: discard partial message (FR-026)
- [ ] T065 [P] Add "Connection lost" error message component with retry button
- [ ] T066 [P] Implement 429 rate limit error handling: discard partial, show "Rate limit exceeded" (FR-027)
- [ ] T067 [P] Implement 401/403 error handling: safe error messages without sensitive data (FR-028)
- [ ] T068 Add retry functionality: clear error, retry last message on button click
- [ ] T069 Test all error scenarios: connection loss, rate limit, auth errors, verify recovery

---

## Phase 7: Polish & Final Testing (Post-MVP)

**Goal**: Visual polish, performance optimization, comprehensive E2E testing

**Status**: ⏳ NOT STARTED

### Polish Tasks

- [ ] T070 [P] Optimize CSS animations for smooth 60fps performance
- [ ] T071 [P] Add loading states for all async operations
- [ ] T072 [P] Verify WCAG 2.1 Level A accessibility compliance
- [ ] T073 [P] Test on all target browsers (last 2 versions Chrome/Firefox/Safari/Edge)
- [ ] T074 Performance test: verify < 100ms interaction lag (SC-005)
- [ ] T075 Performance test: verify FCP < 1.5s, TTI < 3.5s (constitution)
- [ ] T076 Final E2E test suite: complete conversation flow with edge cases
- [ ] T077 Code review: verify TypeScript strict mode compliance, no any types
- [ ] T078 Documentation: update README with setup instructions and API documentation
- [ ] T079 Create demo video/GIF showing full chat interaction

---

## Phase 8: User Story 3 - Understand LLM Reasoning Process (Priority: Post-MVP)

**Goal**: Users can see "Thinking..." indicator and view/collapse reasoning text

**Independent Test**: Send complex query, see "Thinking..." indicator, see reasoning text in gray, toggle collapse/expand

**Status**: ⏳ DEFERRED (Post-MVP enhancement)

**Note**: This user story is explicitly marked as Post-MVP in spec.md. Implement only after core MVP (US1, US2, US4) is complete and tested.

### Tests for User Story 3

- [ ] T080 [P] [US3] Component test for ThinkingIndicator: renders animation, hides when complete
- [ ] T081 [P] [US3] Component test for ReasoningBlock: renders reasoning, expand/collapse functionality
- [ ] T082 [P] [US3] Integration test: verify reasoning-delta events handled separately from text-delta

### Implementation for User Story 3

- [ ] T083 [P] [US3] Create frontend/src/lib/components/ThinkingIndicator.svelte (animated "Thinking..." indicator, FR-007)
- [ ] T084 [P] [US3] Create frontend/src/lib/components/ReasoningBlock.svelte (gray/muted reasoning text, collapse/expand, FR-008/FR-009)
- [ ] T085 [US3] Update backend llm.ts to handle reasoning-delta events from ai-proxy (FR-010)
- [ ] T086 [US3] Update Message interface in shared/types.ts to include reasoning: ReasoningBlock | null
- [ ] T087 [US3] Update MessageBubble.svelte to conditionally render ReasoningBlock
- [ ] T088 [US3] Update conversation store to handle reasoning updates separately from text
- [ ] T089 [US3] Wire ThinkingIndicator to ui store isThinking state
- [ ] T090 [US3] Test reasoning display: send complex query, verify thinking indicator, reasoning text, collapse/expand
- [ ] T091 [US3] Verify reasoning collapse/expand performance < 200ms (SC-009)
- [ ] T092 [US3] Run all User Story 3 tests and verify they pass

---

## Dependencies & Execution Order

### MVP Completion Path (Recommended)

**Critical Path** (must complete in order):
1. ✅ Phase 1: Setup
2. ✅ Phase 2: Foundational
3. 🔄 Phase 3: User Story 1 (complete remaining: T023-T024, T029-T030, T038-T040)
4. 🔄 Phase 4: User Story 2 (complete remaining: T041, T045-T050)
5. 🔄 Phase 5: User Story 4 (complete remaining: T052-T053, T055-T059)
6. ⏳ Phase 6: Error Handling (all tasks: T060-T069)
7. ⏳ Phase 7: Polish & Final Testing (all tasks: T070-T079)

**Post-MVP** (only after MVP tested and deployed):
8. ⏳ Phase 8: User Story 3 (all tasks: T080-T092)

### Parallel Execution Opportunities

Within each phase, tasks marked [P] can be executed in parallel by different developers or in parallel work sessions.

**Example - Phase 3 Tests** (all [P], can run simultaneously):
- T023, T024, T025, T026

**Example - Phase 4 Implementation** (some [P]):
- T045 (animation) and T048 (backend streaming) can run in parallel

---

## Summary

**Total Tasks**: 92
- ✅ Complete: 40 tasks (Phases 1-2, partial US1/US2/US4)
- 🔄 In Progress: 28 tasks (US1/US2/US4 completion)
- ⏳ Not Started: 24 tasks (Error Handling, Polish, US3 post-MVP)

**MVP Scope** (43 tasks remaining for MVP):
- Phase 3 (US1): 10 tasks remaining
- Phase 4 (US2): 7 tasks remaining
- Phase 5 (US4): 6 tasks remaining
- Phase 6 (Error Handling): 10 tasks
- Phase 7 (Polish): 10 tasks

**Estimated MVP Completion**: After completing 43 remaining tasks above

**Post-MVP Enhancements**: 13 tasks (User Story 3)

**Parallel Opportunities**: 35 tasks marked [P] allow for concurrent execution

---

## Next Steps

1. **Complete User Story 1 Markdown Rendering** (T029-T030): Critical for MVP
2. **Add User Story 1 Tests** (T023-T025, T039-T040): Verify functionality
3. **Enhance Streaming Animation** (T045-T050): Complete User Story 2
4. **Polish Input UX** (T055-T059): Complete User Story 4
5. **Implement Error Handling** (T060-T069): Production-ready robustness
6. **Final Polish & Testing** (T070-T079): Launch-ready quality
7. **Post-MVP: Reasoning Display** (T080-T092): Future enhancement

**Immediate Priority**: Focus on completing US1 Markdown rendering (T029-T030) and tests (T023-T025) to achieve first functional milestone.
