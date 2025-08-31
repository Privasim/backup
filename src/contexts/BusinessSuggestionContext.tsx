'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useChatbox } from '../components/chatbox/ChatboxProvider';
import { BusinessSuggestion } from '@/components/chatbox/types';
import { 
  getTemplates, 
  saveTemplate, 
  deleteTemplate, 
  BusinessTemplate 
} from '../services/TemplateService';

interface BusinessSuggestionContextType {
  businessType: string;
  setBusinessType: (type: string) => void;
  templates: BusinessTemplate[];
  addTemplate: (template: Omit<BusinessTemplate, 'id' | 'createdAt'>) => Promise<BusinessTemplate>;
  removeTemplate: (id: string) => Promise<void>;
  isGenerating: boolean;
  generateSuggestions: () => Promise<BusinessSuggestion[]>;
  suggestions: BusinessSuggestion[];
  error?: string;
}

const BusinessSuggestionContext = createContext<BusinessSuggestionContextType | undefined>(undefined);

export function useBusinessSuggestion() {
  const context = useContext(BusinessSuggestionContext);
  if (!context) {
    throw new Error('useBusinessSuggestion must be used within a BusinessSuggestionProvider');
  }
  return context;
}

interface BusinessSuggestionProviderProps {
  children: ReactNode;
}

export function BusinessSuggestionProvider({ children }: BusinessSuggestionProviderProps) {
  const [businessType, setBusinessType] = useState<string>('SaaS');
  const [templates, setTemplates] = useState<BusinessTemplate[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<BusinessSuggestion[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  
  // Get chatbox context at the top level
  const chatboxContext = useChatbox();

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const loadedTemplates = await getTemplates();
        setTemplates(loadedTemplates);
      } catch (err) {
        console.error('Failed to load templates:', err);
      }
    };
    
    loadTemplates();
  }, []);

  const addTemplate = useCallback(async (templateData: Omit<BusinessTemplate, 'id' | 'createdAt'>) => {
    try {
      const newTemplate: BusinessTemplate = {
        ...templateData,
        id: `template_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      await saveTemplate(newTemplate);
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      console.error('Failed to add template:', err);
      throw err;
    }
  }, []);

  const removeTemplate = useCallback(async (id: string) => {
    try {
      await deleteTemplate(id);
      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (err) {
      console.error('Failed to remove template:', err);
      throw err;
    }
  }, []);

  const generateSuggestions = useCallback(async () => {
    setIsGenerating(true);
    setError(undefined);
    
    try {
      const { businessSuggestionServiceAdapter } = await import('../lib/chatbox/BusinessSuggestionServiceAdapter');
      
      if (!chatboxContext.currentAnalysis) {
        throw new Error('No analysis result available for business suggestion generation');
      }
      
      // Generate suggestions using the adapter
      const generatedSuggestions = await businessSuggestionServiceAdapter.generateSuggestions(
        businessType,
        chatboxContext.currentAnalysis,
        chatboxContext.config,
        chatboxContext.profileData
      );
      
      setSuggestions(generatedSuggestions);
      return generatedSuggestions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate suggestions';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [businessType, chatboxContext]);

  const value = {
    businessType,
    setBusinessType,
    templates,
    addTemplate,
    removeTemplate,
    isGenerating,
    generateSuggestions,
    suggestions,
    error
  };

  return (
    <BusinessSuggestionContext.Provider value={value}>
      {children}
    </BusinessSuggestionContext.Provider>
  );
}
