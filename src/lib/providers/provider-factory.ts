// LLM Provider factory - Provider Mapping Strategy for quick model updates
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { createLogger } from '../logger';

const logger = createLogger('llm-provider');

export interface LLMProvider {
  generateText(params: {
    messages: Array<{ role: string; content: string }>;
    system?: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<{ content: string }>;
}

/**
 * Enhanced Provider Mapping Strategy - Task-Type Optimization
 * Environment variables:
 * - LLM_DEFAULT/LLM_DEFAULT_ID (general conversations)
 * - LLM_RESEARCH/LLM_RESEARCH_ID (fast research tasks)
 * - LLM_DEEPBUILD/LLM_DEEPBUILD_ID (complex building tasks)
 */

export type TaskType = 'default' | 'research' | 'deepbuild';

interface ModelConfig {
  provider: string;
  model: string;
}

function getModelConfigForTask(taskType: TaskType): ModelConfig {
  const taskUpper = taskType.toUpperCase();
  
  // Task-specific configuration
  const provider = process.env[`LLM_${taskUpper}`] || process.env.LLM_DEFAULT || process.env.LLM || 'anthropic';
  const model = process.env[`LLM_${taskUpper}_ID`] || process.env.LLM_DEFAULT_ID || process.env.MODEL_ID || 'claude-sonnet-4-20250514';
  
  return { provider, model };
}

export function createLLMProvider(taskType: TaskType = 'default'): LLMProvider {
  const config = getModelConfigForTask(taskType);

  logger.info('🤖 LLM Provider initialized', { 
    taskType, 
    provider: config.provider, 
    model: config.model 
  });

  return {
    async generateText(params) {
      const model = params.model || config.model;
      
      try {
        let result;
        
        switch (config.provider.toLowerCase()) {
          case 'anthropic':
            result = await generateText({
              model: anthropic(model),
              messages: params.messages.map(msg => ({
                role: msg.role as 'user' | 'assistant' | 'system',
                content: msg.content
              })),
              system: params.system,
              temperature: params.temperature || 0.7,
              maxOutputTokens: params.maxTokens || 4096
            });
            break;

          case 'openai':
            result = await generateText({
              model: openai(model),
              messages: params.messages.map(msg => ({
                role: msg.role as 'user' | 'assistant' | 'system',
                content: msg.content
              })),
              system: params.system,
              temperature: params.temperature || 0.7,
              maxOutputTokens: params.maxTokens || 4096
            });
            break;

          default:
            logger.warn('⚠️ Unknown LLM provider, falling back to Anthropic', { provider: config.provider });
            result = await generateText({
              model: anthropic(model),
              messages: params.messages.map(msg => ({
                role: msg.role as 'user' | 'assistant' | 'system',
                content: msg.content
              })),
              system: params.system,
              temperature: params.temperature || 0.7,
              maxOutputTokens: params.maxTokens || 4096
            });
        }

        logger.info('✅ LLM generation completed', { 
          taskType,
          provider: config.provider,
          model,
          responseLength: result.text.length 
        });

        return { content: result.text };

      } catch (error) {
        logger.error('💥 LLM generation failed', { 
          error, 
          taskType,
          provider: config.provider, 
          model 
        });
        throw error;
      }
    }
  };
}