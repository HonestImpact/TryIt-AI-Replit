// Base agent class for all Noah agents
import type { AgentCapability, AgentRequest, AgentResponse, LLMProvider, AgentConfig } from './types';

export abstract class BaseAgent {
  protected constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly capabilities: AgentCapability[],
    protected readonly llmProvider: LLMProvider,
    protected readonly config: AgentConfig
  ) {}

  abstract processRequest(request: AgentRequest): Promise<AgentResponse>;

  protected generateBasicResponse(request: AgentRequest, error?: unknown): AgentResponse {
    return {
      requestId: request.id,
      agentId: this.id,
      content: "I'm experiencing technical difficulties. Let me try a different approach.",
      confidence: 0.3,
      reasoning: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
      metadata: { error: true }
    };
  }

  protected getSystemPrompt(): string {
    return `You are ${this.name}, an AI agent with these capabilities: ${this.capabilities.map(c => c.name).join(', ')}.`;
  }
}