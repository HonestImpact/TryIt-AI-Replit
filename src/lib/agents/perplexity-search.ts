import { createLogger } from '../logger';

const logger = createLogger('perplexity-search');

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  citations?: string[];
}

export class PerplexitySearchService {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    const key = process.env.PERPLEXITY_API_KEY;
    if (!key) {
      throw new Error('PERPLEXITY_API_KEY not found in environment');
    }
    this.apiKey = key;
  }

  async search(query: string, systemPrompt?: string): Promise<{ content: string; citations: string[] }> {
    try {
      const messages: PerplexityMessage[] = [];
      
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt
        });
      }

      messages.push({
        role: 'user',
        content: query
      });

      logger.info('Searching web via Perplexity', { queryLength: query.length });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar',
          messages,
          temperature: 0.2,
          top_p: 0.9,
          return_related_questions: false,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
      }

      const data: PerplexityResponse = await response.json();
      
      const content = data.choices[0]?.message?.content || '';
      const citations = data.citations || [];

      logger.info('Web search completed', { 
        contentLength: content.length, 
        citationCount: citations.length 
      });

      return { content, citations };

    } catch (error) {
      logger.error('Perplexity search failed', { error });
      throw error;
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }
}
