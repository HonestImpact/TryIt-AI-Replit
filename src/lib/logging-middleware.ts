// Logging middleware for request/response tracking
import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from './logger';

export interface LoggingContext {
  sessionId: string;
  requestBody?: any;
  startTime: number;
}

const logger = createLogger('logging-middleware');

export function withLogging<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: (req: NextRequest, context: LoggingContext) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const context: LoggingContext = {
      sessionId: generateSessionId(),
      startTime: Date.now()
    };

    try {
      const response = await handler(req, context);
      
      // Add session ID to response headers
      response.headers.set('x-session-id', context.sessionId);
      
      return response;
    } catch (error) {
      logger.error('Request failed', { 
        sessionId: context.sessionId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  };
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}