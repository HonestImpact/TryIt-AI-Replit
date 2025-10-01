'use client';

import React, { useState, useEffect } from 'react';
import type { FileOperation } from '@/lib/filesystem/types';

interface FileApprovalDialogProps {
  operation: FileOperation | null;
  isOpen: boolean;
  onApprove: (operationId: string, customFileName?: string) => void;
  onReject: (operationId: string) => void;
  onClose: () => void;
}

export default function FileApprovalDialog({
  operation,
  isOpen,
  onApprove,
  onReject,
  onClose
}: FileApprovalDialogProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    if (operation && isOpen) {
      const fileName = operation.path.split('/').pop() || '';
      setNewFileName(fileName);
      setIsRenaming(false);
    }
  }, [operation, isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !operation) {
    return null;
  }

  const handleSave = () => {
    if (isRenaming && newFileName.trim()) {
      onApprove(operation.path, newFileName.trim());
    } else {
      onApprove(operation.path);
    }
    onClose();
  };

  const handleDismiss = () => {
    onReject(operation.path);
    onClose();
  };

  const fileTypeIcon = {
    html: '🌐',
    js: '⚡',
    py: '🐍',
    json: '📋',
    txt: '📝'
  }[operation.metadata.fileType] || '📄';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="file-approval-title"
        aria-modal="true"
      >
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">{fileTypeIcon}</span>
            <div className="flex-1">
              <h2
                id="file-approval-title"
                className="text-2xl font-bold text-white mb-2"
              >
                Save this tool?
              </h2>
              <p className="text-white/90">
                {operation.metadata.agent === 'noah' ? 'Noah' : 
                 operation.metadata.agent === 'wanderer' ? 'Wanderer' : 'Tinkerer'} created a new tool and wants to save it to your project.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-gray-500 font-medium min-w-24">File name:</span>
              {isRenaming ? (
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSave();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter file name"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-mono text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">
                    {operation.path.split('/').pop()}
                  </span>
                  <button
                    onClick={() => setIsRenaming(true)}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    ✏️ Rename
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-500 font-medium min-w-24">Location:</span>
              <span className="text-gray-700 font-mono text-sm">
                ./{operation.path.split('/').slice(0, -1).join('/')}/
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-500 font-medium min-w-24">File size:</span>
              <span className="text-gray-700">
                {(operation.metadata.fileSize / 1024).toFixed(1)} KB
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-500 font-medium min-w-24">File type:</span>
              <span className="text-gray-700 uppercase font-mono text-sm">
                {operation.metadata.fileType}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-500 font-medium min-w-24">Category:</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {operation.metadata.category}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-1">
              <strong>Description:</strong>
            </p>
            <p className="text-sm text-gray-700">
              {operation.metadata.description}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={handleDismiss}
            className="px-6 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Dismiss
          </button>
          {isRenaming && (
            <button
              onClick={() => setIsRenaming(false)}
              className="px-6 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel Rename
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all hover:scale-105 shadow-lg"
          >
            {isRenaming ? 'Save with new name' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
