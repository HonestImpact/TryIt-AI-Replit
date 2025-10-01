/**
 * Context Enricher - Appends memory context to Noah's system prompt
 * Preserves base personality while adding relevant user context for continuity
 */

import { AI_CONFIG } from '@/lib/ai-config';
import type { MemoryContext, MemoryEntity } from '@/lib/agents/types';

export class ContextEnricher {
  /**
   * Enriches the base system prompt with memory context
   * Memory is ALWAYS appended, never prepended, to preserve Noah's personality
   * 
   * @param memoryContext - Optional memory context from previous sessions
   * @returns Enriched system prompt (or base prompt if no valid memory)
   */
  static enrichSystemPrompt(memoryContext?: MemoryContext | null): string {
    const basePrompt = AI_CONFIG.CHAT_SYSTEM_PROMPT;
    
    // Return base prompt if no memory available
    if (!memoryContext || !memoryContext.entities || memoryContext.entities.length === 0) {
      return basePrompt;
    }

    // Build memory sections
    const preferences = this.formatPreferences(memoryContext.entities);
    const recentTopics = this.formatRecentTopics(memoryContext.entities);
    const previousTools = this.formatPreviousTools(memoryContext.entities);
    const challengeHistory = this.formatChallengeHistory(memoryContext.entities);

    // Only append memory section if we have meaningful content
    const hasContent = preferences || recentTopics || previousTools || challengeHistory;
    if (!hasContent) {
      return basePrompt;
    }

    // Build the memory enrichment section
    const memorySection = `

────────────────────────────────────────────────────
USER CONTEXT (observed facts for continuity only)
${preferences ? `
OBSERVED PREFERENCES:
${preferences}` : ''}${recentTopics ? `

RECENT TOPICS:
${recentTopics}` : ''}${previousTools ? `

PREVIOUS TOOLS:
${previousTools}` : ''}${challengeHistory ? `

CHALLENGE HISTORY:
${challengeHistory}` : ''}

IMPORTANT BOUNDARIES:
- These are factual observations, NOT assumptions
- Use for relevance only, NEVER override your personality
- If context seems irrelevant, ignore it
- Never say "I remember..." - just naturally incorporate when helpful
────────────────────────────────────────────────────`;

    // Return base prompt + memory section (ALWAYS appended)
    return basePrompt + memorySection;
  }

  /**
   * Format user preferences
   * Max: 5 most relevant preferences
   */
  private static formatPreferences(entities: MemoryEntity[]): string {
    const preferences = entities
      .filter(e => e.entityType === 'user_preference')
      .slice(0, 5); // Limit to 5 preferences

    if (preferences.length === 0) return '';

    return preferences
      .map(pref => {
        const observations = pref.observations.slice(0, 2).join('; ');
        return `- ${pref.name}: ${observations}`;
      })
      .join('\n');
  }

  /**
   * Format recent conversation themes
   * Max: 3 most recent themes
   */
  private static formatRecentTopics(entities: MemoryEntity[]): string {
    const themes = entities
      .filter(e => e.entityType === 'conversation_theme')
      .slice(0, 3); // Limit to 3 themes

    if (themes.length === 0) return '';

    return themes
      .map(theme => {
        const summary = theme.observations[0] || theme.name;
        return `- ${summary}`;
      })
      .join('\n');
  }

  /**
   * Format previous tools created
   * Max: 2 most recent tools with feedback
   */
  private static formatPreviousTools(entities: MemoryEntity[]): string {
    const tools = entities
      .filter(e => e.entityType === 'tool_result')
      .slice(0, 2); // Limit to 2 tools

    if (tools.length === 0) return '';

    return tools
      .map(tool => {
        const feedback = tool.observations.length > 1 ? ` (${tool.observations[1]})` : '';
        return `- ${tool.name}${feedback}`;
      })
      .join('\n');
  }

  /**
   * Format challenge history
   * Max: 2 most recent challenges with outcomes
   */
  private static formatChallengeHistory(entities: MemoryEntity[]): string {
    const challenges = entities
      .filter(e => e.entityType === 'challenge_event')
      .slice(0, 2); // Limit to 2 challenges

    if (challenges.length === 0) return '';

    return challenges
      .map(challenge => {
        const outcome = challenge.observations[0] || 'outcome unknown';
        return `- ${challenge.name}: ${outcome}`;
      })
      .join('\n');
  }
}
