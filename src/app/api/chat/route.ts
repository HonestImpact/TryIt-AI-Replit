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
import { NoahSafetyService } from '@/lib/safety';

const logger = createLogger('noah-chat');

// 🚀 MODULE-LEVEL AGENT CACHING - Initialize ONCE, reuse forever
let wandererInstance: WandererAgent | null = null;
let tinkererInstance: PracticalAgent | null = null;
let sharedResourcesCache: AgentSharedResources | null = null;
let agentInitializationPromise: Promise<void> | null = null;

// Optimized timeout configuration for production
const NOAH_TIMEOUT = 45000; // 45 seconds for Noah direct responses
const WANDERER_TIMEOUT = 30000; // 30 seconds for fast research (Haiku)
const TINKERER_TIMEOUT = 60000; // 60 seconds for deep building (Sonnet 4)

interface ChatResponse {
  content: string;
  status?: string;
  agent?: string;
  artifact?: {
    title: string;
    content: string;
  };
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
 * Noah's enhanced analysis - more nuanced delegation decisions
 * Keeps simple tools and conversation with Noah for natural flow
 */
function analyzeRequest(content: string): {
  needsResearch: boolean;
  needsBuilding: boolean;
  confidence: number;
  reasoning: string;
} {
  const contentLower = content.toLowerCase();

  // Noah handles directly - text-based tools and simple requests
  const noahCanHandle = [
    'list', 'template', 'guide', 'email', 'letter', 'checklist', 'outline',
    'summary', 'plan', 'advice', 'tips', 'steps', 'instructions', 'format',
    'structure', 'framework', 'process', 'workflow', 'schedule', 'agenda'
  ];

  // Simple web tools Noah can create directly (basic HTML/JS)
  const simpleWebTools = [
    'calculator', 'converter', 'timer', 'counter', 'form', 'quiz',
    'calendar', 'basic calendar', 'simple calendar', 'event calendar',
    'simple game', 'color picker', 'text formatter', 'notepad', 'todo',
    'stopwatch', 'clock', 'random generator', 'password generator'
  ];

  // Genuine creative/sideways thinking indicators for Wanderer
  const creativeThinking = [
    'creative approach', 'think differently', 'alternative perspective', 'brainstorm',
    'out of the box', 'unconventional', 'innovative angle', 'fresh perspective',
    'paradigm shift', 'reframe', 'lateral thinking', 'creative solution'
  ];

  // Complex interactive tools that need Tinkerer (RAG components, sophisticated apps)
  const complexInteractive = [
    'interactive dashboard', 'data visualization', 'advanced app', 'full application',
    'database integration', 'api integration', 'multi-page', 'complex interface',
    'sophisticated tool', 'advanced calculator', 'data analysis tool', 'visualization'
  ];

  // Research indicators - only for genuine research needs
  const researchIndicators = [
    'research and compare', 'market analysis', 'competitive analysis',
    'comprehensive study', 'detailed investigation', 'industry trends',
    'state of the art analysis', 'benchmark study', 'feasibility study'
  ];

  // Check if Noah can handle this directly
  const isSimpleTextTool = noahCanHandle.some(keyword => contentLower.includes(keyword));
  const isSimpleWebTool = simpleWebTools.some(tool => contentLower.includes(tool));
  const isBasicAdvice = contentLower.includes('how to') || contentLower.includes('explain') || contentLower.includes('help me understand');
  
  // Enhanced tool creation detection - catches common patterns
  const isToolCreation = contentLower.includes('create a') || contentLower.includes('make a') || contentLower.includes('build a') || contentLower.includes('generate a');
  const isSimpleToolRequest = isToolCreation && (isSimpleTextTool || isSimpleWebTool);

  // Check if it needs specialized agents
  const needsCreativeThinking = creativeThinking.some(keyword => contentLower.includes(keyword));
  const needsComplexTool = complexInteractive.some(keyword => contentLower.includes(keyword));
  const needsGenuineResearch = researchIndicators.some(keyword => contentLower.includes(keyword));

  // Decision logic - COMPLEX FIRST, then Noah for simple requests
  let needsResearch = false;
  let needsBuilding = false;
  let reasoning = '';

  // Priority 1: Handle complex requests that need both agents
  if (needsGenuineResearch && needsComplexTool) {
    needsResearch = true;
    needsBuilding = true;
    reasoning = 'Complex request requiring research then sophisticated implementation';
  }
  // Priority 2: Complex interactive tools (even if phrased as questions)
  else if (needsComplexTool) {
    needsBuilding = true;
    reasoning = 'Complex interactive tool - delegate to Tinkerer for component retrieval';
  }
  // Priority 3: Genuine creative/research needs (even if phrased as questions)
  else if (needsCreativeThinking) {
    needsResearch = true;
    reasoning = 'Needs genuine creative/sideways thinking - delegate to Wanderer';
  }
  else if (needsGenuineResearch) {
    needsResearch = true;
    reasoning = 'Comprehensive research needed - delegate to Wanderer';
  }
  // Priority 4: Simple tools and advice (only after complex checks)
  else if (isSimpleToolRequest || isSimpleTextTool || isSimpleWebTool || (isBasicAdvice && !needsComplexTool && !needsCreativeThinking && !needsGenuineResearch)) {
    reasoning = 'Simple tool/advice - Noah handles directly for natural flow';
  }
  // Priority 5: Default to Noah for pure conversation
  else {
    reasoning = 'Conversational request - Noah handles directly';
  }

  // Calculate confidence based on clarity of indicators
  const confidence = Math.min(0.9, 
    (needsResearch || needsBuilding) ? 0.8 : 0.9
  );

  return { needsResearch, needsBuilding, confidence, reasoning };
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
  const lastMessage = messages[messages.length - 1]?.content || '';

  const research = await wandererInstance.processRequest({
    id: `research_${Date.now()}`,
    sessionId: context.sessionId,
    content: lastMessage,
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
  const lastMessage = messages[messages.length - 1]?.content || '';
  const buildContent = research
    ? `${lastMessage}\n\nResearch Context:\n${research.content}`
    : lastMessage;

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
async function initializeConversationState(req: NextRequest, context: LoggingContext, skepticMode: boolean): Promise<ConversationState> {
  const startTime = Date.now();
  
  // Extract session information for analytics (privacy-first)
  const userAgent = req.headers.get('user-agent') || undefined;
  const forwardedFor = req.headers.get('x-forwarded-for') || undefined;
  
  // Fire-and-forget session management - zero performance impact
  const sessionPromise = analyticsService.ensureSession(userAgent, forwardedFor);
  const sessionId = await sessionPromise;
  
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
    const { messages, skepticMode } = await withTimeout(parsePromise, 2000);
    
    // Store parsed body in context for logging middleware
    context.requestBody = { messages, skepticMode };

    // Initialize conversation state with analytics (async, zero performance impact)
    const conversationState = await initializeConversationState(req, context, skepticMode || false);

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

    if (safetyCheck.radioSilence) {
      logger.warn('🔴 Radio silence activated - safety violation detected', {
        violationType: safetyCheck.violation?.type,
        reason: safetyCheck.violation?.reason,
        sessionId: conversationState.sessionId?.substring(0, 8) + '...'
      });

      // Noah goes radio silent - no response at all
      // Log the attempted violation for Trust Recovery Protocol tracking
      if (conversationState.conversationId && conversationState.sessionId) {
        conversationState.messageSequence++;
        analyticsService.logMessage(
          conversationState.conversationId,
          conversationState.sessionId,
          conversationState.messageSequence,
          'user',
          `[SAFETY_VIOLATION] ${safetyCheck.violation?.type}: Content filtered`
        );
      }

      // Return empty response - radio silence
      return NextResponse.json({
        content: "",
        status: 'radio_silence',
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
      if (analysis.needsResearch) {
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
        // Noah handles directly
        logger.info('🦉 Noah handling directly...');
        const llmProvider = createLLMProvider('default');
        const generatePromise = llmProvider.generateText({
          messages: messages.map((msg: ChatMessage) => ({
            role: msg.role,
            content: msg.content
          })),
          system: AI_CONFIG.CHAT_SYSTEM_PROMPT,
          model: AI_CONFIG.getModel(),
          temperature: 0.7
        });
        result = await withTimeout(generatePromise, NOAH_TIMEOUT);
      }
    } catch (agentError) {
      logger.error('🚨 Agent orchestration failed, Noah handling directly', { error: agentError });
      agentUsed = 'noah';
      agentStrategy = 'noah_direct_fallback';
      // Fallback to Noah Direct if orchestration fails
      const llmProvider = createLLMProvider();
      const generatePromise = llmProvider.generateText({
        messages: messages.map((msg: ChatMessage) => ({
          role: msg.role,
          content: msg.content
        })),
        system: AI_CONFIG.CHAT_SYSTEM_PROMPT,
        model: AI_CONFIG.getModel(),
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
    }

    // Process for artifacts using established workflow with analytics integration
    const parsed = await ArtifactService.handleArtifactWorkflow(
      result.content,
      lastMessage,
      context.sessionId,
      conversationState
    );

    let noahContent = result.content;

    // If artifact was created, show first 5 lines in chat and redirect to toolbox
    if (parsed.hasArtifact && parsed.title && parsed.content) {
      const lines = result.content.split('\n');
      const firstFiveLines = lines.slice(0, 5).join('\n');
      const hasMoreContent = lines.length > 5;

      if (hasMoreContent) {
        noahContent = `${firstFiveLines}\n\n*I've created a tool for you! Check your toolbox for the complete "${parsed.title}" with all the details.*`;
      } else {
        noahContent = `${result.content}\n\n*This tool has been saved to your toolbox as "${parsed.title}" for easy access.*`;
      }
    }

    const response: ChatResponse = {
      content: noahContent,
      status: 'success',
      agent: 'noah'
    };

    // Include artifact in response for frontend processing
    if (parsed.hasArtifact && parsed.title && parsed.content) {
      response.artifact = {
        title: parsed.title,
        content: parsed.content
      };
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
 * Fast path for simple questions - skip all the complex overhead
 */
function isSimpleQuestion(content: string): boolean {
  const simple = [
    'what is', 'who is', 'when is', 'where is', 'how many', 'what are',
    'capital of', 'population of', 'currency of', 'language of',
    'definition of', 'meaning of', 'explain', 'define'
  ];
  
  const contentLower = content.toLowerCase();
  return simple.some(pattern => contentLower.includes(pattern)) && 
         content.length < 100 && // Short questions only
         !contentLower.includes('create') && 
         !contentLower.includes('build') && 
         !contentLower.includes('make');
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
    const { messages, skepticMode } = await withTimeout(parsePromise, 2000);
    
    // Store parsed body in context for logging middleware
    context.requestBody = { messages, skepticMode };

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
    const conversationState = await initializeConversationState(req, context, skepticMode || false);

    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // 🛡️ SAFETY CHECK - Required for all paths, including fast path
    const safetyCheck = await NoahSafetyService.checkUserMessage(
      lastMessage,
      conversationState.sessionId || undefined,
      conversationState.conversationId || undefined,
      messages.slice(0, -1).map(m => m.content)
    );

    if (safetyCheck.radioSilence) {
      logger.warn('🔴 Radio silence activated - safety violation detected', {
        violationType: safetyCheck.violation?.type,
        reason: safetyCheck.violation?.reason,
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
          `[SAFETY_VIOLATION] ${safetyCheck.violation?.type}: Content filtered`
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
    if (isSimpleQuestion(lastMessage)) {
      logger.info('🚀 Fast path for simple question (post-safety)');
      
      // Log user message (required for analytics)
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

      const model = AI_CONFIG.getProvider() === 'openai' ? openai(AI_CONFIG.getModel()) : anthropic(AI_CONFIG.getModel());
      
      return streamText({
        model,
        messages: messages.map((msg: ChatMessage) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })),
        system: "You are Noah, a helpful AI assistant. Give direct, accurate answers to simple questions.",
        temperature: 0.3, // Lower temperature for factual questions
        maxTokens: 150,   // Limit response length
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
        lastMessage
      );
    }

    // Noah analyzes and decides internally (same logic as existing)
    const analysis = analyzeRequest(lastMessage);
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
      // Handle multi-agent orchestration (reuse existing logic)
      if (analysis.needsResearch) {
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
        // Noah handles directly with streaming
        logger.info('🦉 Noah handling directly with streaming...');
        const model = AI_CONFIG.getProvider() === 'openai' ? openai(AI_CONFIG.getModel()) : anthropic(AI_CONFIG.getModel());
        
        return streamText({
          model,
          messages: messages.map((msg: ChatMessage) => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
          })),
          system: AI_CONFIG.CHAT_SYSTEM_PROMPT,
          temperature: 0.7,
          onFinish: async (completion) => {
            const responseTime = Date.now() - startTime;
            logger.info('✅ Noah streaming response completed', {
              responseLength: completion.text.length,
              responseTime
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

            // Process artifacts in background (non-blocking)
            ArtifactService.handleArtifactWorkflow(
              completion.text,
              lastMessage,
              context.sessionId,
              conversationState
            ).catch(error => logger.warn('Artifact processing failed', { error }));
          }
        }).toTextStreamResponse();
      }
    } catch (agentError) {
      logger.error('🚨 Agent orchestration failed, Noah streaming directly', { error: agentError });
      agentUsed = 'noah';
      agentStrategy = 'noah_direct_fallback';
      
      // Fallback to Noah Direct streaming
      const model = AI_CONFIG.getProvider() === 'openai' ? openai(AI_CONFIG.getModel()) : anthropic(AI_CONFIG.getModel());
      return streamText({
        model,
        messages: messages.map((msg: ChatMessage) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })),
        system: AI_CONFIG.CHAT_SYSTEM_PROMPT,
        temperature: 0.7,
        onFinish: async (completion) => {
          const responseTime = Date.now() - startTime;
          logger.info('✅ Noah fallback streaming response completed', {
            responseLength: completion.text.length,
            responseTime
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
      lastMessage,
      context.sessionId,
      conversationState
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

    // Return pre-computed response as a stream
    const model = AI_CONFIG.getProvider() === 'openai' ? openai(AI_CONFIG.getModel()) : anthropic(AI_CONFIG.getModel());
    return streamText({
      model,
      messages: [{ role: 'assistant', content: finalContent }],
      temperature: 0,
    }).toTextStreamResponse();

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
 * Supports both streaming and non-streaming based on request headers
 */
export async function POST(req: NextRequest): Promise<NextResponse | Response> {
  // Check if client supports streaming
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