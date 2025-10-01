import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as path from 'path';
import { createLogger } from '@/lib/logger';
import type { MemoryContext, MemoryEntity } from '@/lib/agents/types';

const logger = createLogger('mcp-memory-service');

interface Entity {
  name: string;
  entityType: string;
  observations: string[];
}

export class MCPMemoryService {
  private static instance: MCPMemoryService | null = null;
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private isInitialized = false;
  private isAvailable = false;
  private memoryFilePath: string;

  private constructor() {
    const defaultPath = path.resolve(process.cwd(), 'noah-memory-data', 'memory.json');
    this.memoryFilePath = process.env.MEMORY_FILE_PATH || defaultPath;
  }

  static getInstance(): MCPMemoryService {
    if (!MCPMemoryService.instance) {
      MCPMemoryService.instance = new MCPMemoryService();
    }
    return MCPMemoryService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('🧠 Initializing MCP Memory Service...', {
        memoryPath: this.memoryFilePath
      });

      this.transport = new StdioClientTransport({
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory'],
        env: {
          ...process.env,
          MEMORY_FILE_PATH: this.memoryFilePath
        }
      });

      this.client = new Client(
        {
          name: 'noah-memory-client',
          version: '1.0.0'
        },
        {
          capabilities: {}
        }
      );

      await this.client.connect(this.transport);

      await this.testConnection();

      this.isInitialized = true;
      this.isAvailable = true;

      logger.info('✅ MCP Memory Service initialized successfully');
    } catch (error) {
      logger.warn('⚠️ MCP Memory Service initialization failed, memory features will be disabled', {
        error: error instanceof Error ? error.message : String(error)
      });
      this.isInitialized = true;
      this.isAvailable = false;
      
      if (this.transport) {
        try {
          await this.transport.close();
        } catch {}
      }
      this.transport = null;
      this.client = null;
    }
  }

  private async testConnection(): Promise<void> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    try {
      const tools = await this.client.listTools();
      logger.debug('MCP tools available', {
        toolCount: tools.tools.length,
        tools: tools.tools.map((t: any) => t.name)
      });

      if (tools.tools.length === 0) {
        throw new Error('No tools available from memory server');
      }
    } catch (error) {
      logger.error('Connection test failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  async retrieveSessionContext(sessionId: string): Promise<MemoryContext | null> {
    if (!this.isAvailable || !this.client) {
      logger.debug('Memory service unavailable, returning null context');
      return null;
    }

    try {
      logger.debug('Retrieving memory context for session', { sessionId });

      const result = await this.client.callTool({
        name: 'search_nodes',
        arguments: {
          query: sessionId
        }
      });

      const entities = this.parseToolResult(result);

      if (entities.length === 0) {
        logger.debug('No existing memory found for session', { sessionId });
        return null;
      }

      return {
        entities,
        sessionId,
        retrievedAt: new Date()
      };
    } catch (error) {
      logger.warn('Failed to retrieve memory context', {
        sessionId,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  private parseToolResult(result: any): MemoryEntity[] {
    const entities: MemoryEntity[] = [];

    try {
      if (!result || !result.content || !Array.isArray(result.content)) {
        return entities;
      }

      for (const item of result.content) {
        if (item.type === 'text' && item.text) {
          try {
            const data = JSON.parse(item.text);
            if (data.entities && Array.isArray(data.entities)) {
              for (const entity of data.entities) {
                if (this.isValidEntity(entity)) {
                  entities.push({
                    name: entity.name,
                    entityType: this.mapEntityType(entity.entityType),
                    observations: entity.observations || []
                  });
                }
              }
            }
          } catch (parseError) {
            logger.debug('Could not parse entity data', { text: item.text });
          }
        }
      }
    } catch (error) {
      logger.warn('Error parsing tool result', {
        error: error instanceof Error ? error.message : String(error)
      });
    }

    return entities;
  }

  private isValidEntity(entity: unknown): entity is Entity {
    if (!entity || typeof entity !== 'object') return false;

    const e = entity as Record<string, unknown>;

    return (
      typeof e.name === 'string' &&
      typeof e.entityType === 'string' &&
      Array.isArray(e.observations)
    );
  }

  private mapEntityType(type: string): MemoryEntity['entityType'] {
    const typeMap: Record<string, MemoryEntity['entityType']> = {
      'preference': 'user_preference',
      'user_preference': 'user_preference',
      'theme': 'conversation_theme',
      'conversation_theme': 'conversation_theme',
      'tool': 'tool_result',
      'tool_result': 'tool_result',
      'challenge': 'challenge_event',
      'challenge_event': 'challenge_event',
      'trust': 'trust_signal',
      'trust_signal': 'trust_signal'
    };

    return typeMap[type] || 'user_preference';
  }

  async storeObservation(
    sessionId: string,
    entityName: string,
    entityType: MemoryEntity['entityType'],
    observation: string
  ): Promise<void> {
    if (!this.isAvailable || !this.client) {
      logger.debug('Memory service unavailable, skipping observation storage');
      return;
    }

    try {
      logger.debug('Storing memory observation', {
        sessionId,
        entityName,
        entityType
      });

      const fullEntityName = `${sessionId}_${entityName}`;

      await this.client.callTool({
        name: 'create_entities',
        arguments: {
          entities: [{
            name: fullEntityName,
            entityType,
            observations: [observation]
          }]
        }
      });

      logger.debug('Memory observation stored successfully');
    } catch (error) {
      logger.warn('Failed to store memory observation', {
        sessionId,
        entityName,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async shutdown(): Promise<void> {
    if (this.transport) {
      logger.info('Shutting down MCP Memory Service...');
      try {
        await this.transport.close();
      } catch (error) {
        logger.warn('Error closing transport', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
      this.transport = null;
      this.client = null;
      this.isAvailable = false;
    }
  }

  getStatus(): { initialized: boolean; available: boolean } {
    return {
      initialized: this.isInitialized,
      available: this.isAvailable
    };
  }
}

export const mcpMemoryService = MCPMemoryService.getInstance();
