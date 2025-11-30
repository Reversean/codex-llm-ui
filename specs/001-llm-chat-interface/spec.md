# Feature Specification: LLM Chat Interface

**Feature Branch**: `001-llm-chat-interface`
**Created**: 2025-11-26
**Status**: Draft
**Input**: User description: "нужно реализовать тестовый проект, описанный здесь: https://codex.so/llm-ui"

## Clarifications

### Session 2025-11-26

- Q: What specific predefined prompts should be sent when the dialog opens? → A: No automatic prompts - user must initiate conversation manually
- Q: Should file attachment capability be included in the initial implementation or deferred as a future enhancement? → A: Basic placeholder only - show upload button UI but don't implement backend functionality yet

### Session 2025-11-30

- Q: Should requests be sent directly to LLM proxy from frontend or via backend? → A: Backend required - ai-proxy lacks CORS headers, requires protected API keys, uses custom headers that trigger preflight requests
- Q: What protocol should the backend use to stream ai-proxy NDJSON responses to the frontend? → A: Server-Sent Events (SSE)
- Q: Should conversation history persist across page reloads or remain in-memory only? → A: In-memory only (session cleared on page reload)
- Q: Which ai-proxy stream event types should frontend handle (text-delta, reasoning-delta, etc.)? → A: MVP: text-delta only. Post-MVP priority: add reasoning-delta and other event types
- Q: If SSE connection is lost mid-stream, what should happen to incomplete message? → A: Discard partial message and show error with retry (starts fresh)
- Q: How should system respond to ai-proxy 429 rate limit errors? → A: Similar to connection loss - discard partial message, display error message, provide retry button

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initiate Conversation with LLM (Priority: P1) 🎯 MVP

Users need to start a conversation with an LLM by sending text messages and receiving responses in a chat-style interface that clearly distinguishes between user input and AI output.

**Why this priority**: This is the core functionality without which the application cannot function. All other features depend on basic message exchange working.

**Independent Test**: User can open the interface, type a message, send it, and receive a visible response from the LLM. This delivers immediate value as a functional chat interface.

**Acceptance Scenarios**:

1. **Given** the chat interface is open, **When** the user types a message and submits it, **Then** the message appears right-aligned in a bubble on the screen
2. **Given** a user message has been sent, **When** the LLM processes the request, **Then** the response appears left-aligned without a background bubble
3. **Given** a user sends a message, **When** the LLM response contains Markdown formatting, **Then** the content is rendered with proper formatting (headers, lists, code blocks, etc.)

---

### User Story 2 - Experience Real-Time Streaming Responses (Priority: P2)

Users want to see LLM responses appear progressively in real-time as they are generated, rather than waiting for the entire response to complete, providing a more engaging and responsive experience.

**Why this priority**: Enhances user experience significantly by reducing perceived wait time and providing immediate feedback that processing is happening.

**Independent Test**: User sends a message and observes words appearing one-by-one or in small chunks as the LLM generates them, rather than the entire response appearing at once.

**Acceptance Scenarios**:

1. **Given** a user has sent a message, **When** the LLM begins generating a response, **Then** words appear progressively on screen with smooth animation
2. **Given** the response is streaming, **When** new text chunks arrive from the server, **Then** they are appended to the existing content with visible animation
3. **Given** a long response is being streamed, **When** the user scrolls, **Then** the interface remains stable and doesn't jump or flicker during content updates

---

### User Story 3 - Understand LLM Reasoning Process (Priority: Post-MVP)

Users want visibility into the LLM's "thinking" process, including when the model is processing and any reasoning steps it generates, allowing them to understand how responses are formulated.

**Why this priority**: Provides transparency and trust in the AI's process, especially valuable for complex queries. Deferred to post-MVP to keep initial implementation simple, but prioritized as first enhancement after MVP completion.

**Independent Test**: User sends a complex query and can see a "Thinking..." indicator followed by collapsible reasoning text that explains the LLM's thought process before the final answer.

**Acceptance Scenarios**:

1. **Given** a user sends a message, **When** the LLM begins processing, **Then** a "Thinking..." indicator with animation is displayed
2. **Given** the LLM generates reasoning text, **When** it appears below the thinking indicator, **Then** it is displayed in gray/muted color and is initially visible
3. **Given** reasoning text is displayed, **When** the user clicks a collapse arrow, **Then** the reasoning text is hidden from view
4. **Given** the LLM completes its response, **When** the final answer is generated, **Then** the "Thinking..." indicator is hidden
5. **Given** reasoning text is collapsed, **When** the user clicks the expand arrow, **Then** the reasoning text becomes visible again

---

### User Story 4 - Compose and Submit Messages Efficiently (Priority: P2)

Users want an intuitive and efficient message input experience with modern conveniences like keyboard shortcuts and auto-resizing input fields.

**Why this priority**: Significantly improves usability and matches user expectations from modern chat applications. Important for user satisfaction though not blocking basic functionality.

**Independent Test**: User can type multi-line messages that auto-expand, press Enter to send, and always see the input form even when scrolling through long conversations.

**Acceptance Scenarios**:

1. **Given** the user is typing a message, **When** the text exceeds one line, **Then** the input field automatically expands to show all text
2. **Given** the user has typed a message, **When** they press Enter (without Shift), **Then** the message is submitted
3. **Given** the user wants a new line, **When** they press Shift+Enter, **Then** a new line is added without submitting
4. **Given** the user is scrolling through conversation history, **When** they scroll down, **Then** the input form remains fixed at the bottom with a gradient overlay for visual separation
5. **Given** the input form is displayed, **When** the user sees an attach button, **Then** the button is visible as a placeholder UI element (clicking shows "Coming soon" message)
6. **Given** the user submits an empty message, **When** they try to send, **Then** the form shows validation feedback and prevents submission

---

### Edge Cases

- What happens when the SSE connection is lost mid-stream? System MUST discard incomplete partial message, display "Connection lost" error message, and provide retry button that initiates fresh request.
- How does the system respond to ai-proxy rate limiting (429 errors)? System MUST discard incomplete partial message (if any), display "Rate limit exceeded. Please try again." error message, and provide retry button.
- How does the system handle ai-proxy authentication errors (401, 403)? System MUST display appropriate error message indicating authentication/authorization failure without exposing sensitive details.
- How does the system handle extremely long responses that exceed memory limits? Implement pagination or truncation with a "show more" option.
- What happens when Markdown parsing encounters malformed syntax? Display the raw text with an error indicator rather than breaking the interface.
- How does the interface behave on slow connections? Show clear loading states and allow users to continue interacting with past messages.
- How does the system handle rapid consecutive messages? Queue them appropriately and indicate processing status for each.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display user messages right-aligned in bubble-style containers
- **FR-002**: System MUST display LLM responses left-aligned without background styling
- **FR-003**: System MUST parse LLM responses as Markdown and render appropriate formatting blocks
- **FR-004**: System MUST stream LLM responses in real-time, displaying content as it arrives from the server
- **FR-005**: System MUST animate incoming text word-by-word or in small chunks during streaming
- **FR-006**: System MUST handle text-delta events from ai-proxy /stream endpoint for MVP
- **FR-007**: [Post-MVP] System SHOULD display a "Thinking..." indicator with animation while the LLM is processing
- **FR-008**: [Post-MVP] System SHOULD show LLM reasoning text in a distinct visual style (gray/muted) when available
- **FR-009**: [Post-MVP] System SHOULD provide expand/collapse functionality for reasoning text sections
- **FR-010**: [Post-MVP] System SHOULD handle reasoning-delta and other event types from ai-proxy stream
- **FR-011**: System MUST provide a message input form fixed at the bottom of the interface
- **FR-012**: System MUST auto-resize the input field as users type multi-line messages
- **FR-013**: System MUST submit messages when users press Enter (without modifier keys)
- **FR-014**: System MUST insert new lines when users press Shift+Enter
- **FR-015**: System MUST display file attachment button UI as placeholder (backend functionality deferred to future enhancement)
- **FR-016**: System MUST validate user input and prevent submission of empty messages
- **FR-017**: System MUST display a gradient overlay on the input form when users scroll
- **FR-018**: System MUST use Abstract Syntax Tree (AST) pattern for parsing Markdown into structured blocks
- **FR-019**: System MUST implement both client-side and server-side components with backend acting as secure proxy to ai-proxy service
- **FR-020**: Backend MUST connect to ai-proxy service using API key (x-api-key header) stored securely in server environment configuration
- **FR-021**: Backend MUST proxy both synchronous (/generate endpoint) and streaming (/stream endpoint) requests to ai-proxy
- **FR-022**: Backend MUST use Server-Sent Events (SSE) to stream NDJSON responses from ai-proxy to frontend
- **FR-023**: Backend MUST handle ai-proxy authentication and rate limiting responses (401, 403, 429 status codes) and propagate errors to frontend
- **FR-024**: Frontend MUST communicate with backend API endpoints (not directly with ai-proxy)
- **FR-025**: Frontend MUST store conversation history in-memory only (no localStorage or sessionStorage persistence)
- **FR-026**: System MUST discard incomplete messages when SSE connection is lost mid-stream, display "Connection lost" error message, and provide retry button
- **FR-027**: System MUST discard incomplete messages when 429 rate limit error occurs, display "Rate limit exceeded. Please try again." error message, and provide retry button
- **FR-028**: System MUST display appropriate error messages for 401/403 authentication errors without exposing sensitive information

### Key Entities

- **Message**: Represents a single communication unit in the conversation
  - Content: The text/data of the message
  - Sender: User or LLM
  - Timestamp: When the message was created
  - Status: Pending, streaming, complete, or error
  - Formatting: Parsed Markdown structure for rendering

- **Conversation Session**: Represents a dialog exchange between user and LLM
  - Messages: Ordered collection of all messages in the session
  - State: Active, thinking, idle, or error

- **Reasoning Block** [Post-MVP]: Represents LLM's thought process output
  - Content: The reasoning text generated by the LLM
  - Visibility: Expanded or collapsed
  - Association: Linked to specific LLM response message

- **Markdown Block**: Structured representation of parsed Markdown content
  - Type: Paragraph, heading, list, code block, etc.
  - Content: The actual text or data
  - Formatting attributes: Style, nesting level, language (for code), etc.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully send a message and receive an LLM response within 5 seconds for standard queries (assuming normal network conditions)
- **SC-002**: 95% of Markdown formatting elements (headers, lists, code blocks, links, emphasis) render correctly in LLM responses
- **SC-003**: Streaming responses begin displaying within 1 second of message submission
- **SC-004**: Users can complete the full conversation flow (open dialog, send message, receive response, send follow-up) within 30 seconds on first use
- **SC-005**: The interface remains responsive (< 100ms interaction lag) during message streaming and rendering
- **SC-006**: Message input form auto-resizes correctly for messages up to 20 lines without layout issues
- **SC-007**: File attachment placeholder button is visible and clicking it shows appropriate "Coming soon" message
- **SC-008**: Zero critical rendering errors (interface breaking bugs) occur during normal usage patterns
- **SC-009**: [Post-MVP] Reasoning text expand/collapse actions complete within 200ms
- **SC-010**: The interface maintains design fidelity with provided mockup specifications (visual accuracy > 95%)

### Assumptions

- **Network Connectivity**: Users have stable internet connection with minimum 1 Mbps bandwidth
- **LLM Service Availability**: The LLM proxy service is operational and accessible with provided authentication token
- **Browser Compatibility**: Users are accessing the interface through modern web browsers (last 2 major versions of Chrome, Firefox, Safari, or Edge)
- **Markdown Complexity**: LLM responses use standard Markdown syntax without extensive nesting or exotic extensions
- **Session Management**: Single in-memory conversation session per user (history cleared on page reload, no localStorage/sessionStorage persistence required in MVP)
- **Authentication**: LLM service authentication is handled via API token in environment configuration (no user authentication required)
- **Localization**: Interface text is in Russian based on the project source, with potential for internationalization later
- **Accessibility**: Standard web accessibility practices are sufficient (WCAG 2.1 Level A as baseline)

### Dependencies

- **ai-proxy Service**: External ai-proxy service (github.com/slaveeks/ai-proxy) must be available with valid API key for x-api-key header authentication
- **ai-proxy Endpoints**: Both /generate (synchronous) and /stream (NDJSON streaming with Accept: application/x-ndjson) endpoints must be accessible
- **Markdown Parser Library**: Requires capability to parse Markdown into AST structure
- **Streaming Protocol**: Backend must use Server-Sent Events (SSE) to proxy NDJSON streaming responses from ai-proxy to frontend
- **Environment Configuration**: Secure server-side storage for ai-proxy API key (.env file or environment variables)