import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useChatbox } from '../../components/chatbox/ChatboxProvider';
import { useImplementationPlan } from '../implementation-plan/useImplementationPlan';
import { generateSpecs } from './service';
import { 
  SpecsSettings, 
  SpecsGeneratorState, 
  SpecsGeneratorActions, 
  SpecsGeneratorContextValue 
} from './types';

const STORAGE_KEY = 'specs-generator:v1:settings';

const DEFAULT_SETTINGS: SpecsSettings = {
  version: 2, // Increment when changing settings schema
  length: 10,
  systemPrompt: 'Create a concise technical specification with clear sections for requirements, implementation approach, constraints, and dependencies.',
  preset: 'custom',
  include: {
    requirements: true,
    api: true,
    dataModel: true,
    nonFunctional: true,
    security: true,
    risks: true,
    acceptance: true,
    glossary: true
  },
  outlineStyle: 'numbered',
  audienceLevel: 'engineer',
  tone: 'neutral',
  language: 'English',
  maxTokens: undefined
};

const INITIAL_STATE: SpecsGeneratorState = {
  status: 'idle'
};

// Create context with default value
const SpecsGeneratorContext = createContext<SpecsGeneratorContextValue | undefined>(undefined);

interface SpecsGeneratorProviderProps {
  children: ReactNode;
}

export function SpecsGeneratorProvider({ children }: SpecsGeneratorProviderProps) {
  const [settings, setSettings] = useState<SpecsSettings>(DEFAULT_SETTINGS);
  const [state, setState] = useState<SpecsGeneratorState>(INITIAL_STATE);
  const { config } = useChatbox();
  const { plan } = useImplementationPlan();
  
  // Load settings from localStorage on mount with migration support
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        
        // Handle migration from v1 (old format) to v2 (new format)
        if (parsed && (parsed.version === undefined || parsed.version < 2)) {
          // Migrate from v1 to v2
          const migratedSettings: SpecsSettings = {
            version: 2,
            length: parsed.length || DEFAULT_SETTINGS.length,
            systemPrompt: parsed.systemPrompt || DEFAULT_SETTINGS.systemPrompt,
            preset: DEFAULT_SETTINGS.preset,
            include: { ...DEFAULT_SETTINGS.include },
            outlineStyle: DEFAULT_SETTINGS.outlineStyle,
            audienceLevel: DEFAULT_SETTINGS.audienceLevel,
            tone: DEFAULT_SETTINGS.tone,
            language: DEFAULT_SETTINGS.language,
            maxTokens: DEFAULT_SETTINGS.maxTokens
          };
          
          setSettings(migratedSettings);
          console.log('Migrated specs settings from v1 to v2');
        } 
        // Validate settings structure before applying
        else if (parsed && typeof parsed.version === 'number' && parsed.version >= 2) {
          setSettings(parsed as SpecsSettings);
        }
      }
    } catch (error) {
      console.warn('Failed to load specs generator settings from localStorage:', error);
    }
  }, []);
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save specs generator settings to localStorage:', error);
    }
  }, [settings]);
  
  // Action to update settings
  const updateSettings = (partialSettings: Partial<SpecsSettings>) => {
    setSettings(prev => ({ ...prev, ...partialSettings }));
  };
  
  // Action to set length
  const setLength = (length: 5 | 10 | 15) => {
    setSettings(prev => ({ ...prev, length }));
  };
  
  // Action to set system prompt
  const setSystemPrompt = (systemPrompt: string) => {
    setSettings(prev => ({ ...prev, systemPrompt }));
  };
  
  // Action to set preset
  const setPreset = (preset: 'web-app' | 'api-service' | 'data-pipeline' | 'custom') => {
    setSettings(prev => ({ ...prev, preset }));
  };
  
  // Action to toggle section
  const toggleSection = (section: keyof SpecsSettings['include']) => {
    setSettings(prev => ({
      ...prev,
      include: {
        ...prev.include,
        [section]: !prev.include[section]
      }
    }));
  };
  
  // Action to set outline style
  const setOutlineStyle = (outlineStyle: 'numbered' | 'bulleted' | 'headings') => {
    setSettings(prev => ({ ...prev, outlineStyle }));
  };
  
  // Action to set audience level
  const setAudienceLevel = (audienceLevel: 'exec' | 'pm' | 'engineer') => {
    setSettings(prev => ({ ...prev, audienceLevel }));
  };
  
  // Action to set tone
  const setTone = (tone: 'concise' | 'detailed' | 'formal' | 'neutral') => {
    setSettings(prev => ({ ...prev, tone }));
  };
  
  // Action to set language
  const setLanguage = (language: string) => {
    setSettings(prev => ({ ...prev, language }));
  };
  
  // Action to set max tokens
  const setMaxTokens = (maxTokens: number | undefined) => {
    setSettings(prev => ({ ...prev, maxTokens }));
  };
  
  // Action to reset state
  const reset = () => {
    setState(INITIAL_STATE);
  };
  
  // Action to cancel (placeholder for now)
  const cancel = () => {
    // In a real implementation, this would use AbortController
    // For now, we'll just reset the state
    setState(INITIAL_STATE);
  };
  
  // Action to generate specs
  const generate = async (opts?: { streaming?: boolean; connectToConversation?: boolean }) => {
    // Reset any previous errors
    setState(prev => ({ ...prev, error: undefined }));
    
    // Validate prerequisites
    if (!config.apiKey) {
      setState({
        status: 'error',
        error: 'API key is missing. Please configure your API key in the Chatbox settings.'
      });
      return;
    }
    
    if (!config.model) {
      setState({
        status: 'error',
        error: 'Model is not selected. Please select a model in the Chatbox settings.'
      });
      return;
    }
    
    // Get plan text from implementation plan
    // We'll use the formattedContent if available, otherwise textContent
    const planText = plan?.formattedContent || plan?.textContent || '';
    
    if (!planText.trim()) {
      setState({
        status: 'error',
        error: 'No implementation plan found. Please generate an implementation plan first.'
      });
      return;
    }
    
    // Set state to generating/streaming
    const streaming = opts?.streaming !== false; // default to true
    setState({
      status: streaming ? 'streaming' : 'generating',
      preview: ''
    });
    
    try {
      // Define onChunk handler for streaming
      const onChunk = streaming ? (chunk: string) => {
        setState(prev => ({
          ...prev,
          preview: (prev.preview || '') + chunk
        }));
      } : undefined;
      
      // Call the generation service
      const result = await generateSpecs(
        {
          planText,
          settings,
          model: config.model,
          apiKey: config.apiKey,
          streaming
        },
        onChunk
      );
      
      // Update state with result
      setState({
        status: 'success',
        result
      });
      
      // If connectToConversation is requested, we would handle that here
      // This would involve calling chatbox actions to create a conversation
      // and add the generated markdown as a message
      if (opts?.connectToConversation) {
        // Implementation would go here
        console.log('Connect to conversation requested');
      }
    } catch (error) {
      // Handle errors
      setState({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred during specification generation.'
      });
    }
  };
  
  // Define actions object
  const actions: SpecsGeneratorActions = {
    setLength,
    setSystemPrompt,
    updateSettings,
    generate,
    cancel,
    reset,
    setPreset,
    toggleSection,
    setOutlineStyle,
    setAudienceLevel,
    setTone,
    setLanguage,
    setMaxTokens
  };
  
  // Create context value
  const contextValue: SpecsGeneratorContextValue = {
    state,
    settings,
    actions
  };
  
  return (
    <SpecsGeneratorContext.Provider value={contextValue}>
      {children}
    </SpecsGeneratorContext.Provider>
  );
}

// Hook to use the specs generator context
export function useSpecsGenerator() {
  const context = useContext(SpecsGeneratorContext);
  if (context === undefined) {
    throw new Error('useSpecsGenerator must be used within a SpecsGeneratorProvider');
  }
  return context;
}
