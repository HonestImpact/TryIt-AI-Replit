// Knowledge Service - RAG implementation for Noah
import type { KnowledgeResult } from '../agents/types';
import { vectorStore } from '../../../rag/vector-store';
import { createLogger } from '../logger';
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
      await vectorStore.initialize();
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
    filter?: Record<string, any>;
  }): Promise<KnowledgeResult[]> {
    try {
      await this.initialize();

      const {
        maxResults = AI_CONFIG.RAG_CONTEXT_LIMIT,
        minRelevanceScore = AI_CONFIG.RAG_RELEVANCE_THRESHOLD,
        filter = {}
      } = options || {};

      logger.info('🔍 Searching knowledge base', { 
        query: query.substring(0, 100),
        maxResults,
        minRelevanceScore
      });

      const searchResults = await vectorStore.search(query, {
        maxResults,
        minRelevanceScore,
        filter
      });

      const knowledgeResults: KnowledgeResult[] = searchResults.map((result: any) => ({
        item: {
          content: result.content,
          type: result.metadata.type,
          metadata: {
            id: result.id,
            title: result.metadata.title,
            category: result.metadata.category,
            timestamp: result.metadata.timestamp,
            source: result.metadata.source,
            relevance: result.score
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
      
      // If RAG is not enabled or fails, return empty results
      if (!AI_CONFIG.RAG_ENABLED) {
        logger.info('ℹ️ RAG is disabled, returning empty results');
        return [];
      }
      
      // Return empty results on error to not break the flow
      return [];
    }
  }

  /**
   * Add knowledge to the vector store
   */
  async addKnowledge(
    id: string,
    content: string,
    metadata: {
      source: string;
      type: 'knowledge' | 'artifact' | 'conversation';
      title?: string;
      category?: string;
    }
  ): Promise<void> {
    try {
      await this.initialize();

      await vectorStore.addDocuments([{
        id,
        content,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString()
        }
      }]);

      logger.info('✅ Knowledge added', { id, contentLength: content.length });

    } catch (error) {
      logger.error('💥 Failed to add knowledge', { error, id });
      throw error;
    }
  }

  /**
   * Update existing knowledge
   */
  async updateKnowledge(
    id: string,
    content: string,
    metadata: {
      source: string;
      type: 'knowledge' | 'artifact' | 'conversation';
      title?: string;
      category?: string;
    }
  ): Promise<void> {
    try {
      await this.initialize();

      await vectorStore.updateDocument(id, content, {
        ...metadata,
        timestamp: new Date().toISOString()
      });

      logger.info('✅ Knowledge updated', { id });

    } catch (error) {
      logger.error('💥 Failed to update knowledge', { error, id });
      throw error;
    }
  }

  /**
   * Remove knowledge from the vector store
   */
  async removeKnowledge(ids: string[]): Promise<void> {
    try {
      await this.initialize();

      await vectorStore.deleteDocuments(ids);

      logger.info('✅ Knowledge removed', { count: ids.length });

    } catch (error) {
      logger.error('💥 Failed to remove knowledge', { error, count: ids.length });
      throw error;
    }
  }

  /**
   * Get knowledge base statistics
   */
  async getStats(): Promise<{ documentCount: number; isHealthy: boolean }> {
    try {
      await this.initialize();

      const stats = await vectorStore.getStats();
      const isHealthy = await vectorStore.healthCheck();

      return {
        documentCount: stats.count,
        isHealthy
      };

    } catch (error) {
      logger.error('💥 Failed to get knowledge stats', { error });
      return {
        documentCount: 0,
        isHealthy: false
      };
    }
  }

  /**
   * Health check for the knowledge service
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.initialize();
      return await vectorStore.healthCheck();
    } catch (error) {
      logger.error('💥 Knowledge service health check failed', { error });
      return false;
    }
  }
}

const KnowledgeServiceSingleton = new KnowledgeService();
export default KnowledgeServiceSingleton;