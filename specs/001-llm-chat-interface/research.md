# Research & Technical Decisions: LLM Chat Interface

**Phase**: 0 (Research & Planning)
**Date**: 2025-11-26
**Purpose**: Document technology choices, best practices research, and architectural decisions for the LLM chat interface implementation.

## Overview

This document captures research findings and decisions made during the planning phase. Each decision includes rationale, alternatives considered, and references to best practices.

**Project Constraint**: No external UI component libraries (no Material UI, Chakra UI, etc.). All Svelte components must be custom-built. Infrastructure and utility libraries (parsing, streaming, syntax highlighting) are permitted.

---

## Decision 1: Frontend Framework - Svelte + SvelteKit

**Decision**: Use Svelte 4.x with SvelteKit for the frontend application.

**Rationale**:
1. **Learning Goal**: Explicitly requested by user to learn Svelte during this project
2. **Simplicity**: Svelte has minimal boilerplate compared to React/Vue, ideal for learning
3. **Performance**: Svelte compiles to vanilla JavaScript with no runtime overhead
4. **Reactivity**: Built-in reactivity system perfect for real-time chat UI updates
5. **Bundle Size**: Typically 30-40% smaller bundles than React equivalents

**Alternatives Considered**:
- **React + Next.js**: More mature ecosystem, but more complex (JSX, hooks, virtual DOM concepts)
- **Vue + Nuxt**: Good middle ground, but Svelte was specifically requested
- **Vanilla JS**: Too low-level, would distract from learning modern patterns

**Best Practices**:
- Use SvelteKit for routing and SSR capabilities
- Leverage Svelte stores for state management
- Component composition over prop drilling
- TypeScript for type safety

**References**:
- [Svelte Tutorial](https://svelte.dev/tutorial)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)

---

## Decision 2: Real-Time Streaming - Server-Sent Events (SSE)

**Decision**: Use Server-Sent Events (SSE) for real-time LLM response streaming with `eventsource-parser` library on backend.

**Rationale**:
1. **Simplicity**: HTTP-based, no complex WebSocket handshake
2. **Browser Support**: Native EventSource API on client, no client library needed
3. **Automatic Reconnection**: Browser handles reconnection automatically
4. **One-Way Communication**: Perfect for server→client streaming (LLM responses)
5. **Firewall Friendly**: Uses standard HTTP, no special ports/protocols

**Alternatives Considered**:
- **WebSockets**: Bidirectional, but overkill for one-way streaming. More complex setup
- **Long Polling**: Inefficient for continuous streaming, higher latency
- **gRPC Streams**: Requires Protobuf, too complex for learning project

**Best Practices**:
- Use `text/event-stream` content type
- Send heartbeat messages to keep connection alive (every 30s)
- Handle reconnection with `Last-Event-ID` header
- Close connections on client unmount (prevent memory leaks)

**Backend Library**: `eventsource-parser` for parsing SSE streams from LLM proxy

**References**:
- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [eventsource-parser npm](https://www.npmjs.com/package/eventsource-parser)

---

## Decision 3: Markdown Parsing - `marked` Library

**Decision**: Use `marked` library for Markdown parsing with AST rendering approach.

**Rationale**:
1. **Spec Requirement**: FR-017 mandates AST pattern for Markdown parsing
2. **Extensibility**: `marked` provides lexer/parser separation for AST access
3. **Performance**: Fast, battle-tested library (used by GitHub, npm)
4. **Size**: ~30KB minified, acceptable for bundle size target
5. **Constraint Compliance**: Parsing libraries are allowed (UI component libraries are not)

**Alternatives Considered**:
- **remark**: More modular (unified ecosystem), but more complex API for beginners
- **markdown-it**: Extensible plugin system, but heavier and more complex
- **Custom parser**: More learning, but `marked` is better for production quality

**AST Rendering Approach**:
```svelte
<!-- MarkdownRenderer.svelte -->
<script>
  import { marked } from 'marked';

  export let content;

  // Parse to tokens (AST)
  $: tokens = marked.lexer(content);

  // Render each token type
  function renderToken(token) {
    switch(token.type) {
      case 'heading': return `<h${token.depth}>${token.text}</h${token.depth}>`;
      case 'paragraph': return `<p>${token.text}</p>`;
      case 'code': return `<pre><code class="language-${token.lang}">${token.text}</code></pre>`;
      // ... other types
    }
  }
</script>

{#each tokens as token}
  {@html renderToken(token)}
{/each}
```

**Security Consideration**:
- Use `@html` directive carefully (XSS risk)
- Sanitize user-generated content if ever added
- LLM responses assumed safe (from trusted API)

**References**:
- [marked.js Documentation](https://marked.js.org/)
- [Marked Advanced Configuration](https://marked.js.org/using_advanced)

---

## Decision 4: Syntax Highlighting - Highlight.js

**Decision**: Use Highlight.js for code block syntax highlighting.

**Rationale**:
1. **Auto-Detection**: Can automatically detect language if not specified
2. **Wide Language Support**: 190+ languages available
3. **Modular**: Can load only needed languages (reduces bundle size)
4. **Integration**: Works well with `marked` via custom renderer
5. **Constraint Compliance**: Utility libraries are allowed

**Highlight.js vs Prism Comparison**:

| Feature | Highlight.js | Prism.js |
|---------|-------------|----------|
| Auto-detect language | ✅ Yes | ❌ No |
| Bundle size (core) | ~30KB all langs | ~2KB core + per-lang |
| Integration complexity | Simple | Simple |
| Language support | 190+ | 270+ |

**Decision**: **Highlight.js** - Auto-detection valuable for LLM responses where language may not always be specified.

**Usage Pattern**:
```svelte
<script>
  import hljs from 'highlight.js/lib/core';
  import javascript from 'highlight.js/lib/languages/javascript';
  import python from 'highlight.js/lib/languages/python';

  // Register only needed languages
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('python', python);

  function highlightCode(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    // Auto-detect if language not specified
    return hljs.highlightAuto(code).value;
  }
</script>
```

**References**:
- [Highlight.js Documentation](https://highlightjs.org/)
- [Highlight.js Language Guide](https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md)

---

## Decision 5: Backend Runtime - Node.js + Express

**Decision**: Use Node.js 20 LTS with Express 4.x for the backend API.

**Rationale**:
1. **JavaScript Everywhere**: Same language as frontend (TypeScript compiles to JS)
2. **SSE Support**: Excellent streaming support via res.write()
3. **Simplicity**: Express is minimal, easy to learn alongside Svelte
4. **Ecosystem**: npm has mature libraries for SSE (eventsource-parser)
5. **Performance**: Non-blocking I/O perfect for streaming workloads

**API Structure**:
```
POST /api/chat
- Body: { message: string, sessionId?: string }
- Response: text/event-stream
- Events: { type: 'chunk' | 'reasoning' | 'done' | 'error', data: any }

GET /health
- Response: { status: 'ok', timestamp: number }
```

**References**:
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## Decision 6: Testing Strategy - Vitest + Testing Library

**Decision**: Use Vitest for unit/integration testing, @testing-library/svelte for component tests, Playwright for E2E.

**Rationale**:
1. **Vitest**: Vite-native test runner, instant HMR, compatible with Svelte/SvelteKit
2. **@testing-library/svelte**: User-centric testing (test behavior, not implementation)
3. **Playwright**: Modern E2E framework, cross-browser, excellent dev experience
4. **Unified Stack**: All tools work seamlessly with Vite-based SvelteKit

**Testing Layers**:
```
1. Unit Tests (Vitest)
   - Svelte stores (conversation.ts, ui.ts)
   - Utility functions (markdown-parser.ts)
   - Backend services (llm.ts)

2. Component Tests (@testing-library/svelte)
   - MessageBubble: Renders user message correctly
   - LLMResponse: Handles streaming updates
   - MarkdownRenderer: Renders markdown correctly
   - MessageInput: Keyboard shortcuts (Enter, Shift+Enter)

3. Integration Tests (Vitest + Supertest)
   - Backend API endpoints
   - SSE streaming flow
   - LLM proxy integration

4. E2E Tests (Playwright)
   - Full chat flow: type message → see response
   - Streaming animation works correctly
   - Markdown rendering
   - Reasoning block expand/collapse
```

**TDD Workflow for Svelte Learning**:
```
1. Write component interface test
   test('MessageBubble renders user text', ...)

2. Implement component to pass test
   <script>export let text;</script>
   <div class="bubble">{text}</div>

3. Refine test for interactions
   test('MessageBubble shows timestamp on hover', ...)

4. Add interaction behavior
```

**References**:
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Svelte](https://testing-library.com/docs/svelte-testing-library/intro)
- [Playwright Documentation](https://playwright.dev/)

---

## Decision 7: TypeScript Configuration

**Decision**: Use TypeScript in strict mode for both frontend and backend.

**Rationale**:
1. **Type Safety**: Catch errors at compile time, especially API contracts
2. **Better DX**: Autocomplete, refactoring support in VS Code
3. **Shared Types**: Single source of truth for Message, Session types
4. **Learning**: TypeScript teaches better JavaScript habits

**Shared Types Pattern**:
```typescript
// shared/types.ts
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'llm';
  timestamp: number;
  status: 'pending' | 'streaming' | 'complete' | 'error';
}

export interface StreamChunk {
  type: 'chunk' | 'reasoning' | 'done' | 'error';
  content: string;
  messageId: string;
}
```

**References**:
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [SvelteKit TypeScript Setup](https://kit.svelte.dev/docs/typescript)

---

## Decision 8: State Management - Svelte Stores

**Decision**: Use Svelte's built-in writable stores for state management.

**Rationale**:
1. **Native Solution**: No external library needed
2. **Reactivity**: Store changes automatically trigger component updates
3. **Simplicity**: Easy to understand for Svelte beginners
4. **Composability**: Derived stores for computed values

**Store Architecture**:
```typescript
// stores/conversation.ts
import { writable, derived } from 'svelte/store';

export const messages = writable<Message[]>([]);
export const currentMessage = writable<string>('');

// Derived store (auto-computed)
export const hasMessages = derived(
  messages,
  $messages => $messages.length > 0
);

// stores/ui.ts
export const isThinking = writable(false);
export const isStreaming = writable(false);
```

**References**:
- [Svelte Stores Tutorial](https://svelte.dev/tutorial/writable-stores)

---

## Decision 9: Styling Approach - Scoped CSS + CSS Variables

**Decision**: Use Svelte's scoped CSS with global CSS variables for theming.

**Rationale**:
1. **Native Scoping**: Svelte auto-scopes component styles
2. **No External UI Libraries**: Meets project constraint
3. **Performance**: No runtime overhead, styles extracted to CSS files
4. **Simplicity**: Standard CSS, no new syntax to learn

**Pattern**:
```svelte
<!-- Component.svelte -->
<style>
  .bubble {
    background: var(--color-user-bubble);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
  }
</style>

<!-- app.css (global) -->
:root {
  --color-user-bubble: #007bff;
  --color-llm-text: #333;
  --radius-md: 12px;
  --spacing-md: 12px;
}
```

**References**:
- [Svelte Styling](https://svelte.dev/docs/svelte-components#style)

---

## Summary of Key Technologies

| Layer | Technology | Version | Purpose | External? |
|-------|-----------|---------|---------|-----------|
| Frontend Framework | Svelte + SvelteKit | 4.x | UI components and routing | ✅ Allowed (framework) |
| Backend Runtime | Node.js + Express | 20 LTS / 4.x | API server | ✅ Allowed (framework) |
| Language | TypeScript | 5.x | Type safety | ✅ Allowed (language) |
| SSE Streaming | eventsource-parser | Latest | Parse SSE on backend | ✅ Allowed (infrastructure) |
| Markdown Parser | marked | 11.x | Parse MD to AST | ✅ Allowed (utility) |
| Syntax Highlighting | Highlight.js | 11.x | Code block highlighting | ✅ Allowed (utility) |
| State | Svelte Stores | Native | Client state | ✅ Built-in |
| Testing (Unit) | Vitest | Latest | Test runner | ✅ Allowed (dev tool) |
| Testing (Component) | @testing-library/svelte | Latest | Component tests | ✅ Allowed (dev tool) |
| Testing (E2E) | Playwright | Latest | Browser automation | ✅ Allowed (dev tool) |
| Styling | Scoped CSS + Variables | Native | Component styling | ✅ Native |
| Linting | ESLint + Prettier | Latest | Code quality | ✅ Allowed (dev tool) |

**Constraint Compliance**:
- ❌ No external UI component libraries (Material UI, Chakra, Ant Design, etc.)
- ✅ All Svelte components custom-built
- ✅ Infrastructure/utility libraries allowed (parsing, streaming, testing)

---

## Open Questions & Future Research

*None at this stage - all technical decisions finalized for MVP.*

**For Future Enhancements** (post-MVP):
- **Session Persistence**: Research localStorage vs IndexedDB if multi-session needed
- **File Upload**: Research FormData + multipart streaming when implementing attachments
- **Offline Support**: Consider Service Workers for offline chat history
- **Internationalization**: Research svelte-i18n for Russian/English support

---

**Research Phase Complete** ✅

Next Phase: Generate data-model.md and contracts/