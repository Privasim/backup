export interface DebugLogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  category: 'api' | 'validation' | 'analysis' | 'progress' | 'system';
  message: string;
  data?: any;
  duration?: number;
}

export class DebugLogger {
  private logs: DebugLogEntry[] = [];
  private listeners: ((logs: DebugLogEntry[]) => void)[] = [];
  private startTimes: Map<string, number> = new Map();

  constructor() {
    this.log('system', 'info', 'Debug logger initialized');
  }

  log(category: DebugLogEntry['category'], level: DebugLogEntry['level'], message: string, data?: any): void {
    const entry: DebugLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      category,
      message,
      data: data ? this.sanitizeData(data) : undefined
    };

    this.logs.push(entry);
    this.notifyListeners();

    // Also log to console for development
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[${category.toUpperCase()}] ${message}`, data || '');
  }

  startTimer(key: string): void {
    this.startTimes.set(key, Date.now());
  }

  endTimer(key: string, category: DebugLogEntry['category'], message: string, data?: any): void {
    const startTime = this.startTimes.get(key);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.startTimes.delete(key);
      
      const entry: DebugLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        level: 'info',
        category,
        message,
        data: data ? this.sanitizeData(data) : undefined,
        duration
      };

      this.logs.push(entry);
      this.notifyListeners();
    }
  }

  info(category: DebugLogEntry['category'], message: string, data?: any): void {
    this.log(category, 'info', message, data);
  }

  warn(category: DebugLogEntry['category'], message: string, data?: any): void {
    this.log(category, 'warn', message, data);
  }

  error(category: DebugLogEntry['category'], message: string, data?: any): void {
    this.log(category, 'error', message, data);
  }

  success(category: DebugLogEntry['category'], message: string, data?: any): void {
    this.log(category, 'success', message, data);
  }

  subscribe(listener: (logs: DebugLogEntry[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getLogs(): DebugLogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
    this.notifyListeners();
    this.log('system', 'info', 'Debug logs cleared');
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  exportLogsAsText(): string {
    return this.logs.map(log => {
      const timestamp = log.timestamp.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        fractionalSecondDigits: 3
      });
      const duration = log.duration ? ` (${log.duration}ms)` : '';
      const data = log.data ? `\nData: ${typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}` : '';
      
      return `[${timestamp}] ${log.level.toUpperCase()} [${log.category.toUpperCase()}]${duration}: ${log.message}${data}`;
    }).join('\n\n');
  }

  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      // Hide API keys
      return data.replace(/sk-[a-zA-Z0-9-_]{20,}/g, 'sk-***HIDDEN***');
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      
      // Hide sensitive fields
      if (sanitized.apiKey) {
        sanitized.apiKey = '***HIDDEN***';
      }
      
      if (sanitized.authorization) {
        sanitized.authorization = '***HIDDEN***';
      }

      // Truncate long content
      if (sanitized.content && typeof sanitized.content === 'string' && sanitized.content.length > 500) {
        sanitized.content = sanitized.content.substring(0, 500) + '... [truncated]';
      }

      return sanitized;
    }
    
    return data;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.logs]));
  }
}

// Global debug logger instance
export const debugLogger = new DebugLogger();