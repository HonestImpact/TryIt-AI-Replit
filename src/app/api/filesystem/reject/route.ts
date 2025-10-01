import { NextRequest, NextResponse } from 'next/server';
import { mcpFilesystemService } from '@/lib/filesystem/mcp-filesystem-service';
import { createLogger } from '@/lib/logger';

const logger = createLogger('filesystem-reject-api');

export async function POST(req: NextRequest) {
  try {
    const { operationId } = await req.json();

    if (!operationId) {
      return NextResponse.json(
        { error: 'Operation ID required' },
        { status: 400 }
      );
    }

    logger.info('Rejecting file operation', { 
      operationId: operationId.substring(0, 20) 
    });

    // Reject the operation
    mcpFilesystemService.rejectOperation(operationId);

    logger.info('File operation rejected successfully');

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    logger.error('File operation rejection failed', {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { error: 'Failed to reject file operation' },
      { status: 500 }
    );
  }
}
