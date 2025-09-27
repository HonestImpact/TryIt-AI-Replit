// Practical Agent (Tinkerer) - Technical Implementation Specialist (Simplified for initial deployment)
import { BaseAgent } from './base-agent';
import { createLogger } from '../logger';
import type { AgentSharedResources } from './shared-resources';
import type {
  AgentCapability,
  AgentRequest,
  AgentResponse,
  LLMProvider,
  AgentConfig
} from './types';

export class PracticalAgent extends BaseAgent {
  private readonly logger = createLogger('tinkerer-agent');

  constructor(
    llmProvider: LLMProvider,
    config: AgentConfig = {},
    sharedResources?: AgentSharedResources
  ) {
    const capabilities: AgentCapability[] = [
      {
        name: 'technical-implementation',
        description: 'Creates production-ready code with enterprise standards',
        version: '2.0.0'
      }
    ];

    super('tinkerer', 'Tinkerer - Advanced Technical Implementation', capabilities, llmProvider, {
      temperature: 0.3,
      maxTokens: 4000,
      ...config
    });
  }

  async processRequest(request: AgentRequest): Promise<AgentResponse> {
    this.logger.info('Tinkerer processing implementation request', {
      requestId: request.id,
      contentLength: request.content.length
    });

    try {
      // Simplified implementation for initial deployment
      const result = await this.llmProvider.generateText({
        messages: [{ role: 'user', content: request.content }],
        system: this.getSystemPrompt(),
        model: 'claude-sonnet-4-20250514',
        temperature: 0.3
      });

      return {
        requestId: request.id,
        agentId: this.id,
        content: result.content,
        confidence: 0.9,
        reasoning: 'Technical implementation completed',
        timestamp: new Date(),
        metadata: {
          implementationStrategy: 'direct-build',
          componentsUsed: ['custom-generation']
        }
      };

    } catch (error) {
      this.logger.error('Tinkerer processing failed', { error });
      return this.generateBasicResponse(request, error);
    }
  }

  protected getSystemPrompt(): string {
    return `You are the Tinkerer, an advanced AI agent specialized in enterprise-grade technical implementation.

CORE IDENTITY:
- You excel at building sophisticated, production-ready solutions
- You prioritize code quality, maintainability, and performance
- You create complete, working implementations

YOUR TECHNICAL STANDARDS:
- Modern Web Standards: HTML5, CSS3, ES6+ JavaScript
- Accessibility: WCAG 2.1 AA compliance with proper ARIA labels
- Responsive Design: Mobile-first approach with flexible layouts
- Performance: Optimized DOM manipulation and resource loading
- Security: Input validation and XSS prevention

TOOL CREATION FORMAT:
When building tools, use this exact format:

TITLE: [Clear, descriptive tool name]
TOOL:
[Complete HTML with embedded CSS and JavaScript]

REASONING:
[Brief explanation of design choices]

Create functional, self-contained solutions that work immediately when saved as .html files.`;
  }
}