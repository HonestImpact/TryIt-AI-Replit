import { ChatMessage } from '@/lib/agents/types';
import { logger } from '@/lib/logger';

export interface ExtractedObservation {
  entityName: string;
  entityType: 'conversation_theme' | 'tool_result' | 'challenge_event' | 'trust_signal' | 'user_preference';
  observation: string;
}

export class ObservationExtractor {
  
  /**
   * Extract conversation topic from last 3 user messages
   * Returns a concise topic description or null if no clear topic
   */
  static extractTopicFromMessages(messages: ChatMessage[]): string | null {
    try {
      const userMessages = messages
        .filter(m => m.role === 'user')
        .slice(-3)
        .map(m => m.content);

      if (userMessages.length === 0) {
        return null;
      }

      const combinedText = userMessages.join(' ').toLowerCase();
      
      // Topic detection patterns
      const topics: { pattern: RegExp; topic: string }[] = [
        { pattern: /\b(build|create|make|generate|develop)\s+(a|an)?\s*(website|site|app|application|page|tool)/i, topic: 'web development' },
        { pattern: /\b(database|data|sql|postgres|store|query)/i, topic: 'database management' },
        { pattern: /\b(ai|artificial intelligence|machine learning|ml|llm|gpt|model)/i, topic: 'AI/ML' },
        { pattern: /\b(api|endpoint|rest|graphql|integration)/i, topic: 'API integration' },
        { pattern: /\b(deploy|deployment|publish|production|host)/i, topic: 'deployment' },
        { pattern: /\b(auth|authentication|login|signup|user)/i, topic: 'authentication' },
        { pattern: /\b(design|ui|ux|interface|frontend|style|css)/i, topic: 'UI/UX design' },
        { pattern: /\b(bug|error|fix|issue|problem|debug)/i, topic: 'debugging' },
        { pattern: /\b(test|testing|unit test|integration test)/i, topic: 'testing' },
        { pattern: /\b(payment|stripe|checkout|billing)/i, topic: 'payments' },
      ];

      for (const { pattern, topic } of topics) {
        if (pattern.test(combinedText)) {
          return topic;
        }
      }

      // If no specific topic, extract key nouns (simple heuristic)
      const words = combinedText.split(/\s+/).filter(w => w.length > 4);
      if (words.length > 0) {
        return `general: ${words.slice(0, 3).join(', ')}`;
      }

      return null;
    } catch (error) {
      logger.warn('Failed to extract topic from messages', { error });
      return null;
    }
  }

  /**
   * Detect if user challenged or questioned the AI response
   * Looks for skepticism, disagreement, or push-back signals
   */
  static detectChallengeEvent(messages: ChatMessage[]): boolean {
    try {
      const lastUserMessage = messages
        .filter(m => m.role === 'user')
        .slice(-1)[0];

      if (!lastUserMessage) {
        return false;
      }

      const content = lastUserMessage.content.toLowerCase();

      // Challenge indicators
      const challengePatterns = [
        /\b(wrong|incorrect|disagree|not right|doesn't work|failed|error)/i,
        /\b(why|how come|but|however|actually)/i,
        /\b(sure about|certain|confident|prove|evidence)/i,
        /\b(that's not|that doesn't|this doesn't|won't work)/i,
        /\?.*\?/,  // Multiple questions suggest probing/challenging
      ];

      return challengePatterns.some(pattern => pattern.test(content));
    } catch (error) {
      logger.warn('Failed to detect challenge event', { error });
      return false;
    }
  }

  /**
   * Detect explicit positive or negative trust signals
   * Returns 'positive', 'negative', or null
   */
  static detectTrustSignal(messages: ChatMessage[]): 'positive' | 'negative' | null {
    try {
      const lastUserMessage = messages
        .filter(m => m.role === 'user')
        .slice(-1)[0];

      if (!lastUserMessage) {
        return null;
      }

      const content = lastUserMessage.content.toLowerCase();

      // Positive trust signals
      const positivePatterns = [
        /\b(thank|thanks|appreciate|helpful|great|awesome|perfect|excellent|love|nice)/i,
        /\b(good job|well done|exactly|that's right|correct|works well)/i,
        /\b(trust|believe|confident|reliable)/i,
      ];

      // Negative trust signals
      const negativePatterns = [
        /\b(don't trust|unreliable|useless|terrible|awful|horrible|worst)/i,
        /\b(waste of time|disappointed|frustrated|annoyed)/i,
        /\b(lied|lying|wrong|misleading|fake)/i,
      ];

      const hasPositive = positivePatterns.some(p => p.test(content));
      const hasNegative = negativePatterns.some(p => p.test(content));

      if (hasPositive && !hasNegative) return 'positive';
      if (hasNegative && !hasPositive) return 'negative';
      
      return null;
    } catch (error) {
      logger.warn('Failed to detect trust signal', { error });
      return null;
    }
  }

  /**
   * Detect if user expressed a communication style preference
   * Returns preference description or null
   */
  static detectPreference(messages: ChatMessage[]): string | null {
    try {
      const lastUserMessage = messages
        .filter(m => m.role === 'user')
        .slice(-1)[0];

      if (!lastUserMessage) {
        return null;
      }

      const content = lastUserMessage.content.toLowerCase();

      // Preference patterns
      const preferences: { pattern: RegExp; preference: string }[] = [
        { pattern: /\b(prefer|like|want)\s+(simple|brief|short|concise|quick)\s+(answer|response|explanation)/i, preference: 'concise responses' },
        { pattern: /\b(prefer|like|want)\s+(detailed|thorough|complete|in-depth)\s+(answer|response|explanation)/i, preference: 'detailed explanations' },
        { pattern: /\b(prefer|like|want)\s+(code|example|demo|sample)/i, preference: 'code examples' },
        { pattern: /\b(don't|do not)\s+(use|include|add)\s+(emoji|emojis)/i, preference: 'no emojis' },
        { pattern: /\b(step.by.step|walk me through|guide me)/i, preference: 'step-by-step guidance' },
        { pattern: /\b(just|only)\s+(give|show|tell)\s+(me)?\s*(the)?\s*(code|answer|result)/i, preference: 'direct answers' },
      ];

      for (const { pattern, preference } of preferences) {
        if (pattern.test(content)) {
          return preference;
        }
      }

      return null;
    } catch (error) {
      logger.warn('Failed to detect preference', { error });
      return null;
    }
  }

  /**
   * Extract all observations from a conversation
   * Returns array of observations ready to be stored
   */
  static extractAllObservations(
    messages: ChatMessage[],
    artifactGenerated: boolean,
    artifactId?: string,
    artifactTitle?: string
  ): ExtractedObservation[] {
    const observations: ExtractedObservation[] = [];

    // Extract conversation theme
    const topic = this.extractTopicFromMessages(messages);
    if (topic) {
      observations.push({
        entityName: `theme_${Date.now()}`,
        entityType: 'conversation_theme',
        observation: `Discussed: ${topic}`
      });
    }

    // Store tool result if artifact was generated
    if (artifactGenerated && artifactId && artifactTitle) {
      observations.push({
        entityName: `tool_${artifactId}`,
        entityType: 'tool_result',
        observation: `Created: ${artifactTitle}`
      });
    }

    // Detect challenge event
    const challenged = this.detectChallengeEvent(messages);
    if (challenged) {
      observations.push({
        entityName: `challenge_${Date.now()}`,
        entityType: 'challenge_event',
        observation: 'User questioned or challenged response'
      });
    }

    // Detect trust signal
    const trustSignal = this.detectTrustSignal(messages);
    if (trustSignal) {
      observations.push({
        entityName: `trust_${Date.now()}`,
        entityType: 'trust_signal',
        observation: trustSignal === 'positive' ? 'Positive feedback received' : 'Negative feedback received'
      });
    }

    // Detect user preference
    const preference = this.detectPreference(messages);
    if (preference) {
      observations.push({
        entityName: `pref_${Date.now()}`,
        entityType: 'user_preference',
        observation: `User prefers: ${preference}`
      });
    }

    return observations;
  }
}
