'use client';

import { useEffect, useCallback } from 'react';
import { useChatbox } from '../ChatboxProvider';
import { profileIntegrationService, ProfileAnalysisData } from '../services/ProfileIntegrationService';
import { transformUserProfileToAnalysisData, validateProfileReadiness, getAnalysisStatus } from '../utils/profile-transformation';

/**
 * Hook for integrating chatbox with profile system
 */
export const useProfileIntegration = () => {
  const { 
    openChatbox, 
    startAnalysis, 
    status,
    messages,
    clearMessages 
  } = useChatbox();

  // Set up integration service listener
  useEffect(() => {
    const handleAnalysisTrigger = async (data: ProfileAnalysisData) => {
      try {
        // Open chatbox and start analysis
        openChatbox();
        await startAnalysis(true, data);
      } catch (error) {
        console.error('Auto-analysis failed:', error);
      }
    };

    // Add listener
    profileIntegrationService.addAnalysisListener(handleAnalysisTrigger);

    // Cleanup
    return () => {
      profileIntegrationService.removeAnalysisListener(handleAnalysisTrigger);
    };
  }, [openChatbox, startAnalysis]);

  /**
   * Transform profile data from business idea format to analysis format
   */
  const transformProfileData = useCallback((profileData: any): ProfileAnalysisData => {
    // Use our new transformation utility for UserProfileData
    return transformUserProfileToAnalysisData(profileData);
  }, []);

  /**
   * Trigger profile analysis
   */
  const triggerProfileAnalysis = useCallback(async (profileData: any, options?: {
    autoOpen?: boolean;
    clearPrevious?: boolean;
    useStreaming?: boolean;
  }) => {
    const { 
      autoOpen = true, 
      clearPrevious = true, 
      useStreaming = true 
    } = options || {};

    try {
      // Validate profile data first
      if (!profileData) {
        throw new Error('No profile data provided for analysis');
      }

      // Transform profile data
      const analysisData = transformProfileData(profileData);

      // Validate transformed data
      if (!analysisData || !analysisData.profileType) {
        throw new Error('Profile data transformation failed');
      }

      // Clear previous messages if requested
      if (clearPrevious) {
        clearMessages();
      }

      // Open chatbox if requested
      if (autoOpen) {
        openChatbox();
      }

      // Start analysis with transformed data
      await startAnalysis(useStreaming, analysisData);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Profile analysis trigger failed:', errorMessage, error);
      
      // Try to show error in chatbox if it's open
      try {
        if (autoOpen) {
          openChatbox();
        }
        // Could add error message to chatbox here if needed
      } catch (uiError) {
        console.error('Failed to show error in UI:', uiError);
      }
      
      return false;
    }
  }, [transformProfileData, clearMessages, openChatbox, startAnalysis]);

  /**
   * Check if profile analysis is available
   */
  const isAnalysisAvailable = useCallback((profileData: any): boolean => {
    // Use our new validation utility for UserProfileData
    try {
      const validation = validateProfileReadiness(profileData);
      return validation.ready;
    } catch {
      return false;
    }
  }, []);

  /**
   * Get analysis readiness status
   */
  const getAnalysisReadiness = useCallback((profileData: any) => {
    // Use our new validation utility for UserProfileData
    try {
      return getAnalysisStatus(profileData);
    } catch {
      return {
        ready: false,
        completionLevel: 0,
        missing: ['valid profile data'],
        requirements: {
          minCompletion: 80,
          autoTrigger: true
        }
      };
    }
  }, []);

  return {
    // Actions
    triggerProfileAnalysis,
    
    // Status checks
    isAnalysisAvailable,
    getAnalysisReadiness,
    
    // Chatbox state
    analysisStatus: status,
    analysisMessages: messages,
    
    // Utilities
    transformProfileData
  };
};

export default useProfileIntegration;