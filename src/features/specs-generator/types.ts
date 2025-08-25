export interface SpecsSettings {
  length: 5 | 10 | 15;
  systemPrompt: string;
  // Future: templateId?: string; audience?: 'dev' | 'pm'; includeSections?: string[];
}

export interface SpecsGenerationRequest {
  planText: string;           // Derived from Implementation Plan context
  settings: SpecsSettings;    // Current settings state
  model: string;              // From Chatbox configuration
  apiKey: string;             // From Chatbox configuration
  streaming?: boolean;        // Default true
}

export interface SpecsGenerationResult {
  markdown: string;           // Final spec in Markdown
  meta: {
    createdAt: string;        // ISO timestamp
    length: number;           // 5|10|15 (lines)
    source: 'plan';
    conversationId?: string;  // Filled when posted to Chatbox via user action
  };
}

export type SpecsStatus = 'idle' | 'generating' | 'streaming' | 'success' | 'error';

export interface SpecsGeneratorState {
  status: SpecsStatus;
  error?: string;
  preview?: string;            // Streaming buffer content
  result?: SpecsGenerationResult;
}

export interface SpecsGeneratorActions {
  setLength: (l: 5 | 10 | 15) => void;
  setSystemPrompt: (v: string) => void;
  updateSettings: (p: Partial<SpecsSettings>) => void;
  generate: (opts?: { streaming?: boolean; connectToConversation?: boolean }) => Promise<void>;
  cancel: () => void;          // Best-effort; may noop if provider lacks abort
  reset: () => void;
}

export interface SpecsGeneratorContextValue {
  state: SpecsGeneratorState;
  settings: SpecsSettings;
  actions: SpecsGeneratorActions;
}
