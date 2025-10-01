'use client';

import { useEffect } from 'react';
import { createLogger } from '@/lib/logger';
import type { FileOperation } from '@/lib/filesystem/types';

const logger = createLogger('filesystem-bridge');

interface FilesystemBridgeProps {
  sessionId: string | null;
  onFileOperationProposed: (operation: FileOperation) => void;
}

interface NoahSaveRequest {
  type: 'NOAH_SAVE_REQUEST';
  payload: {
    fileName: string;
    content: string;
    description?: string;
  };
}

interface NoahLoadRequest {
  type: 'NOAH_LOAD_REQUEST';
  payload: {
    fileName: string;
  };
}

type NoahMessage = NoahSaveRequest | NoahLoadRequest;

export default function FilesystemBridge({
  sessionId,
  onFileOperationProposed
}: FilesystemBridgeProps) {
  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        // Security: Only accept messages from same origin
        if (event.origin !== window.location.origin) {
          logger.warn('Rejected postMessage from unauthorized origin', { 
            origin: event.origin 
          });
          return;
        }

        const message = event.data as NoahMessage;

        if (!message || typeof message.type !== 'string') {
          return;
        }

        switch (message.type) {
          case 'NOAH_SAVE_REQUEST': {
            const { fileName, content, description } = message.payload;
            
            if (!fileName || !content) {
              logger.warn('Invalid save request - missing fileName or content');
              return;
            }

            if (!sessionId) {
              logger.warn('Cannot save file - no active session');
              return;
            }

            logger.info('Received save request from iframe', {
              fileName: fileName.substring(0, 30),
              contentSize: content.length
            });

            const fileType = fileName.split('.').pop() || 'txt';
            const timestamp = Date.now();
            const artifactId = `${sessionId}-${timestamp}`;

            // Calculate file size using TextEncoder (browser-safe)
            const fileSize = new TextEncoder().encode(content).length;

            const operation: FileOperation = {
              type: 'save_artifact',
              path: `noah-tools/user-requested/${fileName}`,
              content,
              metadata: {
                agent: 'noah',
                timestamp,
                sessionId,
                artifactId,
                description: description || `User-requested save: ${fileName}`,
                fileSize,
                fileType,
                category: 'tool'
              },
              status: 'pending',
              userApprovalRequired: true
            };

            onFileOperationProposed(operation);

            if (event.source && typeof event.source === 'object' && 'postMessage' in event.source) {
              (event.source as Window).postMessage(
                {
                  type: 'NOAH_SAVE_RESPONSE',
                  payload: {
                    success: true,
                    message: 'Save request received - waiting for user approval'
                  }
                },
                event.origin
              );
            }
            break;
          }

          case 'NOAH_LOAD_REQUEST': {
            const { fileName } = message.payload;
            
            logger.info('Received load request from iframe', { fileName });

            if (event.source && typeof event.source === 'object' && 'postMessage' in event.source) {
              (event.source as Window).postMessage(
                {
                  type: 'NOAH_LOAD_RESPONSE',
                  payload: {
                    success: false,
                    message: 'Load functionality not yet implemented'
                  }
                },
                event.origin
              );
            }
            break;
          }

          default:
            break;
        }
      } catch (error) {
        logger.error('Error handling iframe message', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    };

    window.addEventListener('message', handleMessage);
    logger.debug('FilesystemBridge: Message listener registered');

    return () => {
      window.removeEventListener('message', handleMessage);
      logger.debug('FilesystemBridge: Message listener removed');
    };
  }, [sessionId, onFileOperationProposed]);

  return null;
}
