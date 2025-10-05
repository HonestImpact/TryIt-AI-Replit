// Wanderer Agent - Research Specialist with Web Search
import { BaseAgent } from './base-agent';
import { createLogger } from '../logger';
import { PerplexitySearchService } from './perplexity-search';
import { getModelId } from '../providers/env-config';
import type { AgentSharedResources } from './shared-resources';
import type {
  AgentCapability,
  AgentRequest,
  AgentResponse,
  LLMProvider,
  AgentConfig
} from './types';

export class WandererAgent extends BaseAgent {
  private readonly logger = createLogger('wanderer-agent');
  private perplexitySearch: PerplexitySearchService | null = null;

  constructor(
    llmProvider: LLMProvider,
    config: AgentConfig = {},
    _sharedResources?: AgentSharedResources // Available for future enhancement
  ) {
    const capabilities: AgentCapability[] = [
      {
        name: 'deep-research',
        description: 'Conducts comprehensive research using RAG and web search',
        version: '2.0.0'
      }
    ];

    super('wanderer', 'Wanderer - Research Specialist', capabilities, llmProvider, {
      temperature: 0.75,
      maxTokens: 2500,
      ...config
    });

    // Initialize web search if available
    try {
      this.perplexitySearch = new PerplexitySearchService();
      this.logger.info('Web search capability enabled');
    } catch (error) {
      this.logger.warn('Web search not available', { error });
    }
  }

  async processRequest(request: AgentRequest): Promise<AgentResponse> {
    try {
      this.logger.info('Wanderer processing research request', {
        requestId: request.id,
        sessionId: request.sessionId
      });

      // Check if this needs current/real-time information
      const needsWebSearch = this.requiresWebSearch(request.content);

      if (needsWebSearch && this.perplexitySearch) {
        this.logger.info('Using web search for current information', { requestId: request.id });

        const searchResult = await this.perplexitySearch.search(
          request.content,
          'You are a research specialist. Provide comprehensive, well-researched answers with current information. Be precise and cite sources when available.'
        );

        // Format response with citations
        let content = searchResult.content;
        if (searchResult.citations.length > 0) {
          content += '\n\n**Sources:**\n' + searchResult.citations.map((url, i) => `${i + 1}. ${url}`).join('\n');
        }

        return {
          requestId: request.id,
          agentId: this.id,
          content,
          confidence: 0.9,
          reasoning: 'Research completed with live web search',
          timestamp: new Date(),
          metadata: {
            researchStrategy: 'web-search',
            domain: 'general',
            citationCount: searchResult.citations.length
          }
        };
      }

      // Fall back to LLM knowledge for non-current queries
      const result = await this.llmProvider.generateText({
        messages: [{ role: 'user', content: request.content }],
        system: this.getSystemPrompt(),
        model: getModelId('research'),
        temperature: 0.75
      });

      return {
        requestId: request.id,
        agentId: this.id,
        content: result.content,
        confidence: 0.8,
        reasoning: 'Research analysis completed',
        timestamp: new Date(),
        metadata: {
          researchStrategy: 'direct-analysis',
          domain: 'general'
        }
      };

    } catch (error) {
      this.logger.error('Wanderer research failed', { error });
      return this.generateBasicResponse(request, error);
    }
  }

  private requiresWebSearch(query: string): boolean {
    const queryLower = query.toLowerCase();
    
    // Keywords indicating need for current information
    const currentInfoKeywords = [
      'current', 'latest', 'recent', 'today', 'now', 'this year', 'this month',
      '2024', '2025', 'state of', 'trends', 'what is happening', 'what\'s happening',
      'news', 'updated', 'status of', 'currently'
    ];

    return currentInfoKeywords.some(keyword => queryLower.includes(keyword));
  }

  protected getSystemPrompt(): string {
    return `You are Wanderer, the research specialist for Noah's multi-agent system.

Your role is to conduct thorough research and analysis on user requests. You excel at:
- Breaking down complex topics into key components
- Identifying different perspectives and approaches
- Synthesizing information into actionable insights
- Providing context for implementation decisions

Provide comprehensive, well-researched responses that give Noah's team everything they need to proceed with confidence.`;
  }
}