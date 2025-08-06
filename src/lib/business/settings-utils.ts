export interface BusinessPlanSettings {
  autoRefresh: boolean;
  showViabilityScores: boolean;
  sortBy: string;
  maxSuggestions: number;
  includeMarketData: boolean;
  systemPrompt: {
    enabled: boolean;
    templateId: string;
    customPrompt: string;
  };
}

export const getDefaultBusinessPlanSettings = (): BusinessPlanSettings => ({
  autoRefresh: true,
  showViabilityScores: true,
  sortBy: 'viability',
  maxSuggestions: 10,
  includeMarketData: true,
  systemPrompt: {
    enabled: false,
    templateId: '',
    customPrompt: ''
  }
});

export const getBusinessPlanSettings = (): BusinessPlanSettings => {
  try {
    const stored = localStorage.getItem('businessPlanSettings');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate old settings that don't have systemPrompt
      if (!parsed.systemPrompt) {
        parsed.systemPrompt = {
          enabled: false,
          templateId: '',
          customPrompt: ''
        };
      }
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to load business plan settings, using defaults:', error);
  }
  return getDefaultBusinessPlanSettings();
};

export const saveBusinessPlanSettings = (settings: BusinessPlanSettings): void => {
  try {
    localStorage.setItem('businessPlanSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save business plan settings:', error);
  }
};

export const getCustomSystemPrompt = (): string | undefined => {
  const settings = getBusinessPlanSettings();
  if (settings.systemPrompt.enabled && settings.systemPrompt.customPrompt) {
    return settings.systemPrompt.customPrompt;
  }
  return undefined;
};