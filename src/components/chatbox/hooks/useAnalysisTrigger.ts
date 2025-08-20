'use client';

import { useState } from 'react';
import { useProfileIntegration } from './useProfileIntegration';
import { UserProfileData } from '@/app/businessidea/tabs/user-profile/types';

export type TriggerOptions = {
  autoOpen?: boolean;
  clearPrevious?: boolean;
  useStreaming?: boolean;
};

export type TriggerCallbacks = {
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
};

export interface UseAnalysisTriggerReturn<T> {
  isTriggering: boolean;
  error: Error | null;
  triggerAnalysis: (
    profile: T,
    options?: TriggerOptions,
    callbacks?: TriggerCallbacks
  ) => Promise<boolean>;
}

/**
 * Hook for triggering profile analysis with shared logic
 * Can be used in any component that needs to trigger analysis
 */
export function useAnalysisTrigger<T = UserProfileData>(): UseAnalysisTriggerReturn<T> {
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { triggerProfileAnalysis, getAnalysisReadiness } = useProfileIntegration();

  const triggerAnalysis = async (
    profile: T,
    options: TriggerOptions = { autoOpen: true, clearPrevious: true, useStreaming: true },
    callbacks?: TriggerCallbacks
  ): Promise<boolean> => {
    // Call onStart before changing state to match original behavior
    callbacks?.onStart?.();
    
    setIsTriggering(true);
    setError(null);

    try {
      // Check readiness
      const readiness = getAnalysisReadiness(profile);
      if (!readiness.ready) {
        throw new Error(`Profile is not ready for analysis. Missing: ${readiness.missing.join(', ')}`);
      }

      // Trigger analysis
      const success = await triggerProfileAnalysis(profile, options);
      
      if (success) {
        callbacks?.onComplete?.();
      }
      
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to trigger analysis');
      setError(error);
      callbacks?.onError?.(error);
      console.error('Analysis trigger failed:', error);
      return false;
    } finally {
      setIsTriggering(false);
    }
  };

  return {
    isTriggering,
    error,
    triggerAnalysis,
  };
}

export default useAnalysisTrigger;
