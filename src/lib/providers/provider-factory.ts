// LLM Provider Factory - creates appropriate provider based on configuration
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export interface LLMProvider {
  generateText(params: {
    messages: Array<{ role: string; content: string }>;
    system?: string;
    model: string;
    temperature?: number;
  }): Promise<{ content: string }>;
}

export function createLLMProvider(): LLMProvider {
  return {
    async generateText(params) {
      const result = await generateText({
        model: anthropic(params.model),
        messages: params.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })),
        system: params.system,
        temperature: params.temperature || 0.7,
      });

      return { content: result.text };
    }
  };
}