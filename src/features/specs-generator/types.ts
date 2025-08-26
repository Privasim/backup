export interface SpecsSettings {
  // Version tracking for migrations
  version: number;
  
  // Existing fields
  length: 5 | 10 | 15;
  systemPrompt: string;
  
  // New enhanced fields
  preset: 'web-app' | 'api-service' | 'data-pipeline' | 'custom';
  
  // Section inclusion toggles
  include: {
    requirements: boolean;
    api: boolean;
    dataModel: boolean;
    nonFunctional: boolean;
    security: boolean;
    risks: boolean;
    acceptance: boolean;
    glossary: boolean;
  };
  
  // Formatting options
  outlineStyle: 'numbered' | 'bulleted' | 'headings';
  audienceLevel: 'exec' | 'pm' | 'engineer';
  tone: 'concise' | 'detailed' | 'formal' | 'neutral';
  language: string;
  
  // Constraints
  maxTokens?: number;
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
  /**
   * Set the length of the specification (in lines)
   * @param length - The desired length (5, 10, or 15 lines)
   */
  setLength: (length: 5 | 10 | 15) => void;
  
  /**
   * Set the system prompt for the specification generator
   * @param systemPrompt - Custom instructions for the generator
   */
  setSystemPrompt: (systemPrompt: string) => void;
  
  /**
   * Update settings with partial settings object
   * @param settings - Partial settings to update
   */
  updateSettings: (settings: Partial<SpecsSettings>) => void;
  
  /**
   * Generate a technical specification based on the implementation plan
   * @param opts - Options for generation (streaming, connect to conversation)
   */
  generate: (opts?: { streaming?: boolean; connectToConversation?: boolean }) => Promise<void>;
  
  /**
   * Cancel the current generation (placeholder implementation)
   */
  cancel: () => void;
  
  /**
   * Reset the generator state
   */
  reset: () => void;
  
  /**
   * Set the preset for the specification
   * @param preset - The preset to use
   */
  setPreset: (preset: 'web-app' | 'api-service' | 'data-pipeline' | 'custom') => void;
  
  /**
   * Toggle inclusion of a section
   * @param section - The section to toggle
   */
  toggleSection: (section: keyof SpecsSettings['include']) => void;
  
  /**
   * Set the outline style
   * @param style - The outline style to use
   */
  setOutlineStyle: (style: 'numbered' | 'bulleted' | 'headings') => void;
  
  /**
   * Set the audience level
   * @param level - The audience level to target
   */
  setAudienceLevel: (level: 'exec' | 'pm' | 'engineer') => void;
  
  /**
   * Set the tone
   * @param tone - The tone to use
   */
  setTone: (tone: 'concise' | 'detailed' | 'formal' | 'neutral') => void;
  
  /**
   * Set the language
   * @param language - The language to use
   */
  setLanguage: (language: string) => void;
  
  /**
   * Set the max tokens
   * @param maxTokens - The maximum number of tokens to generate
   */
  setMaxTokens: (maxTokens: number | undefined) => void;
}

export interface SpecsGeneratorContextValue {
  state: SpecsGeneratorState;
  settings: SpecsSettings;
  actions: SpecsGeneratorActions;
}
