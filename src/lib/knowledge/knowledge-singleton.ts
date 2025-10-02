// Knowledge Service - ChromaDB Vector Store Integration for Noah
import type { KnowledgeResult } from '../agents/types';
import { createLogger } from '../logger';
import { vectorStore } from '../../../rag/vector-store';
import { AI_CONFIG } from '../ai-config';

const logger = createLogger('knowledge-service');

class KnowledgeService {
  private initialized = false;

  /**
   * Initialize the knowledge service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Simple initialization - no external dependencies
      this.initialized = true;
      logger.info('✅ Knowledge service initialized');
    } catch (error) {
      logger.error('💥 Knowledge service initialization failed', { error });
      throw error;
    }
  }

  /**
   * Search the knowledge base using semantic similarity
   */
  async search(query: string, options?: { 
    maxResults?: number; 
    minRelevanceScore?: number;
    filter?: Record<string, unknown>;
  }): Promise<KnowledgeResult[]> {
    try {
      await this.initialize();

      const {
        maxResults = AI_CONFIG.RAG_CONTEXT_LIMIT,
        minRelevanceScore = AI_CONFIG.RAG_RELEVANCE_THRESHOLD,
        filter = {}
      } = options || {};

      logger.info('🔍 Searching knowledge base via ChromaDB', { 
        query: query.substring(0, 100),
        maxResults,
        minRelevanceScore
      });

      // Search ChromaDB vector store
      const searchResults = await vectorStore.search(query, {
        maxResults,
        minRelevanceScore,
        filter
      });

      // Convert to KnowledgeResult format
      const knowledgeResults: KnowledgeResult[] = searchResults.map(result => ({
        item: {
          content: result.content,
          type: result.metadata.type,
          metadata: {
            id: result.id,
            source: result.metadata.source,
            timestamp: result.metadata.timestamp,
            category: result.metadata.category,
            relevanceScore: result.score
          }
        }
      }));

      logger.info('✅ Knowledge search completed', { 
        resultsFound: knowledgeResults.length,
        query: query.substring(0, 50)
      });

      return knowledgeResults;

    } catch (error) {
      logger.error('💥 Knowledge search failed', { error, query: query.substring(0, 50) });
      
      // Return empty results on error - don't block the system
      return [];
    }
  }

  /**
   * Health check for the knowledge service
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.initialize();
      return this.initialized;
    } catch (error) {
      logger.error('💥 Knowledge service health check failed', { error });
      return false;
    }
  }
}

// Export singleton instance
const knowledgeService = new KnowledgeService();
export default knowledgeService;