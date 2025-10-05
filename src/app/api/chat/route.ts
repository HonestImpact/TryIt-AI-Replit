import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { AI_CONFIG } from '@/lib/ai-config';
import { createLogger } from '@/lib/logger';
import { ArtifactService } from '@/lib/artifact-service';
import { withLogging, LoggingContext } from '@/lib/logging-middleware';
import { createLLMProvider } from '@/lib/providers/provider-factory';
import { WandererAgent } from '@/lib/agents/wanderer-agent';
import { PracticalAgent } from '@/lib/agents/practical-agent';
import { sharedResourceManager, type AgentSharedResources } from '@/lib/agents/shared-resources';
import type { ChatMessage } from '@/lib/agents/types';
import { analyticsService } from '@/lib/analytics';
import { analyticsPool } from '@/lib/analytics/connection-pool';
import { NoahSafetyService } from '@/lib/safety';
import { ContextEnricher } from '@/lib/memory/context-enricher';
import { ObservationExtractor } from '@/lib/memory/observation-extractor';
import { mcpFilesystemService } from '@/lib/filesystem/mcp-filesystem-service';
import { FileNamingStrategy } from '@/lib/filesystem/naming-strategy';
import type { FileOperation } from '@/lib/filesystem/types';
import { boutiqueTools } from '@/lib/tools/boutique-tools';
import { BoutiqueIntentDetector } from '@/lib/tools/boutique-intent-detector';
import { BOUTIQUE_TEMPLATES } from '@/lib/tools/boutique-templates';

const logger = createLogger('noah-chat');

/**
 * Concise prompt for Noah's direct tool generation - optimized for speed and efficiency
 */
function getToolGenerationPrompt(): string {
  return `You are Noah, creating functional tools and code efficiently.

Create tools using this exact format:
TITLE: [Tool name]
TOOL:
[Complete code - adapt format to the request]

Guidelines:
- For web tools: Use HTML with embedded CSS and JavaScript
- For APIs/backend: Use appropriate language (Node.js, Express, Python, etc.)
- For scripts: Use the most suitable language for the task
- Modern, clean code without excessive comments
- Focus on core functionality requested
- Include all necessary imports/dependencies

Keep tools concise but fully functional.`;
}

// 🚀 MODULE-LEVEL AGENT CACHING - Initialize ONCE, reuse forever
let wandererInstance: WandererAgent | null = null;
let tinkererInstance: PracticalAgent | null = null;
let sharedResourcesCache: AgentSharedResources | null = null;
let agentInitializationPromise: Promise<void> | null = null;

// Optimized timeout configuration for production
const NOAH_TIMEOUT = 45000; // 45 seconds for Noah direct responses
const WANDERER_TIMEOUT = 30000; // 30 seconds for fast research (Haiku)
const TINKERER_TIMEOUT = 60000; // 60 seconds for deep building (Sonnet 4)

// Session-based artifact storage (simple in-memory for MVP)
const sessionArtifacts = new Map<string, Array<{
  title: string;
  content: string;
  timestamp: number;
  agent: string;
  id: string;
}>>();

interface ChatResponse {
  content: string;
  status?: string;
  agent?: string;
  agentStrategy?: string;
  artifact?: {
    title: string;
    content: string;
  };
  // Session-scoped artifacts for accumulated toolbox
  sessionArtifacts?: Array<{
    title: string;
    content: string;
    timestamp: number;
    agent: string;
    id: string;
  }>;
}

interface ConversationState {
  sessionId: string | null;
  conversationId: string | null;
  messageSequence: number;
  startTime: number;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  agent: string;
  capabilities: string[];
  model: string;
  avg_response_time: string;
}

/**
 * Timeout wrapper for async operations
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Noah's simple decision process - like a human brain would think
 * 1. Can I do this quickly and easily? → Do it!
 * 2. Too complex for me? → Delegate appropriately  
 */
function analyzeRequest(content: string): {
  needsResearch: boolean;
  needsBuilding: boolean;
  confidence: number;
  reasoning: string;
  isAmbiguous?: boolean;
} {
  const contentLower = content.toLowerCase();

  // Check for negations and informational queries FIRST (NOT tool requests)
  const isNegatedOrInformational = [
    'don\'t build', 'do not build', 'won\'t build', 'should not build',
    'shouldn\'t build', 'can\'t build', 'cannot build',
    'what is', 'what are', 'which tool', 'best tool for',
    'recommend a tool', 'suggest a tool', 'tell me about',
    'build trust', 'build rapport', 'build relationships', 'build confidence'
  ].some(pattern => contentLower.includes(pattern));

  // Flexible regex patterns for tool-building requests
  // Allow optional words between imperative verb (build/create/make/generate) and artifact noun (tool/interactive)
  const buildToolPatterns = [
    /(build|create|make|generate)\s+(a\s+|an\s+|me\s+a\s+|me\s+an\s+)?tool/,  // build/create/make [me] a tool
    /(build|create|make|generate)\s+.{0,30}?\s*interactive/,  // build/create/make ... interactive (within 30 chars)
    /(build|create|make|generate)\s+.{0,20}?\s*tool\s+(that|for|to)/, // build ... tool that/for/to
  ];

  // Things Noah can do quickly and easily (conversational, not tools)
  const quickAndEasy = [
    // Simple conversation
    'how to', 'explain', 'help me understand', 'what is', 'tell me about',
    
    // Quick tools Noah loves making (when NOT prefixed with "build/create/make")
    'calculator', 'timer', 'converter', 'counter', 'stopwatch', 'clock',
    'password generator', 'random generator', 'color picker', 'notepad',
    
    // Text-based conversational responses (when NOT asking to build a tool)
    'summary', 'advice', 'tips', 'steps', 'instructions'
  ];

  // Only delegate for genuinely tough stuff
  const needsWanderer = [
    'research the latest', 'research current', 'market analysis', 
    'industry trends', 'comprehensive study', 'latest trends in'
  ];

  const needsTinkerer = [
    'react component', 'vue component', 'angular component',
    'interactive dashboard', 'data visualization', 'full application',
    'database integration', 'api integration', 'complex interface'
  ];

  // Check for tool-building requests using flexible regex patterns
  // But exclude if it's negated or informational
  const isToolRequest = !isNegatedOrInformational && 
    buildToolPatterns.some(pattern => pattern.test(contentLower));
  
  // Can Noah handle this quickly and easily?
  const canNoahDoThis = quickAndEasy.some(keyword => contentLower.includes(keyword));
  
  // Detect research-driven tool requests (tools that need research data)
  const researchDrivenToolKeywords = [
    'based on research', 'research-based', 'using research', 'from research',
    'based on your research', 'research insights', 'research findings',
    'analyze and', 'gather insights', 'find information about'
  ];
  // Match "top ten/best/list of [adjective/noun]" patterns that typically need research
  const researchDrivenToolRegex = /(?:top ten|top \d+|best|list of) .{0,30}(reasons|ways|tips|insights|facts|benefits|features|advantages|methods|strategies|techniques|ideas|examples)/;
  
  const isResearchDrivenTool = isToolRequest && (
    researchDrivenToolKeywords.some(keyword => contentLower.includes(keyword)) ||
    researchDrivenToolRegex.test(contentLower)
  );
  
  // Only delegate for genuinely complex stuff
  const needsResearch = needsWanderer.some(keyword => contentLower.includes(keyword)) || isResearchDrivenTool;
  const needsComplexBuilding = needsTinkerer.some(keyword => contentLower.includes(keyword));

  // Combine tool requests with complex building needs
  const needsBuilding = isToolRequest || needsComplexBuilding;
  
  // Detect ambiguous tool requests (missing specific topic) - INDEPENDENT of needsResearch
  // Trigger clarification whenever user wants a tool that prompts for topics or generates lists without a specific subject
  const ambiguityIndicators = [
    'any topic', 'prompt for a topic', 'prompt me for', 'user enters',
    'that prompts for', 'ask for a topic', 'input a topic', 'enter a topic',
    'prompts for a', 'based on your research', 'using your research'
  ];
  const hasListPattern = /(?:top ten|top \d+|best|list of)(?!\s+(benefits|reasons|ways|features|advantages|tips|insights|methods|strategies|techniques|ideas|examples|of\s+\w+))/.test(contentLower);
  const isAmbiguousRequest = isToolRequest && (
    ambiguityIndicators.some(indicator => contentLower.includes(indicator)) ||
    (hasListPattern && !/ of \w+ /.test(contentLower)) // "top ten list" without "of [topic]"
  );

  let reasoning = '';
  if (isAmbiguousRequest) {
    reasoning = 'Ambiguous research-driven tool request - needs specific topic';
  } else if (needsResearch && needsBuilding) {
    reasoning = 'Too complex - needs research then building';
  } else if (needsBuilding) {
    reasoning = isToolRequest ? 'Tool building request - Noah handles with artifacts' : 'Too complex - needs specialized building';
  } else if (needsResearch) {
    reasoning = 'Too complex - needs deep research';  
  } else if (canNoahDoThis) {
    reasoning = 'Quick and easy - Noah can handle this!';
  } else {
    reasoning = 'Simple conversation - Noah handles directly';
  }

  return { 
    needsResearch, 
    needsBuilding, 
    confidence: 0.9, 
    reasoning,
    isAmbiguous: isAmbiguousRequest 
  };
}

/**
 * 🧠 ASYNC MEMORY STORAGE (Fire-and-Forget)
 * Stores conversation observations asynchronously without blocking responses
 * 
 * @param sessionId - Session identifier for memory storage
 * @param messages - Full conversation history
 * @param artifactGenerated - Whether an artifact was created
 * @param artifactId - Optional artifact ID
 * @param artifactTitle - Optional artifact title
 */
function storeConversationMemories(
  sessionId: string | null,
  messages: ChatMessage[],
  artifactGenerated: boolean = false,
  artifactId?: string,
  artifactTitle?: string
): void {
  if (!sessionId) {
    return; // No session, skip memory storage
  }

  // Fire-and-forget: Extract and store observations asynchronously
  Promise.resolve().then(async () => {
    try {
      // Extract all observations from conversation
      const observations = ObservationExtractor.extractAllObservations(
        messages,
        artifactGenerated,
        artifactId,
        artifactTitle
      );

      if (observations.length === 0) {
        logger.debug('No observations to store', { sessionId: sessionId.substring(0, 8) + '...' });
        return;
      }

      logger.debug('📝 Storing conversation observations', {
        sessionId: sessionId.substring(0, 8) + '...',
        observationCount: observations.length,
        types: observations.map(o => o.entityType)
      });

      // Store each observation via MCP memory service (resilient per-observation error handling)
      const { mcpMemoryService } = await import('@/lib/memory/mcp-memory-service');
      
      let successCount = 0;
      let failureCount = 0;

      for (const obs of observations) {
        try {
          await mcpMemoryService.storeObservation(
            sessionId,
            obs.entityName,
            obs.entityType,
            obs.observation
          );
          successCount++;
        } catch (obsError) {
          failureCount++;
          logger.debug('Failed to store individual observation', {
            entityType: obs.entityType,
            error: obsError instanceof Error ? obsError.message : String(obsError)
          });
        }
      }

      if (successCount > 0) {
        logger.info('✅ Conversation memories stored', {
          sessionId: sessionId.substring(0, 8) + '...',
          successCount,
          failureCount,
          totalAttempted: observations.length
        });
      }
    } catch (error) {
      // Log but don't throw - memory failures should never crash the app
      logger.warn('Failed to store conversation memories', {
        sessionId: sessionId?.substring(0, 8) + '...',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }).catch(error => {
    // Ultimate catch-all to ensure no unhandled promise rejections
    logger.warn('Unhandled error in memory storage', {
      error: error instanceof Error ? error.message : String(error)
    });
  });
}

/**
 * 🚀 SMART AGENT INITIALIZATION - Initialize once, reuse forever
 */
async function ensureAgentsInitialized(): Promise<void> {
  if (wandererInstance && tinkererInstance && sharedResourcesCache) {
    return;
  }

  if (agentInitializationPromise) {
    return agentInitializationPromise;
  }

  agentInitializationPromise = (async () => {
    try {
      logger.info('🚀 Initializing agents (one-time setup)...');
      const llmProvider = createLLMProvider();

      // Initialize shared resources
      if (!sharedResourcesCache) {
        sharedResourcesCache = await sharedResourceManager.initializeResources(llmProvider);
        logger.info('✅ Shared resources cached');
      }

      // Initialize Wanderer with research-optimized provider
      if (!wandererInstance) {
        const researchProvider = createLLMProvider('research');
        wandererInstance = new WandererAgent(researchProvider, { temperature: 0.75, maxTokens: 2500 }, sharedResourcesCache);
        logger.info('✅ Wanderer agent cached with research provider');
      }

      // Initialize Tinkerer with deep-build optimized provider
      if (!tinkererInstance) {
        const deepbuildProvider = createLLMProvider('deepbuild');
        tinkererInstance = new PracticalAgent(deepbuildProvider, { temperature: 0.3, maxTokens: 4000 }, sharedResourcesCache);
        logger.info('✅ Tinkerer agent cached with deepbuild provider');
      }

      logger.info('🎉 All agents initialized and cached');
    } catch (error) {
      logger.error('💥 Agent initialization failed', { error });
      wandererInstance = null;
      tinkererInstance = null;
      sharedResourcesCache = null;
      agentInitializationPromise = null;
      throw error;
    }
  })();

  return agentInitializationPromise;
}

/**
 * 🔬 Wanderer research using cached instance
 */
async function wandererResearch(messages: ChatMessage[], context: LoggingContext): Promise<{ content: string }> {
  await ensureAgentsInitialized();

  if (!wandererInstance) {
    throw new Error('Wanderer agent not initialized');
  }

  logger.info('🔬 Using cached Wanderer for research...');
  const wandererLastMessage = messages[messages.length - 1]?.content || '';

  const research = await wandererInstance.processRequest({
    id: `research_${Date.now()}`,
    sessionId: context.sessionId,
    content: wandererLastMessage,
    timestamp: new Date()
  });

  return { content: research.content };
}

/**
 * 🔧 Tinkerer build using cached instance
 */
async function tinkererBuild(messages: ChatMessage[], research: { content: string } | null, context: LoggingContext): Promise<{ content: string }> {
  await ensureAgentsInitialized();

  if (!tinkererInstance) {
    throw new Error('Tinkerer agent not initialized');
  }

  logger.info('🔧 Using cached Tinkerer for building...');
  const tinkererLastMessage = messages[messages.length - 1]?.content || '';
  const buildContent = research
    ? `${tinkererLastMessage}\n\n**IMPORTANT: Research Context Provided Below**\nThe research data below contains actual insights and information. You MUST use this exact research data to populate your tool. DO NOT create placeholder content like "Item 1", "Item 2", or "Reason related to...". Extract and display the real information from this research.\n\nResearch Context:\n${research.content}`
    : tinkererLastMessage;

  const tool = await tinkererInstance.processRequest({
    id: `build_${Date.now()}`,
    sessionId: context.sessionId,
    content: buildContent,
    timestamp: new Date()
  });

  return { content: tool.content };
}

/**
 * Initialize conversation state with elegant analytics integration
 */
async function initializeConversationState(
  req: NextRequest, 
  context: LoggingContext, 
  skepticMode: boolean,
  providedSessionId?: string | null
): Promise<ConversationState> {
  const startTime = Date.now();
  
  let sessionId: string | null = null;
  
  // Use provided session ID if available (from frontend localStorage)
  if (providedSessionId) {
    sessionId = providedSessionId;
    logger.debug('Using provided session ID from request', {
      sessionId: sessionId.substring(0, 8) + '...'
    });
  } else {
    // Generate a NEW random session ID for fresh visits
    // This ensures each new browser session gets a unique ID
    const crypto = await import('crypto');
    const randomSessionId = `noah_${crypto.randomBytes(8).toString('hex')}_${Date.now().toString(36)}`;
    
    logger.info('Creating new random session ID for fresh visit', {
      sessionId: randomSessionId.substring(0, 8) + '...'
    });
    
    // Create the session in the database
    try {
      const userAgent = req.headers.get('user-agent') || undefined;
      const forwardedFor = req.headers.get('x-forwarded-for') || undefined;
      const { generateSessionFingerprint } = await import('@/lib/analytics/session');
      const fingerprint = generateSessionFingerprint(userAgent, forwardedFor, 'development');
      
      // Use the connection pool to create session directly
      const { analyticsPool } = await import('@/lib/analytics/connection-pool');
      const result = await analyticsPool.executeQuery<{ id: string }[]>(
        `INSERT INTO user_sessions (id, session_fingerprint, environment) 
         VALUES ($1, $2, $3) 
         RETURNING id`,
        [randomSessionId, fingerprint, 'development']
      );
      
      sessionId = result && result.length > 0 ? result[0].id : randomSessionId;
      logger.debug('New session created in database', { sessionId: sessionId.substring(0, 8) + '...' });
    } catch (error) {
      logger.warn('Failed to create session in database, using generated ID anyway', {
        error: error instanceof Error ? error.message : String(error)
      });
      sessionId = randomSessionId;
    }
  }
  
  // Fire-and-forget conversation creation if session exists
  let conversationId: string | null = null;
  if (sessionId) {
    const conversationPromise = analyticsService.startConversation(sessionId, skepticMode);
    conversationId = await conversationPromise;
  }
  
  return {
    sessionId,
    conversationId,
    messageSequence: 0,
    startTime
  };
}

/**
 * Clean Noah-only chat handler - handles simple tools and general conversation
 */
async function noahChatHandler(req: NextRequest, context: LoggingContext): Promise<NextResponse<ChatResponse>> {
  const startTime = Date.now();
  logger.info('🦉 Noah processing request');

  try {
    // Parse request with timeout protection
    const parsePromise = req.json();
    const { messages, skepticMode, sessionId: providedSessionId } = await withTimeout(parsePromise, 2000);
    
    // Store parsed body in context for logging middleware
    context.requestBody = { messages, skepticMode, sessionId: providedSessionId };

    // Initialize conversation state with analytics (async, zero performance impact)
    const conversationState = await initializeConversationState(req, context, skepticMode || false, providedSessionId);

    // 🧠 MEMORY ENRICHMENT - Retrieve session memory and enrich system prompt
    let enrichedSystemPrompt: string = AI_CONFIG.CHAT_SYSTEM_PROMPT; // Default to base prompt
    if (conversationState.sessionId) {
      try {
        const memoryContext = await sharedResourceManager.getMemoryContext(conversationState.sessionId);
        enrichedSystemPrompt = ContextEnricher.enrichSystemPrompt(memoryContext);
        
        if (memoryContext && memoryContext.entities.length > 0) {
          logger.debug('✨ System prompt enriched with memory context', {
            sessionId: conversationState.sessionId.substring(0, 8) + '...',
            entitiesCount: memoryContext.entities.length
          });
        }
      } catch (error) {
        logger.warn('Failed to enrich system prompt with memory, using base prompt', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // 📚 KNOWLEDGE BASE SEARCH - Retrieve relevant knowledge from vector store
    if (AI_CONFIG.RAG_ENABLED && messages && messages.length > 0) {
      try {
        const lastMessage = messages[messages.length - 1]?.content || '';
        const knowledgeService = (await import('@/lib/knowledge/knowledge-singleton')).default;
        const knowledgeResults = await knowledgeService.search(lastMessage);
        
        if (knowledgeResults && knowledgeResults.length > 0) {
          const knowledgeSection = `

────────────────────────────────────────────────────
KNOWLEDGE BASE (factual information relevant to current query)
${knowledgeResults.map((result: any, i: number) => `
${i + 1}. ${result.item.content}
   (Source: ${result.item.metadata.source || 'Unknown'})`).join('\n')}

IMPORTANT:
- Use this knowledge naturally when relevant to the user's question
- Never fabricate or assume information not present here
- If asked about topics covered here, reference this information
────────────────────────────────────────────────────`;

          enrichedSystemPrompt = enrichedSystemPrompt + knowledgeSection;
          logger.debug('📚 System prompt enriched with knowledge base', {
            knowledgeItemsFound: knowledgeResults.length,
            query: lastMessage.substring(0, 50)
          });
        }
      } catch (error) {
        logger.warn('Failed to enrich with knowledge base', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // 🔍 SKEPTIC MODE - Add context when user has enabled skeptic mode
    if (skepticMode) {
      const skepticSection = `

────────────────────────────────────────────────────
SKEPTIC MODE ACTIVE
The user has enabled Skeptic Mode, requesting that you provide additional verification and show more sources.

When responding:
- Be more explicit about your reasoning and sources
- Acknowledge uncertainty more clearly when it exists
- Provide more context and verification for claims
- Show your work and explain how you arrived at conclusions
- If asked about Skeptic Mode, explain that it's enabled and what it means
────────────────────────────────────────────────────`;

      enrichedSystemPrompt = enrichedSystemPrompt + skepticSection;
      logger.debug('🔍 System prompt enriched with skeptic mode context');
    }

    // 🎯 PERSONA ANCHOR - Re-emphasize Noah's core traits for Sonnet 4.5
    // Sonnet 4.5 weights recent prompt sections more heavily, so we re-anchor the personality
    const personaAnchor = `

────────────────────────────────────────────────────
CORE PERSONA (Use ALL context above, respond with THIS personality)

You are NOAH - your personality and voice are non-negotiable:
- Genuinely CURIOUS and loves exploring ideas for their own sake
- Conversational FIRST, task-oriented second
- Asks insightful questions and wonders about possibilities
- Kind, thoughtful, witty, occasionally intelligently sarcastic
- Practical when needed, but never rushes to "build something"
- Never assumes emotions or fabricates user experiences
- Sometimes brutally honest in a way that makes people laugh
- Creates space for exploration before jumping to solutions
- Treats users as co-collaborators with agency and insight

CRITICAL INSTRUCTIONS:
1. USE the knowledge base, memory, and context provided above
2. RESPOND with Noah's personality (curious, conversational, witty)
3. The context informs WHAT you say; this personality defines HOW you say it

When someone shares something, get CURIOUS - don't default to task mode.
────────────────────────────────────────────────────`;

    enrichedSystemPrompt = enrichedSystemPrompt + personaAnchor;
    logger.debug('🎯 System prompt anchored with core persona for Sonnet 4.5');

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({
        content: "I didn't receive any messages to respond to. Want to try sending me something?",
        status: 'error',
        agent: 'noah'
      });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';
    logger.info('📝 Processing Noah request', {
      messageCount: messages.length,
      messageLength: lastMessage.length,
      analytics: conversationState.sessionId ? 'enabled' : 'disabled'
    });

    // 🛡️ SAFETY CHECK - Radio silence for prohibited content
    const safetyCheck = await NoahSafetyService.checkUserMessage(
      lastMessage,
      conversationState.sessionId || undefined,
      conversationState.conversationId || undefined,
      messages.slice(0, -1).map(m => m.content)
    );

    if (safetyCheck.interfaceLocked) {
      logger.warn('🔒 Interface lockdown activated - safety violation detected', {
        violationType: safetyCheck.violation?.type,
        reason: safetyCheck.violation?.reason,
        sessionId: conversationState.sessionId?.substring(0, 8) + '...'
      });

      // Noah locks the interface - spaces response with all interactions disabled
      // Log the attempted violation for Trust Recovery Protocol tracking
      if (conversationState.conversationId && conversationState.sessionId) {
        conversationState.messageSequence++;
        analyticsService.logMessage(
          conversationState.conversationId,
          conversationState.sessionId,
          conversationState.messageSequence,
          'user',
          `[SAFETY_VIOLATION] ${safetyCheck.violation?.type}: Interface locked`
        );
      }

      // Return spaces response - interface lockdown
      return NextResponse.json({
        content: "   ", // Spaces so API doesn't get empty content
        status: 'interface_locked',
        agent: 'noah'
      });
    }

    logger.debug('✅ Safety check passed - proceeding with normal processing');

    // Log user message (fire-and-forget, zero performance impact)
    if (conversationState.conversationId && conversationState.sessionId) {
      conversationState.messageSequence++;
      analyticsService.logMessage(
        conversationState.conversationId,
        conversationState.sessionId,
        conversationState.messageSequence,
        'user',
        lastMessage
      );
    }

    // Noah analyzes and decides internally - following user's exact pattern
    const analysis = analyzeRequest(lastMessage);
    logger.info('🧠 Noah analysis complete', {
      needsResearch: analysis.needsResearch,
      needsBuilding: analysis.needsBuilding,
      reasoning: analysis.reasoning,
      confidence: analysis.confidence
    });

    let result: { content: string };
    let agentUsed: 'noah' | 'wanderer' | 'tinkerer' = 'noah';
    let agentStrategy = 'noah_direct';

    try {
      // Handle ambiguous research-driven tool requests (need specific topic)
      if (analysis.isAmbiguous) {
        logger.info('🤔 Ambiguous research-driven tool request detected - asking for clarification...');
        agentStrategy = 'noah_clarification';
        result = { 
          content: `I'd love to help you build that research-driven tool! However, I need a bit more information.

Since I create static HTML tools (not dynamic apps with backend APIs), I'll research a specific topic and build a tool that displays those insights. The tool won't be able to research different topics on demand - it will show the research results for the topic you choose.

Could you tell me what specific topic you'd like me to research? For example:
- "Build a tool showing top ten benefits of renewable energy"
- "Create a tool with top ten TypeScript features for Python developers"
- "Make a tool displaying top ten productivity tips for remote workers"

Once you give me a specific topic, I'll research it and create a beautiful tool displaying those insights!` 
        };
      } else if (analysis.needsResearch) {
        logger.info('🔬 Noah delegating to Wanderer for research...');
        agentUsed = 'wanderer';
        agentStrategy = analysis.needsBuilding ? 'noah_wanderer_tinkerer' : 'noah_wanderer';
        const research = await withTimeout(wandererResearch(messages, context), WANDERER_TIMEOUT);
        if (analysis.needsBuilding) {
          logger.info('🔧 Noah chaining to Tinkerer for building...');
          agentUsed = 'tinkerer';
          const tool = await withTimeout(tinkererBuild(messages, research, context), TINKERER_TIMEOUT);
          result = { content: tool.content };
        } else {
          result = { content: research.content };
        }
      } else if (analysis.needsBuilding) {
        logger.info('🔧 Noah delegating to Tinkerer for building...');
        agentUsed = 'tinkerer';
        agentStrategy = 'noah_tinkerer';
        const tool = await withTimeout(tinkererBuild(messages, null, context), TINKERER_TIMEOUT);
        result = { content: tool.content };
      } else {
        // Noah handles directly - use fast model for tool generation, premium for conversation
        const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
        const toolKeywords = ['create', 'build', 'make', 'calculator', 'timer', 'converter', 'tool', 'app', 'component'];
        const isToolGeneration = toolKeywords.some(keyword => lastMessage.includes(keyword));
        const taskType = isToolGeneration ? 'deepbuild' : 'default';
        logger.info(`🦉 Noah handling directly${isToolGeneration ? ' (tool generation)' : ' (conversation)'}...`);
        const llmProvider = createLLMProvider(taskType);
        const generatePromise = llmProvider.generateText({
          messages: messages.map((msg: ChatMessage) => ({
            role: msg.role,
            content: msg.content
          })),
          system: isToolGeneration ? getToolGenerationPrompt() : enrichedSystemPrompt,
          temperature: 0.7
        });
        result = await withTimeout(generatePromise, NOAH_TIMEOUT);
      }
    } catch (agentError) {
      logger.error('🚨 Agent orchestration failed, Noah handling directly', { error: agentError });
      agentUsed = 'noah';
      agentStrategy = 'noah_direct_fallback';
      // Fallback to Noah Direct - use appropriate model based on request type
      const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      const toolKeywords = ['create', 'build', 'make', 'calculator', 'timer', 'converter', 'tool', 'app', 'component'];
      const isToolGeneration = toolKeywords.some(keyword => lastMessage.includes(keyword));
      const taskType = isToolGeneration ? 'deepbuild' : 'default';
      const llmProvider = createLLMProvider(taskType);
      const generatePromise = llmProvider.generateText({
        messages: messages.map((msg: ChatMessage) => ({
          role: msg.role,
          content: msg.content
        })),
        system: isToolGeneration ? getToolGenerationPrompt() : enrichedSystemPrompt,
        temperature: 0.7
      });
      result = await withTimeout(generatePromise, NOAH_TIMEOUT);
    }

    const responseTime = Date.now() - startTime;
    logger.info('✅ Noah response generated', {
      responseLength: result.content.length,
      responseTime
    });

    // Log assistant response (fire-and-forget, zero performance impact)
    if (conversationState.conversationId && conversationState.sessionId) {
      conversationState.messageSequence++;
      analyticsService.logMessage(
        conversationState.conversationId,
        conversationState.sessionId,
        conversationState.messageSequence,
        'assistant',
        result.content,
        responseTime,
        agentUsed
      );
      
      // Log agent strategy for transparency in message metadata
      if (agentStrategy !== 'noah_direct') {
        logger.info('Agent orchestration completed', {
          strategy: agentStrategy,
          finalAgent: agentUsed,
          responseLength: result.content.length
        });
      }
    }

    // Process for artifacts using established workflow with analytics integration
    const parsed = await ArtifactService.handleArtifactWorkflow(
      result.content,
      lastMessage,
      context.sessionId,
      conversationState,
      agentUsed,
      agentStrategy
    );

    let noahContent = result.content;

    // If artifact was created, add to session storage and update messaging
    if (parsed.hasArtifact && parsed.title && parsed.content && context.sessionId) {
      // Add artifact to session storage
      const artifactId = `${context.sessionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const sessionId = context.sessionId;
      
      if (!sessionArtifacts.has(sessionId)) {
        sessionArtifacts.set(sessionId, []);
      }
      
      const artifactTimestamp = Date.now();
      sessionArtifacts.get(sessionId)!.push({
        title: parsed.title,
        content: parsed.content,
        timestamp: artifactTimestamp,
        agent: agentUsed,
        id: artifactId
      });

      // 📁 Propose file operation for artifact save (user approval required)
      try {
        const filesystemStatus = mcpFilesystemService.getStatus();
        if (filesystemStatus.available) {
          const fileType = FileNamingStrategy.determineFileType(parsed.title, parsed.content);
          const filePath = FileNamingStrategy.generateFilePath({
            title: parsed.title,
            category: 'tool',
            fileType,
            timestamp: artifactTimestamp
          });

          const fileOperation: FileOperation = {
            type: 'save_artifact',
            path: filePath,
            content: parsed.content,
            metadata: {
              agent: agentUsed as 'noah' | 'wanderer' | 'tinkerer',
              timestamp: artifactTimestamp,
              sessionId: sessionId,
              artifactId: artifactId,
              description: `Save ${parsed.title}`,
              fileSize: Buffer.byteLength(parsed.content, 'utf-8'),
              fileType,
              category: 'tool'
            },
            status: 'pending',
            userApprovalRequired: true
          };

          const operationId = mcpFilesystemService.proposeFileOperation(fileOperation);
          logger.info('📋 File save operation proposed for artifact', {
            artifactTitle: parsed.title.substring(0, 30),
            operationId: operationId.substring(0, 12) + '...',
            filePath
          });
        } else {
          logger.debug('Filesystem service not available, skipping file operation proposal');
        }
      } catch (error) {
        logger.warn('Failed to propose file operation for artifact', {
          artifactTitle: parsed.title.substring(0, 30),
          error: error instanceof Error ? error.message : String(error)
        });
      }

      const lines = result.content.split('\n');
      const firstFiveLines = lines.slice(0, 5).join('\n');
      const hasMoreContent = lines.length > 5;

      // Updated messaging per user request
      const redirectMessage = `\n\nPlease see the toolbox for the full text. If it's code-based, save the download as an html file and open in a browser.`;
      
      // Natural conversation continuation
      const continuationMessage = `\n\nWhat would you like to build next, or do you have questions about how this works?`;

      if (hasMoreContent) {
        noahContent = `${firstFiveLines}${redirectMessage}${continuationMessage}`;
      } else {
        noahContent = `${result.content}${redirectMessage}${continuationMessage}`;
      }
    }

    const response: ChatResponse = {
      content: noahContent,
      status: 'success',
      agent: agentUsed,
      agentStrategy: agentStrategy // Show full orchestration path
    };

    // Include artifact in response for frontend processing
    if (parsed.hasArtifact && parsed.title && parsed.content) {
      response.artifact = {
        title: parsed.title,
        content: parsed.content
      };
    }

    // Include session artifacts for accumulated toolbox - fetch from database
    // Use the UUID session ID from conversation state, not the potentially old session fingerprint
    if (conversationState.sessionId) {
      try {
        const artifactsResult = await analyticsPool.executeQuery<Array<{ 
          id: string; 
          title: string; 
          content: string; 
          created_at: string; 
          generation_agent: string; 
        }>>(
          'SELECT id, title, content, created_at, generation_agent FROM generated_tools WHERE session_id = $1 ORDER BY created_at DESC',
          [conversationState.sessionId]
        );
        
        if (artifactsResult && artifactsResult.length > 0) {
          response.sessionArtifacts = artifactsResult.map(artifact => ({
            id: artifact.id,
            title: artifact.title,
            content: artifact.content,
            timestamp: new Date(artifact.created_at).getTime(),
            agent: artifact.generation_agent || 'noah'
          }));
        }
      } catch (error) {
        logger.error('Failed to fetch session artifacts for response', { error });
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('💥 Noah chat failed', { error, responseTime });

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let userFriendlyMessage = `I'm experiencing technical difficulties. The specific issue: ${errorMessage}`;

    if (errorMessage.includes('timeout')) {
      userFriendlyMessage = `I'm taking longer than usual to respond. This might be a good time to tell me to get my act together. The technical issue is: ${errorMessage}`;
    }

    return NextResponse.json({
      content: userFriendlyMessage,
      status: 'error',
      agent: 'noah'
    });
  }
}

/**
 * Fast path for simple factual questions only - tool creation always uses full artifact processing
 */
function isSimpleQuestion(content: string): boolean {
  const contentLower = content.toLowerCase();
  
  // Simple factual questions only
  const simpleFactual = [
    'what is', 'who is', 'when is', 'where is', 'how many', 'what are',
    'capital of', 'population of', 'currency of', 'language of',
    'definition of', 'meaning of', 'explain', 'define'
  ];
  
  // Tool creation keywords should NOT use fast path
  const toolCreationKeywords = [
    'create', 'build', 'make', 'calculator', 'timer', 'converter', 'tool', 'app', 'component'
  ];
  
  const isFactual = simpleFactual.some(pattern => contentLower.includes(pattern)) && content.length < 100;
  const isToolCreation = toolCreationKeywords.some(pattern => contentLower.includes(pattern));
  
  return isFactual && !isToolCreation;
}

/**
 * Streaming Noah chat handler - with fast path for simple questions
 */
async function noahStreamingChatHandler(req: NextRequest, context: LoggingContext) {
  const startTime = Date.now();
  logger.info('🦉 Noah processing streaming request');

  try {
    // Parse request with timeout protection
    const parsePromise = req.json();
    const { messages, skepticMode, sessionId: providedSessionId } = await withTimeout(parsePromise, 2000);
    
    // Store parsed body in context for logging middleware
    context.requestBody = { messages, skepticMode, sessionId: providedSessionId };

    // CRITICAL: Validate messages before accessing
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      const model = AI_CONFIG.getProvider() === 'openai' ? openai(AI_CONFIG.getModel()) : anthropic(AI_CONFIG.getModel());
      return streamText({
        model,
        messages: [{ role: 'assistant', content: "I didn't receive any messages to respond to. Want to try sending me something?" }],
        temperature: 0.7,
      }).toTextStreamResponse();
    }

    // Initialize conversation state with analytics (required for all paths)
    const conversationState = await initializeConversationState(req, context, skepticMode || false, providedSessionId);

    // 🧠 MEMORY ENRICHMENT - Retrieve session memory and enrich system prompt
    let enrichedSystemPrompt: string = AI_CONFIG.CHAT_SYSTEM_PROMPT; // Default to base prompt
    if (conversationState.sessionId) {
      try {
        const memoryContext = await sharedResourceManager.getMemoryContext(conversationState.sessionId);
        enrichedSystemPrompt = ContextEnricher.enrichSystemPrompt(memoryContext);
        
        if (memoryContext && memoryContext.entities.length > 0) {
          logger.debug('✨ System prompt enriched with memory context (streaming)', {
            sessionId: conversationState.sessionId.substring(0, 8) + '...',
            entitiesCount: memoryContext.entities.length
          });
        }
      } catch (error) {
        logger.warn('Failed to enrich system prompt with memory (streaming), using base prompt', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // 🔍 SKEPTIC MODE - Add context when user has enabled skeptic mode
    if (skepticMode) {
      const skepticSection = `

────────────────────────────────────────────────────
SKEPTIC MODE ACTIVE
The user has enabled Skeptic Mode, requesting that you provide additional verification and show more sources.

When responding:
- Be more explicit about your reasoning and sources
- Acknowledge uncertainty more clearly when it exists
- Provide more context and verification for claims
- Show your work and explain how you arrived at conclusions
- If asked about Skeptic Mode, explain that it's enabled and what it means
────────────────────────────────────────────────────`;

      enrichedSystemPrompt = enrichedSystemPrompt + skepticSection;
      logger.debug('🔍 System prompt enriched with skeptic mode context (streaming)');
    }

    // 🎯 PERSONA ANCHOR - Re-emphasize Noah's core traits for Sonnet 4.5
    // Sonnet 4.5 weights recent prompt sections more heavily, so we re-anchor the personality
    const personaAnchor = `

────────────────────────────────────────────────────
CORE PERSONA (Use ALL context above, respond with THIS personality)

You are NOAH - your personality and voice are non-negotiable:
- Genuinely CURIOUS and loves exploring ideas for their own sake
- Conversational FIRST, task-oriented second
- Asks insightful questions and wonders about possibilities
- Kind, thoughtful, witty, occasionally intelligently sarcastic
- Practical when needed, but never rushes to "build something"
- Never assumes emotions or fabricates user experiences
- Sometimes brutally honest in a way that makes people laugh
- Creates space for exploration before jumping to solutions
- Treats users as co-collaborators with agency and insight

CRITICAL INSTRUCTIONS:
1. USE the knowledge base, memory, and context provided above
2. RESPOND with Noah's personality (curious, conversational, witty)
3. The context informs WHAT you say; this personality defines HOW you say it

When someone shares something, get CURIOUS - don't default to task mode.
────────────────────────────────────────────────────`;

    enrichedSystemPrompt = enrichedSystemPrompt + personaAnchor;
    logger.debug('🎯 System prompt anchored with core persona for Sonnet 4.5 (streaming)');

    const streamingLastMessage = messages[messages.length - 1]?.content || '';
    
    // 🛡️ SAFETY CHECK - Required for all paths, including fast path
    const streamingSafetyCheck = await NoahSafetyService.checkUserMessage(
      streamingLastMessage,
      conversationState.sessionId || undefined,
      conversationState.conversationId || undefined,
      messages.slice(0, -1).map(m => m.content)
    );

    if (streamingSafetyCheck.radioSilence) {
      logger.warn('🔴 Radio silence activated - safety violation detected', {
        violationType: streamingSafetyCheck.violation?.type,
        reason: streamingSafetyCheck.violation?.reason,
        sessionId: conversationState.sessionId?.substring(0, 8) + '...'
      });

      // Log the attempted violation 
      if (conversationState.conversationId && conversationState.sessionId) {
        conversationState.messageSequence++;
        analyticsService.logMessage(
          conversationState.conversationId,
          conversationState.sessionId,
          conversationState.messageSequence,
          'user',
          `[SAFETY_VIOLATION] ${streamingSafetyCheck.violation?.type}: Content filtered`
        );
      }

      // Return empty stream - radio silence
      const model = AI_CONFIG.getProvider() === 'openai' ? openai(AI_CONFIG.getModel()) : anthropic(AI_CONFIG.getModel());
      return streamText({
        model,
        messages: [{ role: 'assistant', content: '' }],
        temperature: 0.7,
      }).toTextStreamResponse();
    }

    // Fast path for simple questions - AFTER safety and analytics
    if (isSimpleQuestion(streamingLastMessage)) {
      logger.info('🚀 Fast path for simple question (post-safety)');
      
      // Log user message (required for analytics)
      if (conversationState.conversationId && conversationState.sessionId) {
        conversationState.messageSequence++;
        analyticsService.logMessage(
          conversationState.conversationId,
          conversationState.sessionId,
          conversationState.messageSequence,
          'user',
          streamingLastMessage
        );
      }

      const model = AI_CONFIG.getProvider() === 'openai' ? openai(AI_CONFIG.getModel()) : anthropic(AI_CONFIG.getModel());
      
      return streamText({
        model,
        messages: messages.map((msg: ChatMessage) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })),
        system: enrichedSystemPrompt,
        temperature: 0.3, // Lower temperature for factual questions
        onFinish: async (completion) => {
          const responseTime = Date.now() - startTime;
          logger.info('✅ Noah fast path completed', {
            responseLength: completion.text.length,
            responseTime
          });
          
          // Log assistant response (required for analytics)
          if (conversationState.conversationId && conversationState.sessionId) {
            conversationState.messageSequence++;
            analyticsService.logMessage(
              conversationState.conversationId,
              conversationState.sessionId,
              conversationState.messageSequence,
              'assistant',
              completion.text,
              responseTime,
              'noah'
            );
          }

          // 🧠 Store conversation memories (fire-and-forget)
          const updatedMessages = [...messages, { role: 'assistant' as const, content: completion.text }];
          storeConversationMemories(conversationState.sessionId, updatedMessages, false);
        }
      }).toTextStreamResponse();
    }

    logger.debug('✅ Safety check passed - proceeding with complex processing');

    // Log user message (fire-and-forget, same as existing)
    if (conversationState.conversationId && conversationState.sessionId) {
      conversationState.messageSequence++;
      analyticsService.logMessage(
        conversationState.conversationId,
        conversationState.sessionId,
        conversationState.messageSequence,
        'user',
        streamingLastMessage
      );
    }

    // 🚀 FAST-PATH: Check for boutique tool intent (<100ms response)
    const boutiqueIntent = BoutiqueIntentDetector.detectIntent(streamingLastMessage);
    if (boutiqueIntent.detected && boutiqueIntent.toolName && boutiqueIntent.confidence > 0.9) {
      const fastPathStart = Date.now();
      logger.info('⚡ Fast-path detected for boutique tool', {
        toolName: boutiqueIntent.toolName,
        confidence: boutiqueIntent.confidence
      });

      try {
        // Call template directly for fast-path (bypass AI SDK tool wrapper)
        const params = boutiqueIntent.parameters;
        let toolResult: { title: string; content: string };
        
        switch (boutiqueIntent.toolName) {
          case 'scientific_calculator':
            toolResult = {
              title: 'Scientific Calculator',
              content: BOUTIQUE_TEMPLATES.scientificCalculator(params.theme || 'dark', params.features)
            };
            break;
          case 'pomodoro_timer':
            toolResult = {
              title: 'Pomodoro Timer',
              content: BOUTIQUE_TEMPLATES.pomodoroTimer(params.workMinutes || 25, params.breakMinutes || 5)
            };
            break;
          case 'unit_converter':
            toolResult = {
              title: 'Unit Converter',
              content: BOUTIQUE_TEMPLATES.unitConverter(params.categories)
            };
            break;
          case 'assumption_breaker':
            toolResult = {
              title: 'Assumption Breaker',
              content: BOUTIQUE_TEMPLATES.assumptionBreaker()
            };
            break;
          case 'time_telescope':
            toolResult = {
              title: 'Time Telescope',
              content: BOUTIQUE_TEMPLATES.timeTelescope(params.theme || 'dark')
            };
            break;
          case 'energy_archaeology':
            toolResult = {
              title: 'Energy Archaeology',
              content: BOUTIQUE_TEMPLATES.energyArchaeology()
            };
            break;
          default:
            throw new Error(`Unknown tool: ${boutiqueIntent.toolName}`);
        }
        
        const fastPathTime = Date.now() - fastPathStart;
        
        logger.info('✨ Boutique tool executed via fast-path', {
          toolName: boutiqueIntent.toolName,
          executionTime: fastPathTime,
          title: toolResult.title
        });

        // Create artifact
        const artifactId = `${context.sessionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = Date.now();
        
        if (context.sessionId) {
          if (!sessionArtifacts.has(context.sessionId)) {
            sessionArtifacts.set(context.sessionId, []);
          }
          sessionArtifacts.get(context.sessionId)!.push({
            title: toolResult.title,
            content: toolResult.content,
            timestamp,
            agent: 'noah',
            id: artifactId
          });
        }

        // Propose file save operation (fire-and-forget for <100ms performance)
        Promise.resolve().then(async () => {
          try {
            const filesystemStatus = mcpFilesystemService.getStatus();
            if (filesystemStatus.available && context.sessionId) {
              const fileType = FileNamingStrategy.determineFileType(toolResult.title, toolResult.content);
              const filePath = FileNamingStrategy.generateFilePath({
                title: toolResult.title,
                category: 'tool',
                fileType,
                timestamp
              });

              const fileOperation: FileOperation = {
                type: 'save_artifact',
                path: filePath,
                content: toolResult.content,
                metadata: {
                  agent: 'noah',
                  timestamp,
                  sessionId: context.sessionId,
                  artifactId,
                  description: `Save ${toolResult.title}`,
                  fileSize: new TextEncoder().encode(toolResult.content).length,
                  fileType,
                  category: 'tool'
                },
                status: 'pending',
                userApprovalRequired: true
              };

              mcpFilesystemService.proposeFileOperation(fileOperation);
              logger.info('📋 File save operation proposed for fast-path tool', {
                toolName: boutiqueIntent.toolName,
                title: toolResult.title,
                filePath
              });
            }
          } catch (error) {
            logger.warn('Failed to propose file operation for fast-path tool', {
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }).catch(error => logger.error('File operation promise rejected', { error }));

        // Store tool result in memory (fire-and-forget)
        const updatedMessages = [...messages, {
          role: 'assistant' as const,
          content: `I've created a ${toolResult.title} for you! It's ready to use right now.`
        }];
        storeConversationMemories(context.sessionId, updatedMessages, true, artifactId, toolResult.title);

        // Log response (fire-and-forget)
        const responseTime = Date.now() - startTime;
        if (conversationState.conversationId && conversationState.sessionId) {
          conversationState.messageSequence++;
          analyticsService.logMessage(
            conversationState.conversationId,
            conversationState.sessionId,
            conversationState.messageSequence,
            'assistant',
            `I've created a ${toolResult.title} for you!`,
            responseTime,
            'noah'
          );
        }

        // Return streaming response with artifact embedded
        const model = AI_CONFIG.getProvider() === 'openai' ? openai(AI_CONFIG.getModel()) : anthropic(AI_CONFIG.getModel());
        const responseText = `I've created a ${toolResult.title} for you! It's ready to use right now.\n\n<artifact title="${toolResult.title}">\n${toolResult.content}\n</artifact>`;
        
        return streamText({
          model,
          messages: [{ role: 'assistant', content: responseText }],
          temperature: 0
        }).toTextStreamResponse();
      } catch (error) {
        logger.error('Fast-path tool execution failed, falling back to normal flow', { error });
      }
    }

    // Noah analyzes and decides internally (same logic as existing)
    const analysis = analyzeRequest(streamingLastMessage);
    logger.info('🧠 Noah analysis complete', {
      needsResearch: analysis.needsResearch,
      needsBuilding: analysis.needsBuilding,
      reasoning: analysis.reasoning,
      confidence: analysis.confidence
    });

    let agentUsed: 'noah' | 'wanderer' | 'tinkerer' = 'noah';
    let agentStrategy = 'noah_direct';
    let responseContent = '';

    try {
      // Handle ambiguous research-driven tool requests (need specific topic)
      if (analysis.isAmbiguous) {
        logger.info('🤔 Ambiguous research-driven tool request detected - asking for clarification...');
        agentStrategy = 'noah_clarification';
        responseContent = `I'd love to help you build that research-driven tool! However, I need a bit more information.

Since I create static HTML tools (not dynamic apps with backend APIs), I'll research a specific topic and build a tool that displays those insights. The tool won't be able to research different topics on demand - it will show the research results for the topic you choose.

Could you tell me what specific topic you'd like me to research? For example:
- "Build a tool showing top ten benefits of renewable energy"
- "Create a tool with top ten TypeScript features for Python developers"
- "Make a tool displaying top ten productivity tips for remote workers"

Once you give me a specific topic, I'll research it and create a beautiful tool displaying those insights!`;
      } else if (analysis.needsResearch) {
        logger.info('🔬 Noah delegating to Wanderer for research...');
        agentUsed = 'wanderer';
        agentStrategy = analysis.needsBuilding ? 'noah_wanderer_tinkerer' : 'noah_wanderer';
        const research = await withTimeout(wandererResearch(messages, context), WANDERER_TIMEOUT);
        if (analysis.needsBuilding) {
          logger.info('🔧 Noah chaining to Tinkerer for building...');
          agentUsed = 'tinkerer';
          const tool = await withTimeout(tinkererBuild(messages, research, context), TINKERER_TIMEOUT);
          responseContent = tool.content;
        } else {
          responseContent = research.content;
        }
      } else if (analysis.needsBuilding) {
        logger.info('🔧 Noah delegating to Tinkerer for building...');
        agentUsed = 'tinkerer';
        agentStrategy = 'noah_tinkerer';
        const tool = await withTimeout(tinkererBuild(messages, null, context), TINKERER_TIMEOUT);
        responseContent = tool.content;
      } else {
        // Noah handles directly with streaming + boutique tools
        logger.info('🦉 Noah handling directly with streaming + boutique tools...');
        const model = AI_CONFIG.getProvider() === 'openai' ? openai(AI_CONFIG.getModel()) : anthropic(AI_CONFIG.getModel());
        
        return streamText({
          model,
          messages: messages.map((msg: ChatMessage) => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
          })),
          system: enrichedSystemPrompt,
          temperature: 0.7,
          tools: boutiqueTools,
          onFinish: async (completion) => {
            const responseTime = Date.now() - startTime;
            logger.info('✅ Noah streaming response completed', {
              responseLength: completion.text.length,
              responseTime,
              toolCallsCount: completion.toolCalls?.length || 0
            });
            
            // Log assistant response (fire-and-forget, same as existing)
            if (conversationState.conversationId && conversationState.sessionId) {
              conversationState.messageSequence++;
              analyticsService.logMessage(
                conversationState.conversationId,
                conversationState.sessionId,
                conversationState.messageSequence,
                'assistant',
                completion.text,
                responseTime,
                agentUsed
              );
            }

            // Handle tool results - create artifacts for tool outputs
            if (completion.toolResults && completion.toolResults.length > 0) {
              for (const toolResult of completion.toolResults) {
                try {
                  const result = (toolResult as any).result as { title: string; content: string };
                  
                  if (result && result.title && result.content) {
                    logger.info('🛠️ Boutique tool invoked', {
                      toolName: toolResult.toolName,
                      title: result.title
                    });

                    // Add to session artifacts
                    const artifactId = `${context.sessionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const timestamp = Date.now();
                    
                    if (context.sessionId) {
                      if (!sessionArtifacts.has(context.sessionId)) {
                        sessionArtifacts.set(context.sessionId, []);
                      }
                      sessionArtifacts.get(context.sessionId)!.push({
                        title: result.title,
                        content: result.content,
                        timestamp,
                        agent: 'noah',
                        id: artifactId
                      });
                    }

                    // Propose file save operation
                    try {
                      const filesystemStatus = mcpFilesystemService.getStatus();
                      if (filesystemStatus.available && context.sessionId) {
                        const fileType = FileNamingStrategy.determineFileType(result.title, result.content);
                        const filePath = FileNamingStrategy.generateFilePath({
                          title: result.title,
                          category: 'tool',
                          fileType,
                          timestamp
                        });

                        const fileOperation: FileOperation = {
                          type: 'save_artifact',
                          path: filePath,
                          content: result.content,
                          metadata: {
                            agent: 'noah',
                            timestamp,
                            sessionId: context.sessionId,
                            artifactId,
                            description: `Save ${result.title}`,
                            fileSize: new TextEncoder().encode(result.content).length,
                            fileType,
                            category: 'tool'
                          },
                          status: 'pending',
                          userApprovalRequired: true
                        };

                        mcpFilesystemService.proposeFileOperation(fileOperation);
                        logger.info('📋 File save operation proposed for boutique tool', {
                          toolName: toolResult.toolName,
                          title: result.title,
                          filePath
                        });
                      }
                    } catch (error) {
                      logger.warn('Failed to propose file operation for boutique tool', {
                        error: error instanceof Error ? error.message : String(error)
                      });
                    }

                    // Store tool result in memory
                    const updatedMessages = [...messages, { role: 'assistant' as const, content: completion.text }];
                    storeConversationMemories(context.sessionId, updatedMessages, true, artifactId, result.title);
                  }
                } catch (error) {
                  logger.warn('Failed to process tool result', {
                    error: error instanceof Error ? error.message : String(error)
                  });
                }
              }
            }

            // Process artifacts in background (non-blocking)
            ArtifactService.handleArtifactWorkflow(
              completion.text,
              streamingLastMessage,
              context.sessionId,
              conversationState
            ).catch(error => logger.warn('Artifact processing failed', { error }));

            // 🧠 Store conversation memories (fire-and-forget)
            const updatedMessages = [...messages, { role: 'assistant' as const, content: completion.text }];
            storeConversationMemories(conversationState.sessionId, updatedMessages, false);
          }
        }).toTextStreamResponse();
      }
    } catch (agentError) {
      logger.error('🚨 Agent orchestration failed, Noah streaming directly', { error: agentError });
      agentUsed = 'noah';
      agentStrategy = 'noah_direct_fallback';
      
      // Fallback to Noah Direct streaming with boutique tools
      const model = AI_CONFIG.getProvider() === 'openai' ? openai(AI_CONFIG.getModel()) : anthropic(AI_CONFIG.getModel());
      return streamText({
        model,
        messages: messages.map((msg: ChatMessage) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })),
        system: enrichedSystemPrompt,
        temperature: 0.7,
        tools: boutiqueTools,
        onFinish: async (completion) => {
          const responseTime = Date.now() - startTime;
          logger.info('✅ Noah fallback streaming response completed', {
            responseLength: completion.text.length,
            responseTime,
            toolCallsCount: completion.toolCalls?.length || 0
          });
          
          // Log response
          if (conversationState.conversationId && conversationState.sessionId) {
            conversationState.messageSequence++;
            analyticsService.logMessage(
              conversationState.conversationId,
              conversationState.sessionId,
              conversationState.messageSequence,
              'assistant',
              completion.text,
              responseTime,
              agentUsed
            );
          }

          // 🧠 Store conversation memories (fire-and-forget)
          const updatedMessages = [...messages, { role: 'assistant' as const, content: completion.text }];
          storeConversationMemories(conversationState.sessionId, updatedMessages, false);
        }
      }).toTextStreamResponse();
    }

    // For non-streaming agents (Wanderer/Tinkerer), return pre-computed response as stream
    const responseTime = Date.now() - startTime;
    logger.info('✅ Noah agent response completed', {
      responseLength: responseContent.length,
      responseTime,
      agent: agentUsed
    });

    // Log assistant response
    if (conversationState.conversationId && conversationState.sessionId) {
      conversationState.messageSequence++;
      analyticsService.logMessage(
        conversationState.conversationId,
        conversationState.sessionId,
        conversationState.messageSequence,
        'assistant',
        responseContent,
        responseTime,
        agentUsed
      );
    }

    // Process artifacts
    const parsed = await ArtifactService.handleArtifactWorkflow(
      responseContent,
      streamingLastMessage,
      context.sessionId,
      conversationState
    );

    // 🧠 Store conversation memories (fire-and-forget)
    const updatedMessages = [...messages, { role: 'assistant' as const, content: responseContent }];
    storeConversationMemories(
      conversationState.sessionId,
      updatedMessages,
      parsed.hasArtifact,
      parsed.hasArtifact ? `artifact_${Date.now()}` : undefined,
      parsed.title
    );

    let finalContent = responseContent;
    if (parsed.hasArtifact && parsed.title && parsed.content) {
      const lines = responseContent.split('\n');
      const firstFiveLines = lines.slice(0, 5).join('\n');
      const hasMoreContent = lines.length > 5;

      if (hasMoreContent) {
        finalContent = `${firstFiveLines}\n\n*I've created a tool for you! Check your toolbox for the complete "${parsed.title}" with all the details.*`;
      } else {
        finalContent = `${responseContent}\n\n*This tool has been saved to your toolbox as "${parsed.title}" for easy access.*`;
      }
    }

    // Return pre-computed response with SSE format for frontend compatibility
    return new Response(
      new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          let index = 0;
          const chunkSize = 3; // Stream 3 characters at a time for natural typing effect
          
          const streamChunk = () => {
            if (index < finalContent.length) {
              const chunk = finalContent.slice(index, index + chunkSize);
              // Format as SSE: data: {"content": "chunk"}\n
              const sseChunk = `data: ${JSON.stringify({ content: chunk })}\n`;
              controller.enqueue(encoder.encode(sseChunk));
              index += chunkSize;
              
              // Add small delay for natural streaming effect
              setTimeout(streamChunk, 30); // 30ms delay between chunks
            } else {
              // Send done signal
              controller.enqueue(encoder.encode('data: [DONE]\n'));
              controller.close();
            }
          };
          
          streamChunk();
        }
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'x-session-id': conversationState.sessionId || 'unknown'
        }
      }
    );

  } catch (error) {
    logger.error('💥 Noah streaming handler failed', { error });
    const errorMessage = error instanceof Error ? error.message : String(error);
    let userFriendlyMessage = `I'm experiencing technical difficulties. The specific issue: ${errorMessage}`;

    if (errorMessage.includes('timeout')) {
      userFriendlyMessage = `I'm taking longer than usual to respond. This might be a good time to tell me to get my act together. The technical issue is: ${errorMessage}`;
    }

    const model = AI_CONFIG.getProvider() === 'openai' ? openai(AI_CONFIG.getModel()) : anthropic(AI_CONFIG.getModel());
    return streamText({
      model,
      messages: [{ role: 'assistant', content: userFriendlyMessage }],
      temperature: 0,
    }).toTextStreamResponse();
  }
}

/**
 * Main POST handler - processes all chat requests
 * Tool creation always uses non-streaming for proper artifact processing
 */
export async function POST(req: NextRequest): Promise<NextResponse | Response> {
  // Check if this is a tool creation request
  const body = await req.clone().json().catch(() => ({ messages: [] }));
  const lastMessage = body?.messages?.[body.messages.length - 1]?.content?.toLowerCase() || '';
  
  const toolCreationKeywords = [
    'create', 'build', 'make', 'calculator', 'timer', 'converter', 'tool', 'app', 'component'
  ];
  const isToolCreation = toolCreationKeywords.some(keyword => lastMessage.includes(keyword));
  
  // Force tool creation to use non-streaming for proper artifact processing
  if (isToolCreation) {
    return withLogging(noahChatHandler)(req);
  }
  
  // Check if client supports streaming for other requests
  const acceptHeader = req.headers.get('accept') || '';
  const isStreamingRequest = acceptHeader.includes('text/stream') || req.headers.get('x-streaming') === 'true';
  
  if (isStreamingRequest) {
    // Streaming handler returns Response directly (not wrapped in withLogging)
    const sessionId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return noahStreamingChatHandler(req, { sessionId, startTime: Date.now() });
  } else {
    return withLogging(noahChatHandler)(req);
  }
}

/**
 * Health check endpoint
 */
export async function GET(): Promise<NextResponse<HealthResponse>> {
  return NextResponse.json({
    status: 'healthy',
    agent: 'noah',
    capabilities: ['chat', 'tool-generation', 'conversation'],
    model: AI_CONFIG.getModel(),
    avg_response_time: '2-5s'
  });
}