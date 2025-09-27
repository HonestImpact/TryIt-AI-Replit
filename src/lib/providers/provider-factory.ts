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
 * Provider Mapping Strategy - supports multiple LLM providers
 * Environment variables:
 * - LLM=anthropic|openai|google|mistral (provider selection)
 * - MODEL_ID=specific-model-name (model within provider)
 */
export function createLLMProvider(): LLMProvider {
  const llmProvider = process.env.LLM || 'anthropic';
  const modelId = process.env.MODEL_ID || 'claude-sonnet-4-20250514';

  logger.info('🤖 LLM Provider initialized', { provider: llmProvider, model: modelId });

  return {
    async generateText(params) {
      const model = params.model || modelId;
      
      try {
        let result;
        
        switch (llmProvider.toLowerCase()) {
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
            logger.warn('⚠️ Unknown LLM provider, falling back to Anthropic', { provider: llmProvider });
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
          provider: llmProvider,
          model,
          responseLength: result.text.length 
        });

        return { content: result.text };

      } catch (error) {
        logger.error('💥 LLM generation failed', { 
          error, 
          provider: llmProvider, 
          model 
        });
        throw error;
      }
    }
  };
}