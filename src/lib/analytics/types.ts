// Analytics Types - Elegant type definitions for Noah's analytics system
// Following the Golden Rule: Best, Cleanest, Fastest, Most Logical, Most Elegant

export interface SessionData {
  sessionFingerprint: string;
  environment: 'development' | 'preview' | 'production';
}

export interface ConversationData {
  sessionId: string;
  conversationSequence: number;
  initialTrustLevel?: number;
  finalTrustLevel?: number;
  skepticModeEnabled: boolean;
  conversationLength: number;
  conversationDurationMs?: number;
  userEngagementLevel?: 'low' | 'medium' | 'high' | 'very-high';
  completionStatus: 'active' | 'completed' | 'abandoned' | 'error';
  agentStrategy?: string; // noah_direct, noah_wanderer, noah_tinkerer, noah_wanderer_tinkerer
}

export interface MessageData {
  conversationId: string;
  sessionId: string;
  messageSequence: number;
  role: 'user' | 'assistant';
  contentLength: number;
  wordCount: number;
  messageType?: 'question' | 'request' | 'challenge' | 'feedback' | 'response' | 'tool-generation';
  responseTimeMs?: number;
  agentInvolved?: 'noah' | 'wanderer' | 'tinkerer';
}

export interface GeneratedToolData {
  conversationId: string;
  sessionId: string;
  messageId?: string;
  toolHash?: string;
  title: string;
  contentLength: number;
  toolType?: string;
  toolCategory?: string;
  generationTimeMs: number;
  generationAgent: 'noah' | 'wanderer' | 'tinkerer';
  userMessageLength: number;
}

export interface ToolUsageEvent {
  toolId: string;
  sessionId: string;
  eventType: 'generated' | 'viewed' | 'interacted' | 'downloaded' | 'shared' | 'reused';
  usageContext?: 'same-session' | 'different-session' | 'recycled';
  interactionDurationMs?: number;
}

export interface AnalyticsQueryOptions {
  timeout?: number;
  retries?: number;
  skipOnError?: boolean;
}

export interface PerformanceMetrics {
  operationName: string;
  durationMs: number;
  success: boolean;
  error?: string;
}