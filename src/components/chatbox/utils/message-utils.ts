import { ChatboxMessage, AnalysisType } from '../types';

/**
 * Utilities for managing chatbox messages
 */

/**
 * Create a new message with generated ID and timestamp
 */
export const createMessage = (
  type: ChatboxMessage['type'],
  content: string,
  options: {
    analysisType?: AnalysisType;
    metadata?: Record<string, any>;
  } = {}
): ChatboxMessage => {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    content,
    timestamp: new Date().toISOString(),
    analysisType: options.analysisType,
    metadata: options.metadata
  };
};

/**
 * Filter messages by type
 */
export const filterMessagesByType = (
  messages: ChatboxMessage[],
  type: ChatboxMessage['type']
): ChatboxMessage[] => {
  return messages.filter(message => message.type === type);
};

/**
 * Filter messages by analysis type
 */
export const filterMessagesByAnalysisType = (
  messages: ChatboxMessage[],
  analysisType: AnalysisType
): ChatboxMessage[] => {
  return messages.filter(message => message.analysisType === analysisType);
};

/**
 * Get messages from a specific time range
 */
export const getMessagesInTimeRange = (
  messages: ChatboxMessage[],
  startTime: Date,
  endTime: Date
): ChatboxMessage[] => {
  return messages.filter(message => {
    const messageTime = new Date(message.timestamp);
    return messageTime >= startTime && messageTime <= endTime;
  });
};

/**
 * Get the last N messages
 */
export const getLastMessages = (
  messages: ChatboxMessage[],
  count: number
): ChatboxMessage[] => {
  return messages.slice(-count);
};

/**
 * Search messages by content
 */
export const searchMessages = (
  messages: ChatboxMessage[],
  query: string,
  caseSensitive: boolean = false
): ChatboxMessage[] => {
  const searchTerm = caseSensitive ? query : query.toLowerCase();
  
  return messages.filter(message => {
    const content = caseSensitive ? message.content : message.content.toLowerCase();
    return content.includes(searchTerm);
  });
};

/**
 * Group messages by analysis type
 */
export const groupMessagesByAnalysisType = (
  messages: ChatboxMessage[]
): Record<string, ChatboxMessage[]> => {
  const groups: Record<string, ChatboxMessage[]> = {};
  
  messages.forEach(message => {
    const key = message.analysisType || 'general';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(message);
  });
  
  return groups;
};

/**
 * Get conversation pairs (user message followed by assistant response)
 */
export const getConversationPairs = (
  messages: ChatboxMessage[]
): Array<{ user: ChatboxMessage; assistant: ChatboxMessage }> => {
  const pairs: Array<{ user: ChatboxMessage; assistant: ChatboxMessage }> = [];
  
  for (let i = 0; i < messages.length - 1; i++) {
    const current = messages[i];
    const next = messages[i + 1];
    
    if (current.type === 'user' && next.type === 'assistant') {
      pairs.push({ user: current, assistant: next });
    }
  }
  
  return pairs;
};

/**
 * Calculate message statistics
 */
export const getMessageStatistics = (messages: ChatboxMessage[]) => {
  const stats = {
    total: messages.length,
    byType: {} as Record<string, number>,
    byAnalysisType: {} as Record<string, number>,
    totalCharacters: 0,
    averageLength: 0,
    timeSpan: {
      start: null as Date | null,
      end: null as Date | null,
      duration: 0
    }
  };
  
  // Count by type
  messages.forEach(message => {
    stats.byType[message.type] = (stats.byType[message.type] || 0) + 1;
    
    if (message.analysisType) {
      stats.byAnalysisType[message.analysisType] = 
        (stats.byAnalysisType[message.analysisType] || 0) + 1;
    }
    
    stats.totalCharacters += message.content.length;
  });
  
  // Calculate average length
  stats.averageLength = messages.length > 0 ? stats.totalCharacters / messages.length : 0;
  
  // Calculate time span
  if (messages.length > 0) {
    const timestamps = messages.map(m => new Date(m.timestamp)).sort((a, b) => a.getTime() - b.getTime());
    stats.timeSpan.start = timestamps[0];
    stats.timeSpan.end = timestamps[timestamps.length - 1];
    stats.timeSpan.duration = stats.timeSpan.end.getTime() - stats.timeSpan.start.getTime();
  }
  
  return stats;
};

/**
 * Export messages to different formats
 */
export const exportMessages = {
  /**
   * Export as plain text
   */
  toText: (messages: ChatboxMessage[]): string => {
    return messages.map(message => {
      const timestamp = new Date(message.timestamp).toLocaleString();
      const type = message.type.toUpperCase();
      return `[${timestamp}] ${type}: ${message.content}`;
    }).join('\n\n');
  },

  /**
   * Export as JSON
   */
  toJSON: (messages: ChatboxMessage[]): string => {
    return JSON.stringify(messages, null, 2);
  },

  /**
   * Export as CSV
   */
  toCSV: (messages: ChatboxMessage[]): string => {
    const headers = ['ID', 'Type', 'Content', 'Timestamp', 'Analysis Type'];
    const rows = messages.map(message => [
      message.id,
      message.type,
      `"${message.content.replace(/"/g, '""')}"`, // Escape quotes
      message.timestamp,
      message.analysisType || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  },

  /**
   * Export as Markdown
   */
  toMarkdown: (messages: ChatboxMessage[]): string => {
    return messages.map(message => {
      const timestamp = new Date(message.timestamp).toLocaleString();
      const type = message.type === 'user' ? '👤 User' : 
                   message.type === 'assistant' ? '🤖 Assistant' :
                   message.type === 'system' ? '⚙️ System' : '❌ Error';
      
      return `## ${type}\n*${timestamp}*\n\n${message.content}\n`;
    }).join('\n---\n\n');
  }
};

/**
 * Validate message structure
 */
export const validateMessage = (message: any): message is ChatboxMessage => {
  return (
    typeof message === 'object' &&
    message !== null &&
    typeof message.id === 'string' &&
    typeof message.type === 'string' &&
    ['user', 'assistant', 'system', 'error'].includes(message.type) &&
    typeof message.content === 'string' &&
    typeof message.timestamp === 'string' &&
    !isNaN(Date.parse(message.timestamp))
  );
};

/**
 * Clean up old messages (keep only recent ones)
 */
export const cleanupOldMessages = (
  messages: ChatboxMessage[],
  maxMessages: number = 100,
  maxAge: number = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
): ChatboxMessage[] => {
  const now = Date.now();
  
  // Filter by age
  const recentMessages = messages.filter(message => {
    const messageTime = new Date(message.timestamp).getTime();
    return (now - messageTime) <= maxAge;
  });
  
  // Keep only the most recent messages
  return recentMessages.slice(-maxMessages);
};