// Analytics Database Layer - Elegant PostgreSQL integration for Noah
// Zero-performance-impact, async-first, error-resilient implementation

import { createLogger } from '@/lib/logger';
import type { 
  SessionData, 
  ConversationData, 
  MessageData, 
  GeneratedToolData, 
  ToolUsageEvent,
  AnalyticsQueryOptions,
  PerformanceMetrics
} from './types';

const logger = createLogger('analytics-db');

class AnalyticsDatabase {
  private connectionString: string;
  private retryAttempts = 3;
  private timeoutMs = 5000;

  constructor() {
    // Use Replit PostgreSQL connection
    this.connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@helium/heliumdb';
  }

  /**
   * Execute database query with elegant error handling and performance monitoring
   */
  private async executeQuery<T = any>(
    query: string, 
    params: any[] = [], 
    options: AnalyticsQueryOptions = {}
  ): Promise<T | null> {
    const startTime = Date.now();
    const { timeout = this.timeoutMs, retries = this.retryAttempts, skipOnError = true } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Dynamic import for PostgreSQL client to avoid affecting app startup
        const { Client } = await import('pg');
        const client = new Client({ connectionString: this.connectionString });

        // Timeout protection
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Database query timeout after ${timeout}ms`)), timeout);
        });

        const queryPromise = (async () => {
          await client.connect();
          try {
            const result = await client.query(query, params);
            return result.rows;
          } finally {
            await client.end();
          }
        })();

        const result = await Promise.race([queryPromise, timeoutPromise]);
        
        const duration = Date.now() - startTime;
        logger.debug('Analytics query executed', { 
          duration, 
          attempt, 
          query: query.substring(0, 100) + '...' 
        });

        return result as T;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const duration = Date.now() - startTime;
        
        logger.warn(`Analytics query failed (attempt ${attempt}/${retries})`, { 
          error: lastError.message, 
          duration,
          query: query.substring(0, 50) + '...'
        });

        if (attempt === retries) {
          if (skipOnError) {
            logger.error('Analytics query failed after all retries - skipping', { 
              error: lastError.message,
              totalDuration: Date.now() - startTime
            });
            return null;
          } else {
            throw lastError;
          }
        }

        // Exponential backoff for retries
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }

    return null;
  }

  /**
   * Get or create user session with elegant fingerprint handling
   */
  async getOrCreateSession(sessionData: SessionData): Promise<string | null> {
    try {
      // First, try to get existing session
      const existingSession = await this.executeQuery<{ id: string }[]>(
        'SELECT id FROM user_sessions WHERE session_fingerprint = $1',
        [sessionData.sessionFingerprint]
      );

      if (existingSession && existingSession.length > 0) {
        // Update last_seen timestamp
        await this.executeQuery(
          'UPDATE user_sessions SET last_seen = NOW() WHERE id = $1',
          [existingSession[0].id]
        );
        return existingSession[0].id;
      }

      // Create new session
      const newSession = await this.executeQuery<{ id: string }[]>(
        `INSERT INTO user_sessions (session_fingerprint, environment) 
         VALUES ($1, $2) 
         RETURNING id`,
        [sessionData.sessionFingerprint, sessionData.environment]
      );

      return newSession && newSession.length > 0 ? newSession[0].id : null;

    } catch (error) {
      logger.error('Failed to get or create session', { 
        error: error instanceof Error ? error.message : String(error),
        fingerprint: sessionData.sessionFingerprint.substring(0, 10) + '...'
      });
      return null;
    }
  }

  /**
   * Create conversation record with elegant data validation
   */
  async createConversation(conversationData: ConversationData): Promise<string | null> {
    try {
      const result = await this.executeQuery<{ id: string }[]>(
        `INSERT INTO conversations (
          session_id, conversation_sequence, initial_trust_level, skeptic_mode_enabled,
          conversation_length, conversation_duration_ms, user_engagement_level,
          completion_status, agent_strategy
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING id`,
        [
          conversationData.sessionId,
          conversationData.conversationSequence,
          conversationData.initialTrustLevel || 50,
          conversationData.skepticModeEnabled,
          conversationData.conversationLength,
          conversationData.conversationDurationMs,
          conversationData.userEngagementLevel,
          conversationData.completionStatus,
          conversationData.agentStrategy
        ]
      );

      return result && result.length > 0 ? result[0].id : null;

    } catch (error) {
      logger.error('Failed to create conversation', { 
        error: error instanceof Error ? error.message : String(error),
        sessionId: conversationData.sessionId
      });
      return null;
    }
  }

  /**
   * Log message with comprehensive metadata
   */
  async logMessage(messageData: MessageData): Promise<string | null> {
    try {
      const result = await this.executeQuery<{ id: string }[]>(
        `INSERT INTO messages (
          conversation_id, session_id, message_sequence, role, content_length,
          word_count, message_type, response_time_ms, agent_involved
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING id`,
        [
          messageData.conversationId,
          messageData.sessionId,
          messageData.messageSequence,
          messageData.role,
          messageData.contentLength,
          messageData.wordCount,
          messageData.messageType,
          messageData.responseTimeMs,
          messageData.agentInvolved
        ]
      );

      return result && result.length > 0 ? result[0].id : null;

    } catch (error) {
      logger.error('Failed to log message', { 
        error: error instanceof Error ? error.message : String(error),
        conversationId: messageData.conversationId
      });
      return null;
    }
  }

  /**
   * Log generated tool with deduplication support
   */
  async logGeneratedTool(toolData: GeneratedToolData): Promise<string | null> {
    try {
      const result = await this.executeQuery<{ id: string }[]>(
        `INSERT INTO generated_tools (
          conversation_id, session_id, message_id, tool_hash, title,
          content_length, tool_type, tool_category, generation_time_ms,
          generation_agent, user_message_length
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING id`,
        [
          toolData.conversationId,
          toolData.sessionId,
          toolData.messageId,
          toolData.toolHash,
          toolData.title,
          toolData.contentLength,
          toolData.toolType,
          toolData.toolCategory,
          toolData.generationTimeMs,
          toolData.generationAgent,
          toolData.userMessageLength
        ]
      );

      return result && result.length > 0 ? result[0].id : null;

    } catch (error) {
      logger.error('Failed to log generated tool', { 
        error: error instanceof Error ? error.message : String(error),
        title: toolData.title
      });
      return null;
    }
  }

  /**
   * Log tool usage event for adoption tracking
   */
  async logToolUsageEvent(eventData: ToolUsageEvent): Promise<boolean> {
    try {
      await this.executeQuery(
        `INSERT INTO tool_usage_events (
          tool_id, session_id, event_type, usage_context, interaction_duration_ms
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          eventData.toolId,
          eventData.sessionId,
          eventData.eventType,
          eventData.usageContext,
          eventData.interactionDurationMs
        ]
      );

      return true;

    } catch (error) {
      logger.error('Failed to log tool usage event', { 
        error: error instanceof Error ? error.message : String(error),
        toolId: eventData.toolId,
        eventType: eventData.eventType
      });
      return false;
    }
  }

  /**
   * Update conversation completion status
   */
  async updateConversationStatus(
    conversationId: string, 
    status: 'completed' | 'abandoned' | 'error',
    finalTrustLevel?: number
  ): Promise<boolean> {
    try {
      await this.executeQuery(
        `UPDATE conversations 
         SET completion_status = $1, final_trust_level = $2, updated_at = NOW()
         WHERE id = $3`,
        [status, finalTrustLevel, conversationId]
      );

      return true;

    } catch (error) {
      logger.error('Failed to update conversation status', { 
        error: error instanceof Error ? error.message : String(error),
        conversationId,
        status
      });
      return false;
    }
  }

  /**
   * Health check for analytics database
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.executeQuery(
        'SELECT 1 as health_check',
        [],
        { timeout: 2000, retries: 1, skipOnError: false }
      );
      return result !== null;
    } catch (error) {
      logger.error('Analytics database health check failed', { 
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
}

// Export singleton instance for consistent database access
export const analyticsDb = new AnalyticsDatabase();