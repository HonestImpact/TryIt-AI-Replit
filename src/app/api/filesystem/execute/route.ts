import { NextRequest, NextResponse } from 'next/server';
import { mcpFilesystemService } from '@/lib/filesystem/mcp-filesystem-service';
import { createLogger } from '@/lib/logger';

const logger = createLogger('filesystem-execute-api');

export async function POST(req: NextRequest) {
  try {
    const { operationId, customFileName } = await req.json();

    if (!operationId) {
      return NextResponse.json(
        { error: 'Operation ID required' },
        { status: 400 }
      );
    }

    logger.info('Executing file operation', { 
      operationId: operationId.substring(0, 20) 
    });

    // Approve the operation
    mcpFilesystemService.approveOperation(operationId);

    // Execute the operation
    await mcpFilesystemService.executeFileOperation(operationId);

    const fileName = customFileName || operationId.split('/').pop();
    const filePath = operationId;

    logger.info('File operation completed successfully', { filePath });

    return NextResponse.json({
      success: true,
      fileName,
      filePath,
      fileSize: 0,
      fileType: fileName?.split('.').pop() || 'txt'
    });

  } catch (error) {
    logger.error('File operation execution failed', {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { error: 'Failed to execute file operation' },
      { status: 500 }
    );
  }
}
