export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'error' | 'loading';
  content: string;
  timestamp: string;
  phase?: 'outline' | 'full-plan';
  section?: 'overview' | 'phases' | 'tasks' | 'timeline' | 'resources' | 'budget' | 'risks' | 'kpis' | 'next90Days';
  metadata?: {
    isStreaming?: boolean;
    isComplete?: boolean;
    requiresApproval?: boolean;
    approvalAction?: string;
    progress?: number;
    [key: string]: any;
  };
}

export interface ChatState {
  messages: ChatMessage[];
  currentPhase: 'idle' | 'generating-outline' | 'awaiting-approval' | 'generating-plan' | 'completed' | 'error';
  isStreaming: boolean;
  error?: string;
  outline?: any; // PlanOutline from ChatboxProvider
  plan?: any; // ImplementationPlan
}

export interface ChatActions {
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;
  setPhase: (phase: ChatState['currentPhase']) => void;
  setStreaming: (isStreaming: boolean) => void;
  setError: (error?: string) => void;
}

export interface ChatMessageRendererProps {
  message: ChatMessage;
  onApproval?: (action: string) => void;
  className?: string;
}

export interface ChatHistoryProps {
  messages: ChatMessage[];
  onApproval?: (action: string) => void;
  isStreaming?: boolean;
  className?: string;
}