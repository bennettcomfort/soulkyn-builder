# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Soulkyn Builder is a Next.js 16 application for creating AI-powered character content (RPGs, Story Characters, Dynamic Lore Libraries, and World References). It uses a multi-provider AI architecture with support for Anthropic Claude, OpenAI-compatible endpoints, and Ollama.

## Development Commands

### Running the Development Server
```bash
npm run dev
```
Starts Next.js dev server on http://localhost:3000. Hot-reloading is enabled.

### Building for Production
```bash
npm run build
```
Compiles TypeScript and creates optimized production build.

### Running Production Build
```bash
npm run start
```
Runs the production server. Must run `npm run build` first.

## Architecture

### Multi-Provider AI System
The application uses a provider abstraction layer in `lib/ai.ts` that routes requests to different AI providers:

- **Anthropic** (`lib/providers/anthropic.ts`): Native Anthropic SDK with web search support
- **OpenAI-compatible** (`lib/providers/openai-compat.ts`): Generic OpenAI API format (OpenAI, LMStudio, xAI)
- **Ollama** (`lib/providers/ollama-native.ts`): Native Ollama API for proper thinking/streaming control

Provider selection is managed through `lib/settings.ts`, which persists to `data/settings.json`.

### Session-Based Content Creation
Sessions are the core data structure (defined in `lib/sessions.ts`):
- Each session represents one content creation project
- Sessions support multiple build modes: `interview`, `freeform`, `roughdraft`, `chat`
- Session data is stored as JSON files in `data/sessions/`
- Sessions track budget usage, draft content, and completion state

### Content Type System
Four content types defined in `lib/content-types.ts`:
- **RPG**: Role-playing games with 8-question interview flow
- **SC**: Story Characters with 6-question interview
- **DLL**: Dynamic Lore Libraries
- **WRL**: World References with intro/lore sections

Each type has:
- Character limits (managed by `lib/budget.ts`)
- Structured interview questions with options
- Section guides for draft creation
- Validation checklists

### Streaming Architecture
- Server-side streaming handled by `/app/api/stream/route.ts`
- Returns Server-Sent Events (SSE) format
- Supports thinking tokens (prefixed with `\x01`)
- Client components use `fetchCompletion()` helper for text accumulation
- Abort controllers manage cancellation

## Key Files and Patterns

### Data Storage
- `data/sessions/` - Session JSON files (one per project)
- `data/settings.json` - Provider configuration
- `data/pdf-cache/` - PDF.js worker initialization cache
- External reference files expected at `../Soulkyn Claude/Projects/` (MASTER_REFERENCE.md, CREATOR_ASSISTANT.md)

### API Routes
- `/api/stream` - SSE streaming endpoint for AI completions
- `/api/projects` - CRUD operations for sessions
- `/api/settings` - Provider configuration management
- `/api/models` - List available models from current provider
- `/api/pdf-init` - PDF.js worker initialization

### Page Routes
- `/` - Home page with project selector
- `/build/[sessionId]` - Main build session interface
- `/brainstorm` - Brainstorming tool
- `/images` - Image generation tool
- `/settings` - Provider configuration

### Component Architecture
- `BuildSession.tsx` - Main interview/review flow (non-chat modes)
- `ChatBuildSession.tsx` - Chat-based build mode
- `InterviewFlow.tsx` - Question/answer interview UI
- `DraftEditor.tsx` - Content draft editing with real-time preview
- `TypeStructureGuide.tsx` - Shows section guidelines and examples

## Important Implementation Details

### Budget System
Character limits are enforced per content type via `lib/budget.ts`:
- Visual budget bar shows green (< 75%), yellow (75-90%), red (90-100%), over (> 100%)
- Calculate with `calculateBudget(used, limit)`
- Get total limit with `getTotalLimit(type)`

### Tag Sets
Sessions include customizable tag sets for different content aspects:
- System tags (personality, traits)
- Behavior tags (speech patterns, actions)
- Stored in `session.tagSets` (migrated from older string format)

### Chat Examples
Each session can store 4 chat examples (700 chars each max) used for character training.

### External Dependencies
- The `notebooklm/` directory is a Git submodule for NotebookLM integration
- TypeScript strict mode is enabled
- Path alias `@/*` maps to project root

## Environment Setup

Required environment variable:
```bash
ANTHROPIC_API_KEY=sk-ant-...
```
Store in `.env.local` (gitignored). The app can also use other providers without API keys (Ollama, LMStudio).

## Next.js Configuration

`next.config.ts` marks packages as server-external:
- `@anthropic-ai/sdk`
- `openai`
- `fs`
- `path`

This prevents client-side bundling of server-only dependencies.

## State Management

No global state library. React hooks manage component state:
- Session loading/saving via fetch to `/api/projects`
- Debounced auto-save with `saveTimer` refs
- AbortController refs for canceling streams

## Working with Streaming

When implementing or debugging streaming:
1. Server streams through `ReadableStream<string>` from provider
2. `/api/stream` wraps in SSE format with `data: {...}\n\n`
3. Client reads SSE, accumulates text, ignores thinking tokens
4. Use `[DONE]` marker to signal completion
5. Always provide cleanup via AbortController

## External File References

The system expects these files to exist in `../Soulkyn Claude/Projects/`:
- `MASTER_REFERENCE.md` - Loaded via `loadMasterReference()`
- `CREATOR_ASSISTANT.md` - Loaded via `loadCreatorAssistant()`

These are injected into AI context when `useCreatorSystem: true`.
