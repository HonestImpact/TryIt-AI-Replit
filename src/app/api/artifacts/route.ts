import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import { Pool } from 'pg';

const logger = createLogger('artifacts-api');

/**
 * GET /api/artifacts - Fetch the latest artifact for a session
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    logger.debug('Fetching artifacts for session', { 
      sessionId: sessionId.substring(0, 8) + '...' 
    });

    // Create database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    try {
      // Get the latest artifact for this session
      const result = await pool.query(
        'SELECT title, content FROM generated_tools WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1',
        [sessionId]
      );

      if (result.rows.length > 0) {
        const artifact = result.rows[0];
        
        logger.info('Artifact found for session', { 
          sessionId: sessionId.substring(0, 8) + '...',
          title: artifact.title,
          contentLength: artifact.content.length
        });
        
        return NextResponse.json({
          artifact: {
            title: artifact.title,
            content: artifact.content
          }
        });
      } else {
        logger.debug('No artifact found for session', { 
          sessionId: sessionId.substring(0, 8) + '...' 
        });
        
        return NextResponse.json({ artifact: null });
      }
    } finally {
      await pool.end();
    }
    
  } catch (error) {
    logger.error('Failed to fetch artifacts', { error });
    return NextResponse.json(
      { error: 'Failed to fetch artifacts' },
      { status: 500 }
    );
  }
}