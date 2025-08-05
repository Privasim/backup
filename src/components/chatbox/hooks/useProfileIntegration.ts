'use client';

import { useEffect, useCallback } from 'react';
import { useChatbox } from '../ChatboxProvider';
import { profileIntegrationService, ProfileAnalysisData } from '../services/ProfileIntegrationService';

/**
 * Profile data structure for analysis
 */
export interface ProfileAnalysisData {
  profileType: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    certifications: string[];
  };
  metadata: {
    completionLevel: number;
    lastModified: string;
  };
}

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
    return profileIntegrationService.transformProfileData(profileData);
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
      // Transform profile data
      const analysisData = transformProfileData(profileData);

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
      console.error('Profile analysis trigger failed:', error);
      return false;
    }
  }, [transformProfileData, clearMessages, openChatbox, startAnalysis]);

  /**
   * Check if profile analysis is available
   */
  const isAnalysisAvailable = useCallback((profileData: any): boolean => {
    return profileIntegrationService.isAnalysisReady(profileData);
  }, []);

  /**
   * Get analysis readiness status
   */
  const getAnalysisReadiness = useCallback((profileData: any) => {
    return profileIntegrationService.getAnalysisStatus(profileData);
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