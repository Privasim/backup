'use client';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug' | 'success';
  category: string;
  message: string;
  data?: any;
  stack?: string;
}

class LogStore {
  private logs: LogEntry[] = [];
  private listeners: Set<(logs: LogEntry[]) => void> = new Set();
  private maxLogs = 1000;

  addLog(entry: Omit<LogEntry, 'id' | 'timestamp'>) {
    const logEntry: LogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.logs.unshift(logEntry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    this.notifyListeners();
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.notifyListeners();
  }

  subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getLogs()));
  }
}

// Global log store instance for chatbox debugging
const chatboxLogStore = new LogStore();

// Logging functions for chatbox components
export const chatboxDebug = {
  info: (category: string, message: string, data?: any) => {
    console.log(`[${category}] ${message}`, data);
    chatboxLogStore.addLog({ level: 'info', category, message, data });
  },
  warn: (category: string, message: string, data?: any) => {
    console.warn(`[${category}] ${message}`, data);
    chatboxLogStore.addLog({ level: 'warn', category, message, data });
  },
  error: (category: string, message: string, data?: any, stack?: string) => {
    console.error(`[${category}] ${message}`, data);
    chatboxLogStore.addLog({ level: 'error', category, message, data, stack });
  },
  debug: (category: string, message: string, data?: any) => {
    console.debug(`[${category}] ${message}`, data);
    chatboxLogStore.addLog({ level: 'debug', category, message, data });
  },
  success: (category: string, message: string, data?: any) => {
    console.log(`[${category}] ${message}`, data);
    chatboxLogStore.addLog({ level: 'success', category, message, data });
  },
};

export default chatboxLogStore;
