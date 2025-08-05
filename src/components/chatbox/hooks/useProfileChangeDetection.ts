'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useChatbox } from '../ChatboxProvider';

/**
 * Hook for detecting profile changes and suggesting re-analysis
 */
export const useProfileChangeDetection = () => {
  const { status, messages, addMessage } = useChatbox();
  const lastProfileHashRef = useRef<string | null>(null);
  const lastAnalysisTimeRef = useRef<number | null>(null);

  /**
   * Generate a hash of profile data for change detection
   */
  const generateProfileHash = useCallback((profileData: any): string => {
    if (!profileData) return '';

    // Create a simplified representation of the profile for hashing
    const hashData = {
      profileType: profileData.profile?.profileType || '',
      experienceCount: profileData.experience?.length || 0,
      skillsCount: profileData.skillset?.categories?.reduce((total: number, cat: any) => 
        total + (cat.skills?.length || 0), 0) || 0,
      certificationsCount: profileData.skillset?.certificationsDetailed?.length || 0,
      languagesCount: profileData.skillset?.languageProficiency?.length || 0,
      lastModified: profileData.metadata?.lastModified || ''
    };

    // Simple hash function
    return JSON.stringify(hashData);
  }, []);

  /**
   * Check if profile has changed significantly
   */
  const hasProfileChanged = useCallback((profileData: any): boolean => {
    const currentHash = generateProfileHash(profileData);
    const hasChanged = lastProfileHashRef.current !== null && 
                      lastProfileHashRef.current !== currentHash;
    
    // Update the stored hash
    lastProfileHashRef.current = currentHash;
    
    return hasChanged;
  }, [generateProfileHash]);

  /**
   * Check if enough time has passed since last analysis
   */
  const shouldSuggestReanalysis = useCallback((minIntervalMs: number = 300000): boolean => { // 5 minutes default
    if (!lastAnalysisTimeRef.current) return false;
    
    const timeSinceLastAnalysis = Date.now() - lastAnalysisTimeRef.current;
    return timeSinceLastAnalysis > minIntervalMs;
  }, []);

  /**
   * Record that an analysis has been performed
   */
  const recordAnalysis = useCallback(() => {
    lastAnalysisTimeRef.current = Date.now();
  }, []);

  /**
   * Suggest re-analysis when profile changes
   */
  const suggestReanalysis = useCallback((profileData: any, options?: {
    autoSuggest?: boolean;
    minInterval?: number;
    message?: string;
  }) => {
    const { 
      autoSuggest = true, 
      minInterval = 300000, // 5 minutes
      message = 'Your profile has been updated. Would you like to re-analyze it for new insights?'
    } = options || {};

    if (!autoSuggest) return false;

    const profileChanged = hasProfileChanged(profileData);
    const timeElapsed = shouldSuggestReanalysis(minInterval);

    if (profileChanged && timeElapsed) {
      // Add a suggestion message to the chatbox
      addMessage({
        id: `suggestion-${Date.now()}`,
        type: 'system',
        content: message,
        timestamp: new Date().toISOString(),
        metadata: {
          suggestion: true,
          profileHash: generateProfileHash(profileData),
          suggestedAction: 'reanalyze'
        }
      });

      return true;
    }

    return false;
  }, [hasProfileChanged, shouldSuggestReanalysis, addMessage, generateProfileHash]);

  /**
   * Initialize profile tracking
   */
  const initializeTracking = useCallback((profileData: any) => {
    lastProfileHashRef.current = generateProfileHash(profileData);
    
    // Check if there are recent analysis messages
    const recentAnalysis = messages.find(msg => 
      msg.type === 'assistant' && 
      msg.metadata?.analysisType === 'profile' &&
      Date.now() - new Date(msg.timestamp).getTime() < 3600000 // 1 hour
    );

    if (recentAnalysis) {
      lastAnalysisTimeRef.current = new Date(recentAnalysis.timestamp).getTime();
    }
  }, [generateProfileHash, messages]);

  /**
   * Get change detection status
   */
  const getChangeStatus = useCallback((profileData: any) => {
    const currentHash = generateProfileHash(profileData);
    const hasChanged = lastProfileHashRef.current !== null && 
                      lastProfileHashRef.current !== currentHash;
    const timeSinceAnalysis = lastAnalysisTimeRef.current 
      ? Date.now() - lastAnalysisTimeRef.current 
      : null;

    return {
      hasChanged,
      currentHash,
      lastHash: lastProfileHashRef.current,
      timeSinceLastAnalysis: timeSinceAnalysis,
      shouldSuggestReanalysis: hasChanged && (timeSinceAnalysis === null || timeSinceAnalysis > 300000)
    };
  }, [generateProfileHash]);

  /**
   * Reset tracking (useful when starting fresh)
   */
  const resetTracking = useCallback(() => {
    lastProfileHashRef.current = null;
    lastAnalysisTimeRef.current = null;
  }, []);

  // Effect to track analysis completion
  useEffect(() => {
    if (status === 'completed' && lastAnalysisTimeRef.current === null) {
      recordAnalysis();
    }
  }, [status, recordAnalysis]);

  return {
    // Change detection
    hasProfileChanged,
    generateProfileHash,
    
    // Analysis tracking
    recordAnalysis,
    shouldSuggestReanalysis,
    
    // Suggestions
    suggestReanalysis,
    
    // Status
    getChangeStatus,
    
    // Management
    initializeTracking,
    resetTracking
  };
};

export default useProfileChangeDetection;