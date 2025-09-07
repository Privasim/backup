export interface SpecsSettings {
  // Version tracking for migrations
  version: number;
  
  // Profile-driven settings (replaces preset, length, systemPrompt)
  docProfile: 'prd' | 'prd-design' | 'full-suite';
  
  // Derived from docProfile but stored for consistency
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
  outlineStyle: 'numbered' | 'bulleted' | 'headings';
  audienceLevel: 'exec' | 'pm' | 'engineer';
  tone: 'concise' | 'detailed' | 'formal' | 'neutral';
  
  // User-selectable settings
  language: string;
  
  // Constraints derived from profile
  tokenBudget?: number; // Replaces maxTokens with profile-driven value
}

export interface SpecsGenerationRequest {
  planText: string;           // Derived from Implementation Plan context (optional when source='suggestion')
  settings: SpecsSettings;    // Current settings state
  model: string;              // From Chatbox configuration
  apiKey: string;             // From Chatbox configuration
  streaming?: boolean;        // Default true
  source?: 'plan' | 'suggestion';
  suggestion?: {
    description: string;
    keyFeatures: string[];
  };
}

export interface SpecsGenerationResult {
  markdown: string;           // Final spec in Markdown
  meta: {
    createdAt: string;        // ISO timestamp
    tokenBudget?: number;     // Profile-driven token budget
    source: 'plan' | 'suggestion';
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
   * Update settings with partial settings object
   * @param settings - Partial settings to update
   */
  updateSettings: (settings: Partial<SpecsSettings>) => void;
  
  /**
   * Generate a technical specification based on the implementation plan
   * @param opts - Options for generation (streaming, connect to conversation)
   */
  generate: (opts?: { streaming?: boolean; connectToConversation?: boolean; source?: 'plan' | 'suggestion'; suggestion?: { description: string; keyFeatures: string[] } }) => Promise<void>;
  
  /**
   * Cancel the current generation (placeholder implementation)
   */
  cancel: () => void;
  
  /**
   * Reset the generator state
   */
  reset: () => void;
  
  /**
   * Set the document profile for the specification
   * @param profile - The profile to use (prd, prd-design, full-suite)
   */
  setDocProfile: (profile: 'prd' | 'prd-design' | 'full-suite') => void;
  
  /**
   * Set the language
   * @param language - The language to use
   */
  setLanguage: (language: string) => void;
  
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
}

export interface SpecsGeneratorContextValue {
  state: SpecsGeneratorState;
  settings: SpecsSettings;
  actions: SpecsGeneratorActions;
}
