// Shared resources for agents
import type { LLMProvider } from './types';

export interface KnowledgeService {
  search(query: string): Promise<unknown[]>;
}

export interface RAGIntegration {
  enabled: boolean;
  search(query: string): Promise<unknown[]>;
}

export interface SolutionGenerator {
  generate(request: string): Promise<string>;
}

export interface AgentSharedResources {
  knowledgeService?: KnowledgeService;
  ragIntegration?: RAGIntegration;
  solutionGenerator?: SolutionGenerator;
}

export const sharedResourceManager = {
  async initializeResources(llmProvider: LLMProvider): Promise<AgentSharedResources> {
    // For now, return empty shared resources
    // This will be expanded as we integrate the full RAG system
    return {};
  }
};