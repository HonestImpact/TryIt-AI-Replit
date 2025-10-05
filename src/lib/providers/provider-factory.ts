// LLM Provider factory - Environment-based configuration (no hardcoded fallbacks)
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { createLogger } from '../logger';
import { getLLMConfig, type TaskType } from './env-config';

const logger = createLogger('llm-provider');

export interface LLMProvider {
  generateText(params: {
    messages: Array<{ role: string; content: string }>;
    system?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<{ content: string }>;
}

export type { TaskType };

export function createLLMProvider(taskType: TaskType = 'default'): LLMProvider {
  const config = getLLMConfig(taskType);

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
            const errorMsg = `Unknown LLM provider '${config.provider}'. Supported providers: 'anthropic', 'openai'. Please check your environment variables.`;
            logger.error('❌ Invalid provider configured', { provider: config.provider });
            throw new Error(errorMsg);
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