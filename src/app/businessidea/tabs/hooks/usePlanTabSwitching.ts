import { useEffect, useCallback } from 'react';
import { useTab } from '../TabContext';
import { usePlanSync } from '../utils/plan-sync';
import { useChatbox } from '@/components/chatbox/ChatboxProvider';

/**
 * Hook that handles automatic tab switching for implementation plan generation
 */
export function usePlanTabSwitching() {
  const { setActiveTab } = useTab();
  const { planGenerationStatus } = usePlanSync();
  const { status, activeConversationId } = useChatbox();

  // Function to initiate plan generation and switch tabs
  const createPlanAndSwitch = useCallback(async (
    suggestion: any, 
    lengthPreset?: 'brief' | 'standard' | 'long'
  ) => {
    try {
      // Import the chatbox provider to access plan creation
      const { useChatbox } = await import('@/components/chatbox/ChatboxProvider');
      
      // Switch to implementation-plan tab immediately to show loading state
      setActiveTab('implementation-plan');
      
      // The plan generation will be handled by the parent component's onCreatePlan
      // We just need to ensure we're on the right tab
      
    } catch (error) {
      console.error('Failed to create plan and switch tabs:', error);
    }
  }, [setActiveTab]);

  // Auto-switch to implementation-plan tab when generation completes
  useEffect(() => {
    // Only switch if we have an active conversation and generation completed
    if (planGenerationStatus === 'completed' && activeConversationId) {
      // Small delay to ensure content is fully loaded
      const timer = setTimeout(() => {
        setActiveTab('implementation-plan');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [planGenerationStatus, activeConversationId, setActiveTab]);

  return {
    createPlanAndSwitch
  };
}