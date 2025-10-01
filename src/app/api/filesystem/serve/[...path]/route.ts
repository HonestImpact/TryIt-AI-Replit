import { NextRequest, NextResponse } from 'next/server';
import { mcpFilesystemService } from '@/lib/filesystem/mcp-filesystem-service';
import { createLogger } from '@/lib/logger';

const logger = createLogger('filesystem-serve-api');

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/');
    
    logger.info('Serving file', { filePath: filePath.substring(0, 50) });

    const status = mcpFilesystemService.getStatus();
    if (!status.available) {
      return NextResponse.json(
        { error: 'Filesystem service not available' },
        { status: 503 }
      );
    }

    const content = await mcpFilesystemService.readFile(filePath);
    
    // Determine content type based on file extension
    const ext = filePath.split('.').pop()?.toLowerCase();
    const contentType = {
      html: 'text/html',
      js: 'application/javascript',
      json: 'application/json',
      css: 'text/css',
      txt: 'text/plain',
      py: 'text/x-python'
    }[ext || 'txt'] || 'text/plain';

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    logger.error('Failed to serve file', {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 404 }
    );
  }
}
