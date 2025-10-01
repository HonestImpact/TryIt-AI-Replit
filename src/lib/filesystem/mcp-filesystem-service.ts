import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createLogger } from '@/lib/logger';
import type { FileOperation, FilesystemServiceStatus } from './types';
import { FileNamingStrategy } from './naming-strategy';

const logger = createLogger('mcp-filesystem-service');

export class MCPFilesystemService {
  private static instance: MCPFilesystemService | null = null;
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private isInitialized = false;
  private isAvailable = false;
  private allowedDirectories: string[] = [];
  private pendingOperations = new Map<string, FileOperation>();

  private constructor() {
    // Initialize allowed directories - ONLY Noah-specific directories, NOT entire project
    const projectRoot = process.cwd();
    this.allowedDirectories = [
      path.join(projectRoot, 'noah-tools'),
      path.join(projectRoot, 'noah-thinking'),
      path.join(projectRoot, 'noah-sessions'),
      path.join(projectRoot, 'noah-reports')
    ];
  }

  static getInstance(): MCPFilesystemService {
    if (!MCPFilesystemService.instance) {
      MCPFilesystemService.instance = new MCPFilesystemService();
    }
    return MCPFilesystemService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('📁 Initializing MCP Filesystem Service...', {
        allowedDirs: this.allowedDirectories.map(dir => path.basename(dir))
      });

      // Ensure allowed directories exist
      await this.ensureDirectoriesExist();

      // Initialize MCP client transport
      this.transport = new StdioClientTransport({
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', ...this.allowedDirectories],
        env: {
          ...process.env,
          XDG_CONFIG_HOME: process.env.XDG_CONFIG_HOME || '/tmp/.config',
          HOME: process.env.HOME || '/tmp'
        }
      });

      this.client = new Client(
        {
          name: 'noah-filesystem-client',
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

      logger.info('✅ MCP Filesystem Service initialized successfully');
    } catch (error) {
      logger.warn('⚠️ MCP Filesystem Service initialization failed, file operations will be disabled', {
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

  private async ensureDirectoriesExist(): Promise<void> {
    for (const dir of this.allowedDirectories) {
      try {
        await fs.mkdir(dir, { recursive: true });
        logger.debug('Directory ensured', { dir: path.basename(dir) });
      } catch (error) {
        logger.warn('Failed to create directory', {
          dir: path.basename(dir),
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  private async testConnection(): Promise<void> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    try {
      const tools = await this.client.listTools();
      logger.debug('MCP filesystem tools available', {
        toolCount: tools.tools.length,
        tools: tools.tools.map((t: any) => t.name)
      });

      if (tools.tools.length === 0) {
        throw new Error('No tools available from filesystem server');
      }
    } catch (error) {
      logger.error('Connection test failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  getStatus(): FilesystemServiceStatus {
    return {
      available: this.isAvailable,
      initialized: this.isInitialized,
      allowedDirectories: this.allowedDirectories
    };
  }

  /**
   * Propose a file operation (requires user approval)
   */
  proposeFileOperation(operation: FileOperation): string {
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Validate path is within allowed directories
    const absolutePath = path.resolve(operation.path);
    if (!FileNamingStrategy.isPathAllowed(absolutePath, this.allowedDirectories)) {
      logger.warn('File operation rejected: path outside allowed directories', {
        path: operation.path,
        allowedDirs: this.allowedDirectories.map(d => path.basename(d))
      });
      throw new Error('File path is outside allowed directories');
    }

    // Store pending operation
    this.pendingOperations.set(operationId, {
      ...operation,
      status: 'pending'
    });

    logger.info('📋 File operation proposed', {
      operationId: operationId.substring(0, 12) + '...',
      type: operation.type,
      path: operation.path,
      category: operation.metadata.category,
      fileSize: operation.metadata.fileSize
    });

    return operationId;
  }

  /**
   * Execute a file operation (after user approval)
   */
  async executeFileOperation(operationId: string): Promise<void> {
    if (!this.isAvailable || !this.client) {
      throw new Error('Filesystem service not available');
    }

    const operation = this.pendingOperations.get(operationId);
    if (!operation) {
      throw new Error(`Operation ${operationId} not found`);
    }

    if (operation.status !== 'approved') {
      throw new Error(`Operation ${operationId} not approved`);
    }

    try {
      // Update status
      operation.status = 'executing';
      this.pendingOperations.set(operationId, operation);

      logger.info('⚙️ Executing file operation', {
        operationId: operationId.substring(0, 12) + '...',
        type: operation.type,
        path: operation.path
      });

      // Ensure directory exists
      const dirPath = path.dirname(path.resolve(operation.path));
      await fs.mkdir(dirPath, { recursive: true });

      // Write file via MCP
      await this.client.callTool({
        name: 'write_file',
        arguments: {
          path: operation.path,
          content: operation.content
        }
      });

      // Update status
      operation.status = 'completed';
      this.pendingOperations.set(operationId, operation);

      logger.info('✅ File operation completed', {
        operationId: operationId.substring(0, 12) + '...',
        path: operation.path,
        bytesWritten: operation.metadata.fileSize
      });
    } catch (error) {
      logger.error('❌ File operation failed', {
        operationId: operationId.substring(0, 12) + '...',
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Approve a pending file operation
   */
  approveOperation(operationId: string): void {
    const operation = this.pendingOperations.get(operationId);
    if (!operation) {
      throw new Error(`Operation ${operationId} not found`);
    }

    operation.status = 'approved';
    this.pendingOperations.set(operationId, operation);

    logger.info('✓ File operation approved', {
      operationId: operationId.substring(0, 12) + '...',
      type: operation.type
    });
  }

  /**
   * Reject a pending file operation
   */
  rejectOperation(operationId: string): void {
    const operation = this.pendingOperations.get(operationId);
    if (!operation) {
      throw new Error(`Operation ${operationId} not found`);
    }

    operation.status = 'rejected';
    this.pendingOperations.set(operationId, operation);

    logger.info('✗ File operation rejected', {
      operationId: operationId.substring(0, 12) + '...',
      type: operation.type
    });
  }

  /**
   * Get pending operations (for UI display)
   */
  getPendingOperations(): FileOperation[] {
    return Array.from(this.pendingOperations.values())
      .filter(op => op.status === 'pending');
  }

  /**
   * Read file via MCP
   */
  async readFile(filePath: string): Promise<string> {
    if (!this.isAvailable || !this.client) {
      throw new Error('Filesystem service not available');
    }

    // Validate path
    const absolutePath = path.resolve(filePath);
    if (!FileNamingStrategy.isPathAllowed(absolutePath, this.allowedDirectories)) {
      throw new Error('File path is outside allowed directories');
    }

    try {
      const result = await this.client.callTool({
        name: 'read_file',
        arguments: {
          path: filePath
        }
      });

      if (!result || !result.content || result.content.length === 0) {
        throw new Error('No content returned from read_file');
      }

      const content = result.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      throw new Error('Unexpected content type from read_file');
    } catch (error) {
      logger.error('Failed to read file', {
        path: filePath,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * List files in a directory via MCP
   */
  async listDirectory(dirPath: string): Promise<string[]> {
    if (!this.isAvailable || !this.client) {
      throw new Error('Filesystem service not available');
    }

    // Validate path
    const absolutePath = path.resolve(dirPath);
    if (!FileNamingStrategy.isPathAllowed(absolutePath, this.allowedDirectories)) {
      throw new Error('Directory path is outside allowed directories');
    }

    try {
      const result = await this.client.callTool({
        name: 'list_directory',
        arguments: {
          path: dirPath
        }
      });

      if (!result || !result.content || result.content.length === 0) {
        return [];
      }

      const content = result.content[0];
      if (content.type === 'text') {
        // Parse directory listing
        return content.text.split('\n').filter(line => line.trim().length > 0);
      }

      return [];
    } catch (error) {
      logger.warn('Failed to list directory', {
        path: dirPath,
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  async cleanup(): Promise<void> {
    if (this.transport) {
      try {
        await this.transport.close();
        logger.info('MCP Filesystem Service transport closed');
      } catch (error) {
        logger.warn('Error closing filesystem transport', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    this.isInitialized = false;
    this.isAvailable = false;
  }
}

// Export singleton instance
export const mcpFilesystemService = MCPFilesystemService.getInstance();
