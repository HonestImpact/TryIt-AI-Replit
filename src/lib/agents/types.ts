// Type definitions for agent system
export interface ChatMessage {
  role: string;
  content: string;
  timestamp?: Date;
}

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
  metadata?: Record<string, unknown>;
}

export interface LLMProvider {
  generateText(params: {
    messages: Array<{ role: string; content: string }>;
    system?: string;
    model: string;
    temperature?: number;
  }): Promise<{ content: string }>;
}

export interface AgentConfig {
  temperature?: number;
  maxTokens?: number;
}

export interface KnowledgeResult {
  item: {
    content: string;
    type: string;
    metadata: Record<string, unknown>;
  };
  context?: string;
}

export interface MemoryEntity {
  name: string;
  entityType: 'user_preference' | 'conversation_theme' | 'tool_result' | 'challenge_event' | 'trust_signal';
  observations: string[];
}

export interface MemoryContext {
  entities: MemoryEntity[];
  sessionId: string;
  retrievedAt: Date;
}