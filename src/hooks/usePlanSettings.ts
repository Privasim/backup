'use client';

import { useCallback, useMemo } from 'react';
import { usePlanSettings as useContext } from '@/contexts/PlanSettingsContext';
import type { PlanSettings } from '@/contexts/PlanSettingsContext';

// Extended hook with additional utilities
export const usePlanSettings = () => {
  const context = useContext();

  // Memoized settings validation
  const isValidVisualizationType = useCallback((type: string): type is PlanSettings['visualizationType'] => {
    return ['standard', 'vertical-timeline'].includes(type);
  }, []);

  // Safe settings update with validation
  const safeUpdateSettings = useCallback((updates: Partial<PlanSettings>) => {
    const validatedUpdates: Partial<PlanSettings> = {};

    // Validate visualization type
    if (updates.visualizationType && isValidVisualizationType(updates.visualizationType)) {
      validatedUpdates.visualizationType = updates.visualizationType;
    }

    // Validate other fields
    if (updates.sessionId && typeof updates.sessionId === 'string') {
      validatedUpdates.sessionId = updates.sessionId;
    }

    if (updates.version && typeof updates.version === 'string') {
      validatedUpdates.version = updates.version;
    }

    // Always update timestamp when making changes
    if (Object.keys(validatedUpdates).length > 0) {
      validatedUpdates.timestamp = Date.now();
      context.updateSettings(validatedUpdates);
    }
  }, [context, isValidVisualizationType]);

  // Get visualization type display name
  const getVisualizationDisplayName = useCallback((type: PlanSettings['visualizationType']): string => {
    switch (type) {
      case 'standard':
        return 'Standard View';
      case 'vertical-timeline':
        return 'Vertical Timeline';
      default:
        return 'Unknown';
    }
  }, []);

  // Get visualization type description
  const getVisualizationDescription = useCallback((type: PlanSettings['visualizationType']): string => {
    switch (type) {
      case 'standard':
        return 'Traditional list-based implementation plan view';
      case 'vertical-timeline':
        return 'Timeline-based view with phases and milestones';
      default:
        return '';
    }
  }, []);

  // Check if settings have been modified from defaults
  const hasCustomSettings = useMemo(() => {
    return context.settings.visualizationType !== 'standard';
  }, [context.settings.visualizationType]);

  // Get available visualization options
  const visualizationOptions = useMemo(() => [
    {
      value: 'standard' as const,
      label: getVisualizationDisplayName('standard'),
      description: getVisualizationDescription('standard'),
    },
    {
      value: 'vertical-timeline' as const,
      label: getVisualizationDisplayName('vertical-timeline'),
      description: getVisualizationDescription('vertical-timeline'),
    },
  ], [getVisualizationDisplayName, getVisualizationDescription]);

  // Settings lifecycle utilities
  const settingsAge = useMemo(() => {
    return Date.now() - context.settings.timestamp;
  }, [context.settings.timestamp]);

  const isSettingsStale = useMemo(() => {
    // Consider settings stale after 24 hours
    const STALE_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours in ms
    return settingsAge > STALE_THRESHOLD;
  }, [settingsAge]);

  return {
    // Core context methods
    ...context,
    
    // Enhanced methods
    safeUpdateSettings,
    
    // Utility methods
    isValidVisualizationType,
    getVisualizationDisplayName,
    getVisualizationDescription,
    
    // Computed properties
    hasCustomSettings,
    visualizationOptions,
    settingsAge,
    isSettingsStale,
  };
};

export default usePlanSettings;