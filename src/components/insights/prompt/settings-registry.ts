// File: src/components/insights/prompt/settings-registry.ts

export const PROMPT_SETTINGS_VERSION = 'v1';

export interface PromptSettings {
  name: string;
  tone: 'neutral' | 'professional' | 'optimistic' | 'cautious';
  verbosity: 'short' | 'medium' | 'long';
  audience: 'executive' | 'individual-contributor' | 'hr' | 'general';
  structure: 'paragraph' | 'bulleted' | 'hybrid';
  sections: {
    risk: boolean;
    drivers: boolean;
    automation: boolean;
    skills: boolean;
    mitigation: boolean;
    sources: boolean;
  };
  disclaimer: {
    enabled: boolean;
    style: 'soft' | 'strong';
  };
  compliance: {
    focused: boolean;
  };
  constraints: {
    avoidOverclaiming: boolean;
    citeSources: boolean;
    maxChars?: number;
  };
  version: typeof PROMPT_SETTINGS_VERSION;
}

export const DEFAULT_PROMPT_SETTINGS: PromptSettings = {
  name: 'Default',
  tone: 'neutral',
  verbosity: 'medium',
  audience: 'general',
  structure: 'paragraph',
  sections: {
    risk: true,
    drivers: true,
    automation: true,
    skills: true,
    mitigation: true,
    sources: true,
  },
  disclaimer: {
    enabled: true,
    style: 'soft',
  },
  compliance: {
    focused: false,
  },
  constraints: {
    avoidOverclaiming: true,
    citeSources: true,
    maxChars: 2000,
  },
  version: PROMPT_SETTINGS_VERSION,
};

export const getPresets = (): Array<{ id: string; name: string; settings: PromptSettings }> => [
  {
    id: 'default',
    name: 'Default',
    settings: DEFAULT_PROMPT_SETTINGS,
  },
  {
    id: 'executive-brief',
    name: 'Executive Brief',
    settings: {
      ...DEFAULT_PROMPT_SETTINGS,
      name: 'Executive Brief',
      tone: 'professional',
      verbosity: 'short',
      audience: 'executive',
      structure: 'bulleted',
    },
  },
  {
    id: 'technical-detail',
    name: 'Technical Detail',
    settings: {
      ...DEFAULT_PROMPT_SETTINGS,
      name: 'Technical Detail',
      tone: 'professional',
      verbosity: 'long',
      audience: 'individual-contributor',
      structure: 'hybrid',
    },
  },
];

export const migrateSettings = (prev: unknown): PromptSettings => {
  // For now, we only have v1, so we'll just return defaults for any previous version
  // In the future, this would handle migrating from older versions
  return DEFAULT_PROMPT_SETTINGS;
};
