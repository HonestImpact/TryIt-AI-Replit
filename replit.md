# replit.md

## Overview

"Noah" is a multi-agent AI system built with Next.js 15, TypeScript, and TailwindCSS, designed as a "Trust Recovery Protocol." Its core purpose is to foster genuine trust through honest interaction and collaborative problem-solving. The system features a conversational chat interface with artifact generation, integrating multiple AI agents for specialized tasks. It incorporates a sophisticated Retrieval-Augmented Generation (RAG) system using ChromaDB for vector storage and semantic search, supporting various LLM providers (Anthropic, OpenAI, Google, Mistral, Cohere) with environment-based model switching and task-specific optimization.

## Recent Changes

**October 5, 2025 - Dual-Artifact Flow Complete with Chat Truncation:**
- **Fixed dual-artifact handling**: Both Wanderer and Tinkerer artifacts now preserved and displayed
  - Wanderer's research artifact stored separately via `researchParsed` variable
  - Added `researchArtifact` field to ChatResponse interface for dual-artifact responses
  - Both artifacts saved to session storage and returned in API response
- **Implemented chat truncation for research**: Research shown (first 3 lines) + "*(Full research available in toolbox)*"
  - Followed by "🔧 **Built Tool:**" section with Tinkerer's output
  - Full artifacts downloadable in toolbox section
- **Broadened request detection**: Improved `analyzeRequest` to catch more research+build patterns
  - Added imperative research pattern: `/^(research|analyze|study|investigate|explore|examine)\s+[\w\s]+/`
  - Expanded building patterns to match "build a [adjective] tool" (e.g., "build a comparison tool")
  - Now correctly detects mixed requests like "Research blockchain scalability and build a comparison tool"
- **Test verification**: Strategy `noah_wanderer_tinkerer` creates both artifacts with proper chat display

**October 5, 2025 - Session Persistence, Timeout Fix, Web Search & Environment Configuration:**
- **Removed ALL hardcoded models/providers**: Created shared `env-config.ts` resolver for strict environment-based configuration
  - All LLM providers and models now exclusively use environment variables
  - Fail-fast error handling with descriptive messages when env vars missing
  - Zero hardcoded fallbacks - completely configurable via .env.local
- **Environment Configuration Architecture**:
  - `src/lib/providers/env-config.ts`: Single source of truth for getProvider(), getModelId(), getLLMConfig()
  - `src/lib/providers/provider-factory.ts`: Uses shared resolver, throws error on unknown providers
  - All agents (wanderer, practical, shared-resources) use consistent getModelId() calls
  - Type-safe with proper fail-fast behavior
- **Fixed critical artifact persistence bug**: Artifacts from previous sessions no longer appear after page refresh
- **Fixed hanging request bug**: Added Next.js route timeout configuration to prevent requests from hanging indefinitely
- **Added real-time web search capability**: Wanderer now uses Perplexity API for current information queries
- **Fixed safety filter false positive**: "analyze" no longer triggers adult content filter (was matching "anal" substring)
- **Session Management Overhaul**:
  - Frontend now stores sessionId in localStorage for persistence across refreshes
  - Backend accepts sessionId from request body instead of always generating from fingerprint
  - New random UUID-based session IDs generated on first visit or when localStorage is cleared
  - Challenge flow now properly maintains session continuity
- **Artifact Persistence**:
  - Artifacts correctly load from database on page refresh when sessionId exists
  - Session artifacts stay tied to their specific session throughout the user's journey
  - Clearing localStorage creates truly new sessions without showing old artifacts
- **Web Search Integration**:
  - Wanderer automatically detects queries needing current information (keywords: "current", "latest", "2025", "state of", etc.)
  - Uses Perplexity `sonar` model for fast, cost-effective search with grounding
  - Returns responses with citations from live web sources
- **Technical Details**:
  - `src/app/page.tsx`: Added localStorage session management and artifact loading on mount
  - `src/app/api/chat/route.ts`: 
    - Updated `initializeConversationState` to accept optional sessionId, generate random UUIDs when none provided
    - Added `maxDuration = 300` (5 minutes) and `dynamic = 'force-dynamic'` exports for proper Next.js timeout handling
    - Enhanced request analysis to detect current information needs
  - `src/lib/agents/wanderer-agent.ts`: Added Perplexity integration with automatic web search detection
  - `src/lib/agents/perplexity-search.ts`: New service for Perplexity API integration
  - `src/lib/safety/content-filter.ts`: Fixed false positive by using whole-word matching for explicit keywords

**October 3, 2025 - Persona & RAG Refinement:**
- Fixed RAG semantic matching: Lowered threshold from 0.3 → 0.25 for conversational queries ("Do you remember..." patterns)
- Rewrote video knowledge chunk with better keyword density - "video" queries now score 0.3-0.5 (was negative/filtered)
- Refined Noah's persona (src/lib/ai-config.ts): Restored original sophisticated voice with surgical fixes to prevent transactional question-mirroring and overly self-analytical meta-commentary
- Added explicit guidance: "Be naturally conversational - don't analyze or apologize for your own responses"
- Noah now sounds sophisticated, thoughtful, and naturally conversational (not performative or overly chatty)

## User Preferences

Preferred communication style: Simple, everyday language.

**Handling Architectural Limitations:**
When requests are beyond Noah's current architecture or technical capabilities, acknowledge this honestly with the following framework:
- Explain what is beyond current capabilities and why (reasonable technical explanation)
- Note: "If enough people are interested, Isak is willing to consider adding that kind of functionality, but for now, that is beyond me because [reason]"
- Avoid offering complex workarounds that fundamentally change the system architecture
- Be transparent about the constraints rather than always trying to build alternatives

## Noah's Persona Protection Protocol

**Location:** `src/lib/ai-config.ts` - `CHAT_SYSTEM_PROMPT`

**Core characteristics that NEVER change without explicit user approval:**
- Sophisticated, thoughtful, genuinely insightful
- Light whimsy - not taking himself too seriously
- Sometimes stunningly honest in ways that make people take a step back, sometimes even laugh
- Occasionally a bit snarky, without ever crossing the cruel line to sarcasm
- Tasteful, intelligent (witty) humor when appropriate
- Co-creator who honors skepticism, never positions users as needing rescue

**What Noah is NOT:**
- ❌ Performative or overly chatty
- ❌ Vulgar, low-brow, or crude
- ❌ Making meta-jokes about smoking/drinking/swearing
- ❌ Treating his programming or the user as the joke
- ❌ Overly self-analytical about his own responses

**Allowed without approval:** Surgical fixes to specific behavior issues (e.g., "stop mirroring questions back")
**Requires approval:** Wholesale personality rewrites, tone changes, or removing core characteristics

**When making changes:**
1. Read the current prompt first
2. Make minimal, targeted changes to fix specific issues
3. Preserve all core characteristics
4. Test that Noah still sounds like Noah
5. If uncertain, ask for approval before changing

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: TailwindCSS 4, custom CSS animations
- **UI/UX**: Story-driven Adaptive Narrative layout with a conversational interface, frosted glass cards, indigo-purple-pink gradient background, sequential chapter numbering for messages, real-time metrics (Steps Together, Artifacts Created).
- **Components**: Custom React components, real-time chat, FileActivityBanner for file operations, FileApprovalDialog, Files Saved section, Artifacts Gallery.
- **Build**: Turbopack

### Backend Architecture
- **API**: Next.js API routes
- **Multi-Agent System**: Wanderer (research), Practical Agent/Tinkerer (technical implementation), Boutique Intent Detector (tool detection).
- **Agent Orchestration**: Module-level caching, timeout management.
- **Provider Factory**: Dynamic LLM selection based on task.
- **Filesystem MCP Integration**: Transparent, user-approved file operations within sandboxed directories (`noah-tools/`, `noah-thinking/`, `noah-sessions/`, `noah-reports/`) with path validation and smart file naming.

### Memory & Knowledge Systems
- **MCP Memory Service**: `@modelcontextprotocol/server-memory` for persistent, cross-session memory using a JSON-based knowledge graph.
- **Memory Storage**: Entity-observation model with session-specific context retrieval (user preferences, conversation themes, tool results, challenge events, trust signals).
- **Vector Database**: ChromaDB for RAG, embeddings via OpenAI `text-embedding-3-small`.
- **Knowledge Service**: PostgreSQL for tool design patterns.
- **Context Enrichment**: Appends memory observations to system prompt.

### AI Provider Integration
- **Primary**: Anthropic Claude (Sonnet 4, Haiku).
- **Multi-Provider**: OpenAI, Google, Mistral, Cohere via AI SDK.
- **Task Optimization**: Model selection for research, conversation, deep building (e.g., GPT-4o for tool generation, Sonnet 4 for conversation).
- **Dynamic Switching**: Environment variables for model selection.

### Trust and Skepticism Features
- **Skeptic Mode**: Optional challenging of AI responses.
- **Trust Tracking**: Dynamic trust scoring.
- **Message Challenging**: User ability to challenge AI responses.
- **Transparent Reasoning**: Optional display of AI's decision-making process.

### Artifact System
- **Dynamic Generation**: Real-time tool and content creation.
- **Structured Output**: Title/content separation.
- **Session Management**: Persistence of artifacts across sessions in a "Your Toolbox" section.
- **Boutique Creative Tools**: Assumption Breaker (reframing assumptions), Time Telescope (multi-time horizon decision analysis), Energy Archaeology (personal energy pattern tracking), scientific calculator, Pomodoro timer, unit converter.

## External Dependencies

### AI Services
- **Anthropic**: Primary LLM provider.
- **OpenAI**: Embeddings and alternative LLM.
- **Google AI**: Alternative LLM.
- **Mistral**: Alternative LLM.
- **Cohere**: Alternative LLM.

### Vector Database
- **ChromaDB**: Self-hosted for RAG.

### Model Context Protocol (MCP)
- **Memory Server**: `@modelcontextprotocol/server-memory`.
- **Filesystem Server**: `@modelcontextprotocol/server-filesystem`.
- **SDK**: `@modelcontextprotocol/sdk` for client-server communication.

### Development Tools
- **Vercel**: Deployment.
- **ESLint**: Code linting.
- **Vitest**: Testing.
- **TSX**: TypeScript execution.

### Optional Integrations
- **Supabase**: Database (available, not actively used).
- **LangChain**: AI orchestration (available).