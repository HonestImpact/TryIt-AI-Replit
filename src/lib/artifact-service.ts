// Artifact Service - handles tool generation and storage with elegant analytics integration
import { analyticsService } from '@/lib/analytics';
import { createLogger } from '@/lib/logger';

const logger = createLogger('artifact-service');

interface ConversationState {
  sessionId: string | null;
  conversationId: string | null;
  messageSequence: number;
  startTime: number;
}

export class ArtifactService {
  static async handleArtifactWorkflow(
    content: string,
    userMessage: string,
    sessionId: string,
    conversationState?: ConversationState
  ): Promise<{ hasArtifact: boolean; title?: string; content?: string }> {
    const startTime = Date.now();
    
    // Simple artifact detection for now
    const hasTitle = content.includes('TITLE:');
    const hasTool = content.includes('TOOL:');
    
    if (hasTitle && hasTool) {
      const titleMatch = content.match(/TITLE:\s*(.+)/);
      const toolMatch = content.match(/TOOL:\s*([\s\S]+?)(?:\n\nREASONING:|$)/);
      
      if (titleMatch && toolMatch) {
        const title = titleMatch[1].trim();
        const toolContent = toolMatch[1].trim();
        const generationTime = Date.now() - startTime;

        // Log tool generation with elegant analytics integration (fire-and-forget)
        if (conversationState?.conversationId && conversationState?.sessionId) {
          analyticsService.logGeneratedTool(
            conversationState.conversationId,
            conversationState.sessionId,
            undefined, // messageId will be handled in the chat route
            title,
            toolContent,
            generationTime,
            'noah', // Will be enhanced to detect actual generation agent
            userMessage.length
          );

          logger.debug('Tool generated and logged to analytics', {
            title,
            toolLength: toolContent.length,
            generationTime,
            userMessageLength: userMessage.length
          });
        }
        
        return {
          hasArtifact: true,
          title,
          content: toolContent
        };
      }
    }
    
    return { hasArtifact: false };
  }
}