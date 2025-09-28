// Structured Response Parser - Replaces brittle regex with deterministic parsing
// Implements "Best, Cleanest, Fastest, Most Logical, Most Elegant" parsing approach

import { createLogger } from '@/lib/logger';
import type { StructuredResponse, StructuredArtifact } from './types';
import { isValidStructuredResponse, isValidArtifact } from './types';

const logger = createLogger('structured-parser');

export interface ParseResult {
  success: boolean;
  response?: StructuredResponse;
  fallbackContent?: string;
  error?: string;
}

export class StructuredResponseParser {
  /**
   * Parse LLM response with multiple strategies for maximum reliability
   */
  static parse(content: string, agentUsed: 'noah' | 'wanderer' | 'tinkerer' = 'noah'): ParseResult {
    try {
      // Strategy 1: Try to parse as structured JSON response
      const jsonResult = this.parseStructuredJSON(content, agentUsed);
      if (jsonResult.success) {
        logger.debug('Successfully parsed structured JSON response', {
          agentUsed,
          hasArtifact: !!jsonResult.response?.artifact
        });
        return jsonResult;
      }

      // Strategy 2: Try to extract JSON from mixed content
      const extractedResult = this.extractStructuredFromMixed(content, agentUsed);
      if (extractedResult.success) {
        logger.debug('Successfully extracted structured response from mixed content', {
          agentUsed,
          hasArtifact: !!extractedResult.response?.artifact
        });
        return extractedResult;
      }

      // Strategy 3: Legacy TITLE:/TOOL: format (for backward compatibility during transition)
      const legacyResult = this.parseLegacyFormat(content, agentUsed);
      if (legacyResult.success) {
        logger.debug('Successfully parsed legacy TITLE:/TOOL: format', {
          agentUsed,
          hasArtifact: !!legacyResult.response?.artifact
        });
        return legacyResult;
      }

      // Strategy 4: Fallback to conversation response
      logger.info('Parsing as conversation response (no artifacts detected)', { agentUsed });
      return {
        success: true,
        response: {
          content,
          responseType: 'conversation',
          confidence: 0.8,
          agentUsed
        }
      };

    } catch (error) {
      logger.error('Failed to parse response with all strategies', {
        error: error instanceof Error ? error.message : String(error),
        contentLength: content.length,
        agentUsed
      });

      return {
        success: false,
        fallbackContent: content,
        error: error instanceof Error ? error.message : 'Unknown parsing error'
      };
    }
  }

  /**
   * Parse pure structured JSON response
   */
  private static parseStructuredJSON(content: string, agentUsed: string): ParseResult {
    try {
      // Check if content starts with JSON structure
      const trimmed = content.trim();
      if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
        return { success: false };
      }

      const parsed = JSON.parse(trimmed);
      
      if (isValidStructuredResponse(parsed)) {
        // Validate artifact if present
        if (parsed.artifact && !isValidArtifact(parsed.artifact)) {
          logger.warn('Invalid artifact in structured response, removing artifact', {
            agentUsed,
            artifactTitle: parsed.artifact && typeof parsed.artifact === 'object' && 'title' in parsed.artifact ? (parsed.artifact as any).title : 'unknown'
          });
          delete parsed.artifact;
        }

        return { success: true, response: parsed };
      }

      return { success: false };

    } catch (error) {
      return { success: false };
    }
  }

  /**
   * Extract structured JSON from mixed content (e.g., explanation + JSON)
   */
  private static extractStructuredFromMixed(content: string, agentUsed: string): ParseResult {
    try {
      // Look for JSON blocks in the content
      const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        return this.parseStructuredJSON(jsonMatch[1], agentUsed);
      }

      // Look for raw JSON blocks (without code fences)
      const rawJsonMatch = content.match(/(\{[\s\S]*"content"[\s\S]*?\})/);
      if (rawJsonMatch) {
        return this.parseStructuredJSON(rawJsonMatch[1], agentUsed);
      }

      return { success: false };

    } catch (error) {
      return { success: false };
    }
  }

  /**
   * Parse legacy TITLE:/TOOL: format for backward compatibility
   */
  private static parseLegacyFormat(content: string, agentUsed: string): ParseResult {
    try {
      const hasTitle = content.includes('TITLE:');
      const hasTool = content.includes('TOOL:');
      
      if (!hasTitle || !hasTool) {
        return { success: false };
      }

      const titleMatch = content.match(/TITLE:\s*(.+)/);
      const toolMatch = content.match(/TOOL:\s*([\s\S]+?)(?:\n\nREASONING:|$)/);
      
      if (!titleMatch || !toolMatch) {
        return { success: false };
      }

      const title = titleMatch[1].trim();
      const toolContent = toolMatch[1].trim();

      // Extract reasoning if present
      const reasoningMatch = content.match(/REASONING:\s*([\s\S]+?)$/);
      const reasoning = reasoningMatch ? reasoningMatch[1].trim() : undefined;

      // Create structured response from legacy format
      const artifact: StructuredArtifact = {
        title,
        content: toolContent,
        type: this.inferToolType(title, toolContent),
        category: this.inferToolCategory(title, toolContent),
        description: `Generated tool: ${title}`,
        complexity: this.inferComplexity(toolContent)
      };

      const response: StructuredResponse = {
        content: content, // Keep full content for display
        artifact,
        responseType: 'tool-generation',
        confidence: 0.7, // Lower confidence for legacy parsing
        reasoning,
        agentUsed: agentUsed as 'noah' | 'wanderer' | 'tinkerer'
      };

      return { success: true, response };

    } catch (error) {
      return { success: false };
    }
  }

  /**
   * Infer tool type from title and content
   */
  private static inferToolType(title: string, content: string): StructuredArtifact['type'] {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();

    if (titleLower.includes('calculator') || contentLower.includes('calculate')) return 'calculator';
    if (titleLower.includes('dashboard') || contentLower.includes('dashboard')) return 'dashboard';
    if (titleLower.includes('component') || contentLower.includes('component')) return 'component';
    if (titleLower.includes('app') || contentLower.includes('application')) return 'app';
    if (titleLower.includes('utility') || contentLower.includes('utility')) return 'utility';
    if (titleLower.includes('tool')) return 'tool';
    
    return 'other';
  }

  /**
   * Infer tool category from title and content
   */
  private static inferToolCategory(title: string, content: string): StructuredArtifact['category'] {
    const combined = (title + ' ' + content).toLowerCase();

    if (combined.includes('interactive') || combined.includes('click') || combined.includes('button')) return 'interactive';
    if (combined.includes('chart') || combined.includes('graph') || combined.includes('visualization')) return 'visualization';
    if (combined.includes('game') || combined.includes('play')) return 'game';
    if (combined.includes('productivity') || combined.includes('organize')) return 'productivity';
    if (combined.includes('data') || combined.includes('process')) return 'data-processing';
    
    return 'display';
  }

  /**
   * Infer complexity from content length and patterns
   */
  private static inferComplexity(content: string): StructuredArtifact['complexity'] {
    const length = content.length;
    const hasAdvancedPatterns = /class|interface|async|await|fetch|api/i.test(content);
    const hasComplexLogic = /for\s*\(|while\s*\(|switch\s*\(|try\s*\{|catch\s*\(/i.test(content);

    if (length > 3000 || hasAdvancedPatterns) return 'advanced';
    if (length > 1500 || hasComplexLogic) return 'complex';
    if (length > 500) return 'moderate';
    
    return 'simple';
  }
}