# Quickstart Guide: LLM Chat Interface

**Feature**: LLM Chat Interface with Real-Time Streaming
**Branch**: `feature/001-llm-chat-interface`
**Last Updated**: 2025-11-26

## Overview

This guide will help you set up and run the LLM Chat Interface locally. The application consists of:
- **Frontend**: Svelte + SvelteKit application (custom components, no UI libraries)
- **Backend**: Node.js + Express API with SSE streaming
- **Shared**: TypeScript types for type safety

**Learning Focus**: This project is designed to teach Svelte fundamentals through building a real-world chat application.

---

## Prerequisites

### Required Software

- **Node.js**: v20.x LTS or later ([Download](https://nodejs.org/))
- **npm**: v10.x or later (comes with Node.js)
- **Git**: For version control
- **VS Code**: Recommended editor ([Download](https://code.visualstudio.com/))

### Recommended VS Code Extensions

```
code --install-extension svelte.svelte-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
```

### Environment Requirements

- **LLM API Access**: You'll need an API key for the LLM service (e.g., OpenAI, Anthropic)
- **Operating System**: macOS, Linux, or Windows (with WSL2 recommended)
- **RAM**: Minimum 4GB available
- **Port Availability**: Ports 3000 (backend) and 5173 (frontend) should be free

---

## Project Setup

### 1. Clone Repository (or create new project)

```bash
# If starting fresh
mkdir llm-ui
cd llm-ui
git init
git checkout -b feature/001-llm-chat-interface
```

### 2. Initialize Project Structure

```bash
# Create project directories
mkdir -p backend/src/routes backend/src/services backend/src/types backend/tests/integration backend/tests/unit
mkdir -p frontend/src/routes frontend/src/lib/components frontend/src/lib/stores frontend/src/lib/services frontend/src/lib/types frontend/tests/unit/components frontend/tests/e2e
mkdir -p shared

# Create package.json files
cd backend && npm init -y
cd ../frontend && npm init -y
cd ..
```

### 3. Install Dependencies

#### Backend Dependencies

```bash
cd backend

# Production dependencies
npm install express cors dotenv eventsource-parser

# Development dependencies
npm install -D typescript @types/node @types/express @types/cors tsx nodemon vitest supertest @types/supertest
```

#### Frontend Dependencies

```bash
cd frontend

# SvelteKit project setup (if not using adapter-static)
npm create svelte@latest . # Select "Skeleton project", TypeScript, ESLint, Prettier

# Additional dependencies
npm install marked highlight.js

# Development dependencies (if not included from create-svelte)
npm install -D vitest @testing-library/svelte @testing-library/jest-dom playwright
```

### 4. Configure TypeScript

**Root `tsconfig.json`** (shared base):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true
  }
}
```

**Backend `tsconfig.json`**:
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "CommonJS",
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "tests"]
}
```

**Frontend** uses SvelteKit's generated `tsconfig.json`.

### 5. Create Environment Configuration

**Backend `.env`**:
```env
# Server configuration
PORT=3000
NODE_ENV=development

# LLM API configuration
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=your-api-key-here
LLM_MODEL=gpt-4

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Frontend `.env`**:
```env
# API endpoint
PUBLIC_API_URL=http://localhost:3000
```

**Create `.env.example`** (commit this, not `.env`):
```bash
# Backend
cp backend/.env backend/.env.example
# Replace actual values with placeholders in .env.example

# Frontend
cp frontend/.env frontend/.env.example
```

### 6. Update `.gitignore`

```gitignore
# Dependencies
node_modules/
.pnp/

# Environment
.env
.env.local

# Build outputs
dist/
build/
.svelte-kit/

# Testing
coverage/
.nyc_output/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

---

## Development Workflow

### Starting the Development Servers

#### Option 1: Manual (Two Terminals)

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

#### Option 2: Using concurrently (Recommended)

**Root `package.json`**:
```json
{
  "name": "llm-ui",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

Then run:
```bash
npm install
npm run dev
```

### Accessing the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health

---

## Project Scripts

### Backend Scripts

Add to `backend/package.json`:
```json
{
  "scripts": {
    "dev": "nodemon --watch src --ext ts --exec tsx src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

### Frontend Scripts

Add to `frontend/package.json`:
```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint src --ext .ts,.svelte",
    "format": "prettier --write \"src/**/*.{ts,svelte}\""
  }
}
```

---

## Building for Production

### Build Both Projects

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Run Production Build

```bash
# Backend
cd backend
npm start

# Frontend (preview)
cd frontend
npm run preview
```

---

## Testing

### Run All Tests

```bash
# Backend unit + integration tests
cd backend
npm test

# Frontend component tests
cd frontend
npm test

# Frontend E2E tests
npm run test:e2e
```

### Test-Driven Development (TDD) Workflow

Following the constitution's TDD requirement:

1. **Write Test First**:
```typescript
// frontend/tests/unit/components/MessageBubble.test.ts
import { render } from '@testing-library/svelte';
import MessageBubble from '$lib/components/MessageBubble.svelte';

test('renders user message text', () => {
  const { getByText } = render(MessageBubble, {
    props: { text: 'Hello world', sender: 'user' }
  });
  expect(getByText('Hello world')).toBeInTheDocument();
});
```

2. **Run Test (Should Fail)**:
```bash
npm test
# ❌ Test fails - component doesn't exist yet
```

3. **Implement Component**:
```svelte
<!-- frontend/src/lib/components/MessageBubble.svelte -->
<script lang="ts">
  export let text: string;
  export let sender: 'user' | 'llm';
</script>

<div class="message-bubble {sender}">
  {text}
</div>
```

4. **Run Test (Should Pass)**:
```bash
npm test
# ✅ Test passes
```

5. **Refactor** if needed, tests keep passing.

---

## Common Development Tasks

### Adding a New Svelte Component

1. Create test file: `frontend/tests/unit/components/NewComponent.test.ts`
2. Write failing test
3. Create component: `frontend/src/lib/components/NewComponent.svelte`
4. Implement until test passes
5. Add to parent component or page

### Adding a New API Endpoint

1. Define in OpenAPI spec: `specs/001-llm-chat-interface/contracts/chat-api.yaml`
2. Create test: `backend/tests/integration/new-endpoint.test.ts`
3. Implement route: `backend/src/routes/new-endpoint.ts`
4. Register in `backend/src/server.ts`
5. Update frontend API client: `frontend/src/lib/services/api.ts`

### Debugging

**Backend**:
```bash
# Enable debug logging
DEBUG=express:* npm run dev
```

**Frontend**:
- Open browser DevTools (F12)
- Check Console for errors
- Use Svelte DevTools extension
- Network tab for SSE streams

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>

# Or use different port in .env
PORT=3001
```

### TypeScript Errors

```bash
# Clear build cache
rm -rf dist/ .svelte-kit/ node_modules/.vite

# Reinstall dependencies
npm install
```

### SSE Streaming Not Working

1. Check CORS configuration in backend
2. Verify EventSource connection in browser Network tab
3. Ensure `Content-Type: text/event-stream` header is set
4. Check backend logs for streaming errors

### Tests Failing

```bash
# Clear test cache
npx vitest --clearCache

# Run tests with verbose output
npm test -- --reporter=verbose
```

---

## Learning Resources

### Svelte & SvelteKit
- [Svelte Tutorial](https://svelte.dev/tutorial) - Interactive lessons
- [SvelteKit Docs](https://kit.svelte.dev/docs) - Official documentation
- [Svelte Society](https://sveltesociety.dev/) - Community recipes and examples

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### Testing
- [Vitest Guide](https://vitest.dev/guide/)
- [Testing Library Svelte](https://testing-library.com/docs/svelte-testing-library/intro)
- [Playwright Docs](https://playwright.dev/docs/intro)

### Server-Sent Events
- [MDN: Using Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [HTML5 Rocks: SSE](https://www.html5rocks.com/en/tutorials/eventsource/basics/)

---

## Next Steps

After completing this setup:

1. **Generate Tasks**: Run `/speckit.tasks` to generate implementation tasks
2. **Start with MVP**: Implement User Story 1 (basic chat)
3. **Follow TDD**: Write tests first, then implement
4. **Learn Svelte**: Focus on reactivity, stores, and component composition
5. **Add Features**: Progressively add streaming, reasoning blocks, markdown

---

## Support

For questions or issues:
- Check [spec.md](./spec.md) for feature requirements
- Review [data-model.md](./data-model.md) for data structures
- Consult [research.md](./research.md) for technical decisions
- See [contracts/chat-api.yaml](./contracts/chat-api.yaml) for API documentation

---

**Setup Complete!** 🎉

You're now ready to start building the LLM Chat Interface. Happy coding and learning Svelte!