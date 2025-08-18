// File: src/components/insights/prompt/prompt-settings-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  PromptSettings,
  DEFAULT_PROMPT_SETTINGS,
  PROMPT_SETTINGS_VERSION,
  migrateSettings
} from './settings-registry';

interface InsightsPromptContextType {
  settings: PromptSettings;
  setSettings: (settings: PromptSettings) => void;
  resetSettings: () => void;
}

const InsightsPromptContext = createContext<InsightsPromptContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'insights-prompt-settings-v1';

interface InsightsPromptProviderProps {
  children: ReactNode;
}

export const InsightsPromptProvider: React.FC<InsightsPromptProviderProps> = ({ children }) => {
  const [settings, setSettingsState] = useState<PromptSettings>(DEFAULT_PROMPT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Check if we need to migrate
        if (parsed.version !== PROMPT_SETTINGS_VERSION) {
          const migrated = migrateSettings(parsed);
          setSettingsState(migrated);
          // Save migrated settings
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(migrated));
        } else {
          setSettingsState(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load prompt settings from localStorage:', error);
      // Reset to defaults on error
      setSettingsState(DEFAULT_PROMPT_SETTINGS);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save prompt settings to localStorage:', error);
    }
  }, [settings]);

  const setSettings = (newSettings: PromptSettings) => {
    setSettingsState(newSettings);
  };

  const resetSettings = () => {
    setSettingsState(DEFAULT_PROMPT_SETTINGS);
  };

  return (
    <InsightsPromptContext.Provider value={{ settings, setSettings, resetSettings }}>
      {children}
    </InsightsPromptContext.Provider>
  );
};

export const useInsightsPrompt = (): InsightsPromptContextType => {
  const context = useContext(InsightsPromptContext);
  if (context === undefined) {
    throw new Error('useInsightsPrompt must be used within an InsightsPromptProvider');
  }
  return context;
};
