---

description: "Task list for LLM Chat Interface implementation"
---

# Tasks: LLM Chat Interface

**Input**: Design documents from `/specs/001-llm-chat-interface/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/chat-api.yaml

**Tests**: Tests are included per the constitution (Principle I: Quality-First Development with TDD). Tests follow the learning-adapted TDD approach documented in plan.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

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

- [x] T001 Create project directory structure (backend/, frontend/, shared/)
- [x] T002 [P] Initialize backend Node.js project with TypeScript 5.x, Express 5.x, cors, dotenv, eventsource-parser
- [x] T003 [P] Initialize frontend SvelteKit project with TypeScript 5.x, Svelte 5.x, marked, highlight.js
- [x] T004 [P] Configure ESLint and Prettier for both backend and frontend
- [x] T005 [P] Setup Vitest for backend unit/integration tests in backend/tests/
- [x] T006 [P] Setup Vitest + @testing-library/svelte for frontend component tests in frontend/tests/
- [x] T007 [P] Setup Playwright for E2E tests in frontend/tests/e2e/
- [x] T008 Create shared/types.ts with TypeScript interfaces (Message, ConversationSession, ReasoningBlock, StreamChunk)
- [x] T009 Create .env.example with LLM_API_URL, LLM_API_TOKEN, PORT placeholders
- [x] T010 [P] Configure TypeScript strict mode for both backend and frontend
- [x] T011 [P] Setup global CSS variables in frontend/src/app.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T012 Create backend/src/server.ts with Express app initialization and CORS configuration
- [x] T013 [P] Implement backend/src/routes/health.ts with GET /health endpoint
- [x] T014 [P] Create backend/src/services/llm.ts skeleton for LLM proxy client (SSE streaming)
- [x] T015 [P] Create frontend/src/lib/stores/conversation.ts with Svelte writable store for messages array
- [x] T016 [P] Create frontend/src/lib/stores/ui.ts with stores for isThinking, isStreaming, errorMessage
- [x] T017 [P] Create frontend/src/lib/services/api.ts skeleton for API client (fetch + SSE handling)
- [x] T018 Setup backend error handling middleware in backend/src/server.ts
- [x] T019 Setup environment configuration loading in backend/src/server.ts using dotenv
- [x] T020 Verify health endpoint returns 200 OK (run backend, curl http://localhost:3000/health)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Initiate Conversation with LLM (Priority: P1) 🎯 MVP

**Goal**: Users can open the interface, type a message, send it, and receive a visible response from the LLM with Markdown formatting

**Independent Test**: Open interface, type "Hello", press Enter, see message appear right-aligned in bubble, see LLM response left-aligned with formatted text

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (TDD)**

- [ ] T021 [P] [US1] Component test for MessageBubble: renders user text, right-aligned, bubble styling in frontend/tests/unit/components/MessageBubble.test.ts
- [ ] T022 [P] [US1] Component test for LLMResponse: renders LLM text, left-aligned, no bubble in frontend/tests/unit/components/LLMResponse.test.ts
- [ ] T023 [P] [US1] Component test for MarkdownRenderer: renders headers, lists, code blocks in frontend/tests/unit/components/MarkdownRenderer.test.ts
- [ ] T024 [P] [US1] Component test for MessageInput: renders input form, submit on Enter in frontend/tests/unit/components/MessageInput.test.ts
- [ ] T025 [P] [US1] Integration test for POST /api/chat: validates request body, returns SSE stream in backend/tests/integration/chat.test.ts
- [ ] T026 [P] [US1] Store test for conversation store: addMessage, updateMessage functions in frontend/tests/unit/stores/conversation.test.ts

### Implementation for User Story 1

- [ ] T027 [P] [US1] Create frontend/src/lib/components/MessageBubble.svelte (user message, right-aligned, bubble styling)
- [ ] T028 [P] [US1] Create frontend/src/lib/components/LLMResponse.svelte (LLM message, left-aligned, no bubble)
- [ ] T029 [P] [US1] Create frontend/src/lib/services/markdown-parser.ts using marked library to parse Markdown to AST
- [ ] T030 [US1] Create frontend/src/lib/components/MarkdownRenderer.svelte with AST rendering (headers, paragraphs, lists, code blocks using highlight.js)
- [ ] T031 [US1] Create frontend/src/lib/components/MessageInput.svelte (textarea, auto-resize, Enter to submit, validation)
- [ ] T032 [US1] Create frontend/src/lib/components/MessageList.svelte (scrollable container, renders MessageBubble and LLMResponse)
- [ ] T033 [US1] Implement backend/src/routes/chat.ts with POST /api/chat endpoint (validate input, return 400 for empty)
- [ ] T034 [US1] Implement backend/src/services/llm.ts LLM proxy client (fetch LLM API, parse SSE response using eventsource-parser)
- [ ] T035 [US1] Connect backend chat route to LLM service, stream chunks to client via SSE (text/event-stream)
- [ ] T036 [US1] Implement frontend/src/lib/services/api.ts sendMessage function (POST /api/chat, handle SSE EventSource)
- [ ] T037 [US1] Wire conversation store functions (addMessage, updateMessage, appendToMessage) in frontend/src/lib/stores/conversation.ts
- [ ] T038 [US1] Create frontend/src/lib/components/ChatContainer.svelte (main layout, MessageList + MessageInput)
- [ ] T039 [US1] Implement frontend/src/routes/+page.svelte (route component, use ChatContainer, subscribe to stores)
- [ ] T040 [US1] Add input validation in MessageInput: prevent empty message submission (FR-015)
- [ ] T041 [US1] Add error handling in api.ts: display error message if LLM connection fails
- [ ] T042 [US1] Run all User Story 1 tests and verify they pass

**Checkpoint**: At this point, User Story 1 should be fully functional - can send message and receive formatted LLM response

---

## Phase 4: User Story 2 - Experience Real-Time Streaming Responses (Priority: P2)

**Goal**: Users see LLM responses appear progressively word-by-word as they are generated

**Independent Test**: Send message "Explain JavaScript in 100 words", observe words appearing progressively with smooth animation rather than entire response at once

### Tests for User Story 2

- [ ] T043 [P] [US2] Component test for LLMResponse: verify content updates trigger smooth animation in frontend/tests/unit/components/LLMResponse.test.ts
- [ ] T044 [P] [US2] Integration test for SSE streaming: verify chunks arrive sequentially and are appended in backend/tests/integration/chat.test.ts
- [ ] T045 [P] [US2] E2E test for streaming animation: send message, verify progressive text appearance in frontend/tests/e2e/chat-flow.spec.ts

### Implementation for User Story 2

- [ ] T046 [P] [US2] Add streaming status to Message interface in shared/types.ts (status: 'streaming')
- [ ] T047 [US2] Update LLMResponse.svelte to animate new content with CSS transition (FR-005)
- [ ] T048 [US2] Update api.ts sendMessage to handle SSE chunk events, append to message content in real-time
- [ ] T049 [US2] Update conversation store to support appendToMessage for streaming chunks
- [ ] T050 [US2] Add scroll stability logic to MessageList.svelte: prevent jumps during streaming (FR-006 acceptance 3)
- [ ] T051 [US2] Update backend chat.ts to send 'chunk' events incrementally (simulate word-by-word if needed)
- [ ] T052 [US2] Update ui store: set isStreaming=true when stream starts, false when done
- [ ] T053 [US2] Test streaming with long response (200+ words), verify smooth animation and stable scrolling
- [ ] T054 [US2] Run all User Story 2 tests and verify they pass

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - basic chat with streaming animation

---

## Phase 5: User Story 3 - Understand LLM Reasoning Process (Priority: P3)

**Goal**: Users can see "Thinking..." indicator during processing and view/collapse reasoning text explaining LLM's thought process

**Independent Test**: Send complex query, see "Thinking..." indicator with animation, see reasoning text in gray/muted color, click collapse arrow to hide reasoning, click expand to show again

### Tests for User Story 3

- [ ] T055 [P] [US3] Component test for ThinkingIndicator: renders animation, hides when complete in frontend/tests/unit/components/ThinkingIndicator.test.ts
- [ ] T056 [P] [US3] Component test for ReasoningBlock: renders reasoning text, expand/collapse functionality in frontend/tests/unit/components/ReasoningBlock.test.ts
- [ ] T057 [P] [US3] Integration test for reasoning chunks: verify 'reasoning' chunk type handled separately in backend/tests/integration/chat.test.ts

### Implementation for User Story 3

- [ ] T058 [P] [US3] Create frontend/src/lib/components/ThinkingIndicator.svelte (animated "Thinking..." indicator)
- [ ] T059 [P] [US3] Create frontend/src/lib/components/ReasoningBlock.svelte (collapsible reasoning text, gray styling, expand/collapse arrow)
- [ ] T060 [US3] Update Message interface in shared/types.ts to include optional reasoning field
- [ ] T061 [US3] Update backend llm.ts to detect and separate reasoning chunks from content chunks
- [ ] T062 [US3] Update backend chat.ts to emit 'reasoning' event type for reasoning chunks (ChunkType: 'reasoning')
- [ ] T063 [US3] Update frontend api.ts to handle 'reasoning' chunk type, accumulate separately from content
- [ ] T064 [US3] Update conversation store to support reasoning block in message (reasoning: { content, isExpanded })
- [ ] T065 [US3] Update LLMResponse.svelte to render ReasoningBlock component if message.reasoning exists
- [ ] T066 [US3] Update ui store: set isThinking=true when request sent, false when first chunk arrives
- [ ] T067 [US3] Update ChatContainer.svelte to show ThinkingIndicator when isThinking=true (FR-006)
- [ ] T068 [US3] Hide ThinkingIndicator when LLM response starts (FR-009)
- [ ] T069 [US3] Verify reasoning expand/collapse completes within 200ms (SC-009)
- [ ] T070 [US3] Run all User Story 3 tests and verify they pass

**Checkpoint**: All core user stories (1, 2, 3) now functional - chat with streaming and reasoning visibility

---

## Phase 6: User Story 4 - Compose and Submit Messages Efficiently (Priority: P2)

**Goal**: Users have intuitive message input with auto-resize, keyboard shortcuts (Enter/Shift+Enter), fixed bottom positioning, and placeholder attach button

**Independent Test**: Type multi-line message (4+ lines), verify input auto-expands; press Enter to send; press Shift+Enter for new line; scroll conversation, verify input stays fixed at bottom; see attach button (shows "Coming soon" on click)

### Tests for User Story 4

- [ ] T071 [P] [US4] Component test for MessageInput: auto-resize on multi-line input in frontend/tests/unit/components/MessageInput.test.ts
- [ ] T072 [P] [US4] Component test for MessageInput: Enter submits, Shift+Enter adds new line in frontend/tests/unit/components/MessageInput.test.ts
- [ ] T073 [P] [US4] Component test for AttachButton: renders button, shows "Coming soon" message on click in frontend/tests/unit/components/AttachButton.test.ts
- [ ] T074 [P] [US4] E2E test for input form: fixed bottom position, gradient overlay on scroll in frontend/tests/e2e/chat-flow.spec.ts

### Implementation for User Story 4

- [ ] T075 [P] [US4] Update MessageInput.svelte to auto-resize textarea based on content height (FR-011)
- [ ] T076 [US4] Add keyboard event handlers to MessageInput: Enter submits (FR-012), Shift+Enter adds new line (FR-013)
- [ ] T077 [US4] Add empty message validation to MessageInput: prevent submission of whitespace-only (FR-015)
- [ ] T078 [US4] Create frontend/src/lib/components/AttachButton.svelte (placeholder UI, shows "Coming soon" alert on click per FR-014)
- [ ] T079 [US4] Add AttachButton to MessageInput.svelte layout
- [ ] T080 [US4] Update ChatContainer.svelte to fix MessageInput at bottom with CSS position: sticky/fixed
- [ ] T081 [US4] Add gradient overlay to MessageInput when scrolling (FR-016)
- [ ] T082 [US4] Test auto-resize with 20-line message, verify no layout issues (SC-006)
- [ ] T083 [US4] Test interaction lag during message typing, verify < 100ms (SC-005)
- [ ] T084 [US4] Run all User Story 4 tests and verify they pass

**Checkpoint**: All user stories (1-4) complete - full MVP chat interface with all core features

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, quality assurance, documentation

- [ ] T085 [P] Create backend/README.md with setup instructions, API documentation
- [ ] T086 [P] Create frontend/README.md with setup instructions, component architecture
- [ ] T087 [P] Verify quickstart.md matches actual setup steps, update if needed
- [ ] T088 [P] Add error handling for LLM connection loss mid-stream (edge case from spec.md)
- [ ] T089 [P] Add error handling for malformed Markdown syntax (edge case from spec.md)
- [ ] T090 [P] Add loading states for slow connections (edge case from spec.md)
- [ ] T091 [P] Test rapid consecutive messages, verify queue handling (edge case from spec.md)
- [ ] T092 Run Lighthouse CI on frontend, verify FCP < 1.5s, TTI < 3.5s (SC-004, plan.md performance goals)
- [ ] T093 [P] Run bundle analyzer, verify frontend bundle < 500KB gzipped (plan.md constraint)
- [ ] T094 [P] Add API response time logging to backend for performance monitoring
- [ ] T095 Verify all 10 success criteria (SC-001 through SC-010) are met
- [ ] T096 [P] Security review: validate input sanitization, environment variable handling, CORS configuration
- [ ] T097 [P] Code cleanup: remove console.logs, unused imports, TODO comments
- [ ] T098 Final E2E test: complete conversation flow within 30 seconds (SC-004)
- [ ] T099 Visual QA: verify design fidelity > 95% against mockup specs (SC-010)
- [ ] T100 Run all tests across backend, frontend, E2E - verify 100% pass rate

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational (Phase 2) completion
  - User Story 1 (Phase 3): Can start after Foundational
  - User Story 2 (Phase 4): Can start after Foundational (enhances US1 but independently testable)
  - User Story 3 (Phase 5): Can start after Foundational (adds to US1/US2 but independently testable)
  - User Story 4 (Phase 6): Can start after Foundational (enhances US1 input but independently testable)
- **Polish (Phase 7)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: MVP - MUST complete first, no dependencies on other stories
- **User Story 2 (P2)**: Enhances US1 streaming - Can implement after US1 or in parallel (different components)
- **User Story 3 (P3)**: Adds reasoning visibility - Can implement after US1 or in parallel (different components)
- **User Story 4 (P2)**: Improves input UX - Can implement after US1 or in parallel (different components)

### Within Each User Story

- Tests (Phase X) MUST be written FIRST and FAIL before implementation
- Models/stores before services
- Services before components
- Base components before integration components
- Story complete before marking done

### Parallel Opportunities

- **Setup Phase**: T002-T007, T010-T011 can all run in parallel (different projects/configs)
- **Foundational Phase**: T013-T017 can all run in parallel (different files)
- **User Story Tests**: All tests within a story marked [P] can run in parallel (T021-T026, T043-T045, etc.)
- **User Story Models/Components**: Components marked [P] within story can run in parallel (T027-T029, T046-T047, etc.)
- **User Stories Themselves**: After Foundational, US2, US3, US4 can all be worked in parallel (different components/files)
- **Polish Phase**: T085-T091, T093-T094, T096-T097 can run in parallel (different areas)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: T021 "Component test for MessageBubble"
Task: T022 "Component test for LLMResponse"
Task: T023 "Component test for MarkdownRenderer"
Task: T024 "Component test for MessageInput"
Task: T025 "Integration test for POST /api/chat"
Task: T026 "Store test for conversation store"

# Verify all tests FAIL (TDD red phase)

# Launch all base components for User Story 1 together:
Task: T027 "Create MessageBubble.svelte"
Task: T028 "Create LLMResponse.svelte"
Task: T029 "Create markdown-parser.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - RECOMMENDED FOR LEARNING

1. Complete Phase 1: Setup (T001-T011)
2. Complete Phase 2: Foundational (T012-T020) - CRITICAL CHECKPOINT
3. Complete Phase 3: User Story 1 (T021-T042)
4. **STOP and VALIDATE**: Test US1 independently - send message, receive formatted response
5. Deploy/demo MVP if ready
6. Add User Story 2 for streaming animation
7. Add User Story 3 for reasoning visibility
8. Add User Story 4 for enhanced input UX

### Incremental Delivery (All User Stories)

1. Complete Setup + Foundational → Foundation ready (20 tasks)
2. Add User Story 1 → Test independently → MVP ready! (22 tasks)
3. Add User Story 2 → Test independently → Streaming works (12 tasks)
4. Add User Story 3 → Test independently → Reasoning visible (16 tasks)
5. Add User Story 4 → Test independently → Input UX polished (14 tasks)
6. Polish phase → Production ready (16 tasks)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy (if multiple developers)

With 2-3 developers:

1. Team completes Setup + Foundational together (T001-T020)
2. Once Foundational is done:
   - Developer A: User Story 1 (T021-T042) - MVP core
   - Developer B: User Story 4 (T071-T084) - Can start in parallel, different files
3. After US1 complete:
   - Developer A: User Story 2 (T043-T054) - Streaming enhancement
   - Developer B: User Story 3 (T055-T070) - Reasoning feature
4. Team: Polish phase together (T085-T100)

---

## Notes

- **TDD Approach**: All tests written FIRST (learning-adapted TDD per plan.md)
- **[P] tasks**: Different files, no dependencies, safe for parallel execution
- **[Story] labels**: Map tasks to user stories for traceability and independent testing
- **Checkpoints**: Stop after each user story to validate independently
- **Commit Strategy**: Commit after each task or logical group (e.g., all tests for a story)
- **Learning Focus**: Comments in code should explain Svelte concepts (reactivity, stores, lifecycle)
- **Performance**: Monitor bundle size, test response times throughout implementation
- **Security**: Validate input at boundaries, handle environment variables securely

---

## Summary

- **Total Tasks**: 100 tasks
- **User Story 1 (MVP)**: 22 tasks (T021-T042)
- **User Story 2 (Streaming)**: 12 tasks (T043-T054)
- **User Story 3 (Reasoning)**: 16 tasks (T055-T070)
- **User Story 4 (Input UX)**: 14 tasks (T071-T084)
- **Setup + Foundation**: 20 tasks (T001-T020)
- **Polish**: 16 tasks (T085-T100)
- **Parallel Opportunities**: ~40 tasks can run in parallel (marked with [P])
- **Independent Tests**: Each user story has clear test criteria for validation
- **MVP Scope**: Phases 1-3 (42 tasks) deliver functional chat interface

**Next Step**: Start with Phase 1 (Setup) - T001: Create project directory structure