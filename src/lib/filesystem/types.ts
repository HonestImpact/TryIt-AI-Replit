export interface FileOperation {
  type: 'save_artifact' | 'export_thinking' | 'save_conversation' | 'update_tool';
  path: string;
  content: string;
  metadata: {
    agent: 'noah' | 'wanderer' | 'tinkerer';
    timestamp: number;
    sessionId: string;
    artifactId?: string;
    description: string;
    fileSize: number;
    fileType: string;
    category: 'tool' | 'thinking' | 'conversation' | 'report';
  };
  status: 'pending' | 'approved' | 'executing' | 'completed' | 'rejected';
  userApprovalRequired: boolean;
}

export interface FilesystemServiceStatus {
  available: boolean;
  initialized: boolean;
  allowedDirectories: string[];
}
