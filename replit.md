# replit.md

## Overview

This is a multi-agent AI system called "Noah" built with Next.js 15, TypeScript, and TailwindCSS. Noah functions as a "Trust Recovery Protocol" - an AI assistant designed to build genuine trust through honest interaction and collaborative problem-solving. The system features a conversational chat interface with artifact generation capabilities and integrates multiple AI agents for specialized tasks.

The application implements a sophisticated Retrieval-Augmented Generation (RAG) system using ChromaDB for vector storage and semantic search. It supports multiple LLM providers (Anthropic, OpenAI, Google, Mistral, Cohere) with environment-based model switching and task-specific optimization.

## Recent Changes

### Memory MCP Integration (October 2025)
- **Cross-Session Memory**: Integrated official @modelcontextprotocol/server-memory package for persistent memory across conversations
- **MCP SDK Client**: Implemented proper MCP SDK client using StdioClientTransport for reliable communication with memory server
- **Knowledge Graph Storage**: Memories stored as entities with observations in local JSON-based knowledge graph
- **Session-Specific Context**: Per-session memory retrieval with entity types (user_preference, conversation_theme, tool_result, challenge_event, trust_signal)
- **Context Enrichment**: ContextEnricher class appends memory observations to Noah's system prompt without overriding personality
- **Async Memory Storage**: Fire-and-forget observation storage after responses complete (zero performance impact on response times)
- **ObservationExtractor**: Automatic extraction of conversation themes, challenge events, trust signals, user preferences, and tool results
- **Resilient Storage**: Per-observation error handling ensures partial failures don't block subsequent observations
- **Graceful Degradation**: Service operates with fallback behavior if memory server unavailable
- **Shared Resources Integration**: Memory service initialized once, session context retrieved per-request
- **Storage Location**: Memories persisted in ./noah-memory-data/memory.json (configurable via MEMORY_FILE_PATH environment variable)

### Adaptive Narrative Structure Implementation (September 2025)
- **Complete UI Transformation**: Restructured entire interface to match Adaptive Narrative demo's story-driven layout and visual design
- **Header Design**: "Our collaboration, your way" tagline, Feedback/Skeptics Welcome icons with tooltips, functional Skeptic Mode toggle
- **Persona Selector**: ✨Collaborative Partner (active), Patient Teacher/Data Analyst/Tech Expert (disabled) - story-driven approach
- **Story Timeline Layout**: 2/3 width main area with unique sequential chapter numbering (Chapter 1, 2, 3...) for every message
- **Timeline Features**: Scrollable message history, gradient-coded user/assistant messages, integrated challenge buttons, embedded chat input
- **Collaboration Progress Sidebar**: Real-time Steps Together counter, Artifacts Created tracker, always-visible metrics
- **Artifacts Gallery**: Session-based toolbox displays all generated artifacts with individual downloads, agent attribution, timestamps
- **Data Visualizer**: Always-visible component showing most recent artifact code preview (first 500 chars) or fallback message
- **Placeholder Sections**: API Integration and Quick Tips (Coming Soon) for future features
- **Video Component**: Introduction video at bottom with controls, no autoplay
- **Visual Polish**: Indigo-purple-pink gradient background, frosted glass cards (backdrop-blur-sm), smooth transitions, 8px spacing grid
- **Hydration Fix**: Resolved SSR/client mismatch by initializing messages in state with static timestamp, updated on mount
- **Core Preservation**: ALL existing functionality intact - trust tracking, skeptic mode, challenges, streaming, artifacts, Noah's direct personality

### Session-Based Toolbox Implementation (September 2025)
- **Session Artifact Management**: Implemented session-based toolbox that accumulates all generated tools during conversation, preventing tool overwriting
- **Enhanced UI**: New "Your Toolbox" section displays all session artifacts with individual download capabilities, agent attribution, and timestamps
- **Cross-Agent Compatibility**: All agents (Noah, Tinkerer, Wanderer) now contribute artifacts to the shared session toolbox
- **API Enhancement**: Updated artifacts endpoint to return sessionArtifacts array while maintaining backward compatibility
- **User Experience**: Tools now show agent source, creation time, and maintain conversation flow after generation

### Performance Optimization (September 2025)
- **Major Performance Breakthrough**: Implemented task-specific LLM model selection achieving 83% faster tool generation (reduced from 28+ seconds to ~5 seconds)
- **Model Optimization**: GPT-4o for tool generation, Sonnet 4 for conversation, GPT-4o-mini for research
- **Environment Configuration**: Optimized .env.local with LLM_DEEPBUILD=openai, MODEL_ID_DEEPBUILD=gpt-4o

## User Preferences

Preferred communication style: Simple, everyday language.

## Development Framework

**MANDATORY**: Before any code changes, follow these protocols:
1. **Strategic Pause**: Read `.strategic-pause.md` and answer all questions
2. **Architecture First**: Follow `.architecture-first.md` decision process  
3. **Code Covenant**: Meet `.code-covenant.md` quality standards

These frameworks ensure we think strategically, not reactively, preserving Noah's integrity and preventing symptom-fixing that breaks existing functionality.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15 with App Router and TypeScript
- **Styling**: TailwindCSS 4 with custom CSS animations
- **UI Components**: Custom React components with real-time chat interface
- **State Management**: React hooks for local state management
- **Build Tool**: Turbopack for fast development and builds

### Backend Architecture
- **API Routes**: Next.js API routes in `/api` directory
- **Multi-Agent System**: Specialized agents for different task types:
  - Wanderer Agent: Research specialist with fast response times
  - Practical Agent (Tinkerer): Technical implementation specialist
- **Agent Orchestration**: Module-level caching and timeout management
- **Provider Factory**: Dynamic LLM provider selection based on task type

### Memory & Knowledge Systems
- **MCP Memory Service**: Model Context Protocol-based persistent memory using knowledge graph
- **Memory Storage**: Entity-observation model with session-specific context retrieval
- **Memory Tools**: create_entities, search_nodes, add_observations for memory management
- **Vector Database**: ChromaDB for persistent vector storage (stub implementation)
- **Embeddings**: OpenAI text-embedding-3-small model
- **Knowledge Service**: Tool knowledge service via PostgreSQL for design patterns
- **Storage**: Memory in `./noah-memory-data/`, vectors in `/chroma_data`

### AI Provider Integration
- **Primary Provider**: Anthropic Claude models (Sonnet 4, Haiku)
- **Multi-Provider Support**: OpenAI, Google, Mistral, Cohere via AI SDK
- **Task Optimization**: Different models for research vs. deep building tasks
- **Environment Configuration**: Dynamic model switching via environment variables

### Trust and Skepticism Features
- **Skeptic Mode**: Optional challenging mode for responses
- **Trust Level Tracking**: Dynamic trust scoring system
- **Message Challenging**: Users can challenge AI responses
- **Transparent Reasoning**: Optional reasoning display for AI decisions

### Artifact System
- **Dynamic Generation**: Real-time tool and content creation
- **Structured Output**: Title/content separation for generated artifacts
- **Session Management**: Artifact persistence across conversation sessions

## External Dependencies

### AI Services
- **Anthropic**: Primary LLM provider for conversation and specialized tasks
- **OpenAI**: Embedding generation and alternative LLM provider
- **Google AI**: Alternative LLM provider option
- **Mistral**: Alternative LLM provider option
- **Cohere**: Alternative LLM provider option

### Vector Database
- **ChromaDB**: Self-hosted vector database for RAG implementation
- **Configuration**: Configurable endpoint via CHROMA_URL environment variable

### Development Tools
- **Vercel**: Deployment platform with specific function configurations
- **ESLint**: Code linting with Next.js optimized rules
- **Vitest**: Testing framework with TypeScript support
- **TSX**: TypeScript execution for scripts

### Optional Integrations
- **Supabase**: Database integration (available but not actively used)
- **LangChain**: Advanced AI orchestration capabilities (available)

### Environment Variables
- **Model Selection**: LLM, LLM_DEFAULT, LLM_RESEARCH, LLM_DEEPBUILD
- **Model IDs**: MODEL_ID, LLM_DEFAULT_ID, LLM_RESEARCH_ID, LLM_DEEPBUILD_ID
- **RAG Configuration**: RAG_ENABLED, CHROMA_URL
- **Memory Configuration**: MEMORY_FILE_PATH (path to memory.json storage file)
- **API Keys**: Required for respective AI service providers

### Model Context Protocol (MCP)
- **Memory Server**: @modelcontextprotocol/server-memory for persistent cross-session memory
- **MCP SDK**: @modelcontextprotocol/sdk for client-server communication
- **Transport**: StdioClientTransport for spawning and communicating with memory server
- **Knowledge Graph**: Entity-relation-observation model for structured memory storage