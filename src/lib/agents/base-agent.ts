// Base agent class for all Noah agents
export interface AgentCapability {
  name: string;
  description: string;
  version: string;
}

export interface AgentRequest {
  id: string;
  sessionId: string;
  content: string;
  timestamp: Date;
}

export interface AgentResponse {
  requestId: string;
  agentId: string;
  content: string;
  confidence: number;
  reasoning: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface LLMProvider {
  generateText(params: any): Promise<{ content: string }>;
}

export interface AgentConfig {
  temperature?: number;
  maxTokens?: number;
}

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