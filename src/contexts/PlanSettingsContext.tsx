'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';

// Settings interface
export interface PlanSettings {
  visualizationType: 'standard' | 'vertical-timeline';
  sessionId: string;
  timestamp: number;
  version: string;
}

// Context value interface
export interface PlanSettingsContextValue {
  settings: PlanSettings;
  updateSettings: (updates: Partial<PlanSettings>) => void;
  resetSettings: () => void;
}

// Storage interface for persistence
interface StoredSettings {
  settings: PlanSettings;
  metadata: {
    lastUpdated: number;
    userAgent: string;
    version: string;
  };
}

// Default settings
const DEFAULT_SETTINGS: PlanSettings = {
  visualizationType: 'standard',
  sessionId: '',
  timestamp: Date.now(),
  version: '1.0.0',
};

// Storage key
const STORAGE_KEY = 'plan-visualization-settings';

// Create context
const PlanSettingsContext = createContext<PlanSettingsContextValue | null>(null);

// Settings validation
const validateSettings = (settings: any): PlanSettings => {
  const validVisualizationTypes = ['standard', 'vertical-timeline'];
  
  return {
    visualizationType: validVisualizationTypes.includes(settings?.visualizationType) 
      ? settings.visualizationType 
      : DEFAULT_SETTINGS.visualizationType,
    sessionId: typeof settings?.sessionId === 'string' ? settings.sessionId : generateSessionId(),
    timestamp: typeof settings?.timestamp === 'number' ? settings.timestamp : Date.now(),
    version: typeof settings?.version === 'string' ? settings.version : DEFAULT_SETTINGS.version,
  };
};

// Generate unique session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Load settings from localStorage
const loadStoredSettings = (): PlanSettings => {
  try {
    if (typeof window === 'undefined') {
      return { ...DEFAULT_SETTINGS, sessionId: generateSessionId() };
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_SETTINGS, sessionId: generateSessionId() };
    }

    const parsed: StoredSettings = JSON.parse(stored);
    
    // Check version compatibility
    if (parsed.settings.version !== DEFAULT_SETTINGS.version) {
      console.log('Settings version mismatch, using defaults');
      return { ...DEFAULT_SETTINGS, sessionId: generateSessionId() };
    }

    return validateSettings(parsed.settings);
  } catch (error) {
    console.warn('Failed to load stored settings:', error);
    return { ...DEFAULT_SETTINGS, sessionId: generateSessionId() };
  }
};

// Save settings to localStorage
const saveStoredSettings = (settings: PlanSettings): void => {
  try {
    if (typeof window === 'undefined') return;

    const storedSettings: StoredSettings = {
      settings,
      metadata: {
        lastUpdated: Date.now(),
        userAgent: navigator.userAgent,
        version: settings.version,
      },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedSettings));
  } catch (error) {
    console.warn('Failed to save settings:', error);
  }
};

// Provider component
export const PlanSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PlanSettings>(() => loadStoredSettings());

  // Update settings with validation and persistence
  const updateSettings = useCallback((updates: Partial<PlanSettings>) => {
    setSettings(prevSettings => {
      const newSettings = validateSettings({
        ...prevSettings,
        ...updates,
        timestamp: Date.now(),
      });
      
      // Persist to localStorage
      saveStoredSettings(newSettings);
      
      return newSettings;
    });
  }, []);

  // Reset to default settings
  const resetSettings = useCallback(() => {
    const defaultSettings = { ...DEFAULT_SETTINGS, sessionId: generateSessionId() };
    setSettings(defaultSettings);
    saveStoredSettings(defaultSettings);
  }, []);

  // Initialize session ID if not present
  useEffect(() => {
    if (!settings.sessionId) {
      updateSettings({ sessionId: generateSessionId() });
    }
  }, [settings.sessionId, updateSettings]);

  const contextValue: PlanSettingsContextValue = {
    settings,
    updateSettings,
    resetSettings,
  };

  return (
    <PlanSettingsContext.Provider value={contextValue}>
      {children}
    </PlanSettingsContext.Provider>
  );
};

// Hook to use settings context
export const usePlanSettings = (): PlanSettingsContextValue => {
  const context = useContext(PlanSettingsContext);
  
  if (!context) {
    throw new Error('usePlanSettings must be used within a PlanSettingsProvider');
  }
  
  return context;
};

// Export context for testing
export { PlanSettingsContext };