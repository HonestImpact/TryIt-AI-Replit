'use client';

import React, { useEffect, useState } from 'react';
import type { FileOperation } from '@/lib/filesystem/types';

interface FileActivityBannerProps {
  operations: FileOperation[];
  onApprove: (operationId: string) => void;
  onReject: (operationId: string) => void;
  onRename: (operationId: string, newName: string) => void;
}

export default function FileActivityBanner({
  operations,
  onApprove,
  onReject,
  onRename
}: FileActivityBannerProps) {
  const [dismissedOperations, setDismissedOperations] = useState<Set<string>>(new Set());
  const [renamingOperation, setRenamingOperation] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');

  const visibleOperations = operations.filter(
    op => !dismissedOperations.has(op.path) && op.status === 'pending'
  );

  const executingOperations = operations.filter(op => op.status === 'executing');
  const completedOperations = operations.filter(op => op.status === 'completed');

  useEffect(() => {
    if (completedOperations.length > 0) {
      const timer = setTimeout(() => {
        completedOperations.forEach(op => {
          setDismissedOperations(prev => new Set(prev).add(op.path));
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [completedOperations.length]);

  if (visibleOperations.length === 0 && executingOperations.length === 0 && completedOperations.length === 0) {
    return null;
  }

  const handleRenameClick = (operation: FileOperation) => {
    const fileName = operation.path.split('/').pop() || '';
    setNewFileName(fileName);
    setRenamingOperation(operation.path);
  };

  const handleRenameSubmit = (operationId: string) => {
    if (newFileName.trim()) {
      onRename(operationId, newFileName.trim());
      setRenamingOperation(null);
      setNewFileName('');
    }
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-2 pointer-events-auto">
          {visibleOperations.map((operation) => (
            <div
              key={operation.path}
              className="bg-gradient-to-r from-indigo-500/95 via-purple-500/95 to-pink-500/95 backdrop-blur-lg rounded-lg shadow-2xl p-4 animate-slide-down"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💾</span>
                    <span className="text-white font-semibold">
                      {operation.metadata.agent === 'noah' ? 'Noah' : 
                       operation.metadata.agent === 'wanderer' ? 'Wanderer' : 'Tinkerer'} wants to save this tool
                    </span>
                  </div>
                  
                  {renamingOperation === operation.path ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleRenameSubmit(operation.path);
                          }
                        }}
                        className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="Enter new file name"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRenameSubmit(operation.path)}
                          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => {
                            setRenamingOperation(null);
                            setNewFileName('');
                          }}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-white/90">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">File:</span>
                        <span className="text-sm font-mono bg-white/10 px-2 py-0.5 rounded">
                          {operation.path.split('/').pop()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Location:</span>
                        <span className="text-sm text-white/70">
                          ./{operation.path.split('/').slice(0, -1).join('/')}/
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Size:</span>
                        <span className="text-sm text-white/70">
                          {(operation.metadata.fileSize / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {renamingOperation !== operation.path && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onApprove(operation.path)}
                      className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-white/90 transition-all hover:scale-105 flex items-center gap-2"
                      aria-label="Save file"
                    >
                      <span>✓</span>
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => handleRenameClick(operation)}
                      className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
                      aria-label="Rename file"
                    >
                      <span>✏️</span>
                      <span>Rename</span>
                    </button>
                    <button
                      onClick={() => onReject(operation.path)}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
                      aria-label="Dismiss"
                    >
                      <span>✗</span>
                      <span>Dismiss</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {executingOperations.map((operation) => (
            <div
              key={operation.path}
              className="bg-gradient-to-r from-blue-500/95 to-cyan-500/95 backdrop-blur-lg rounded-lg shadow-2xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="animate-spin">⚙️</div>
                <div className="flex-1">
                  <div className="text-white font-semibold">Saving file...</div>
                  <div className="text-white/80 text-sm">{operation.path.split('/').pop()}</div>
                </div>
              </div>
            </div>
          ))}

          {completedOperations.map((operation) => (
            <div
              key={operation.path}
              className="bg-gradient-to-r from-green-500/95 to-emerald-500/95 backdrop-blur-lg rounded-lg shadow-2xl p-4 animate-slide-down"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div className="flex-1">
                  <div className="text-white font-semibold">File saved successfully!</div>
                  <div className="text-white/80 text-sm">{operation.path}</div>
                </div>
                <a
                  href={`/api/filesystem/serve/${operation.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-white/90 transition-all hover:scale-105"
                >
                  Open file
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
