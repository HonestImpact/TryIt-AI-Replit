import * as path from 'path';

export interface FileNamingOptions {
  title: string;
  category: 'tool' | 'thinking' | 'conversation' | 'report';
  fileType: string;
  timestamp?: number;
}

export class FileNamingStrategy {
  
  /**
   * Generate a file path with automatic categorization and sanitization
   * Example: noah-tools/calculators/simple-calculator-2025-10-01.html
   */
  static generateFilePath(options: FileNamingOptions): string {
    const { title, category, fileType, timestamp = Date.now() } = options;
    
    // Base directory based on category
    const baseDir = this.getCategoryDirectory(category);
    
    // Subcategory based on title keywords
    const subcategory = this.determineSubcategory(title, category);
    
    // Sanitized filename
    const sanitizedTitle = this.sanitizeTitle(title);
    const dateStr = this.formatDate(timestamp);
    const filename = `${sanitizedTitle}-${dateStr}.${fileType}`;
    
    // Combine: category/subcategory/filename
    if (subcategory) {
      return path.join(baseDir, subcategory, filename);
    }
    
    return path.join(baseDir, filename);
  }
  
  /**
   * Get base directory for category
   */
  private static getCategoryDirectory(category: 'tool' | 'thinking' | 'conversation' | 'report'): string {
    const directories = {
      tool: 'noah-tools',
      thinking: 'noah-thinking',
      conversation: 'noah-sessions',
      report: 'noah-reports'
    };
    
    return directories[category];
  }
  
  /**
   * Determine subcategory based on title keywords
   */
  private static determineSubcategory(title: string, category: string): string | null {
    if (category !== 'tool') {
      return null; // Only tools get subcategorized
    }
    
    const titleLower = title.toLowerCase();
    
    // Tool subcategories
    const subcategories: { [key: string]: string[] } = {
      'calculators': ['calculator', 'calc', 'compute', 'math'],
      'timers': ['timer', 'stopwatch', 'countdown', 'clock'],
      'converters': ['converter', 'convert', 'unit', 'currency'],
      'generators': ['generator', 'generate', 'random', 'password'],
      'data-tools': ['chart', 'graph', 'visualize', 'data', 'table', 'list'],
      'forms': ['form', 'survey', 'questionnaire', 'input'],
      'games': ['game', 'quiz', 'puzzle'],
      'utilities': ['utility', 'tool', 'helper']
    };
    
    for (const [subcategory, keywords] of Object.entries(subcategories)) {
      if (keywords.some(keyword => titleLower.includes(keyword))) {
        return subcategory;
      }
    }
    
    return 'utilities'; // Default subcategory
  }
  
  /**
   * Sanitize title for filename
   * - Lowercase
   * - Replace spaces with hyphens
   * - Remove special characters
   * - Limit length to 50 chars
   */
  private static sanitizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Spaces to hyphens
      .replace(/-+/g, '-') // Multiple hyphens to single
      .replace(/^-|-$/g, '') // Trim hyphens
      .substring(0, 50); // Limit length
  }
  
  /**
   * Format timestamp as YYYY-MM-DD
   */
  private static formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Validate file path is within allowed directories
   */
  static isPathAllowed(filePath: string, allowedDirs: string[]): boolean {
    const normalizedPath = path.normalize(filePath);
    
    return allowedDirs.some(allowedDir => {
      const normalizedAllowed = path.normalize(allowedDir);
      return normalizedPath.startsWith(normalizedAllowed);
    });
  }
  
  /**
   * Determine file type from content or title
   */
  static determineFileType(title: string, content: string): string {
    // Check if HTML
    if (content.includes('<!DOCTYPE') || content.includes('<html')) {
      return 'html';
    }
    
    // Check if JavaScript
    if (content.includes('function ') || content.includes('const ') || content.includes('export ')) {
      return 'js';
    }
    
    // Check if Python
    if (content.includes('def ') || content.includes('import ')) {
      return 'py';
    }
    
    // Check if JSON
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      try {
        JSON.parse(content);
        return 'json';
      } catch {
        // Not valid JSON
      }
    }
    
    // Default to txt
    return 'txt';
  }
}
