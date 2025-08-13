/**
 * Profile Analysis Adapter
 * Minimal facade that unifies profile data and exposes readiness helpers.
 */

import type { UserProfileData } from '@/app/businessidea/tabs/user-profile/types';
import type { ProfileFormData } from '@/app/businessidea/types/profile.types';
import type { ProfileAnalysisData as BaseProfileAnalysisData } from '@/components/chatbox/services/ProfileIntegrationService';
import { transformUserProfileToAnalysisData } from '@/components/chatbox/utils/profile-transformation';
import { getAnalysisStatus } from '@/components/chatbox/utils/profile-transformation';

export type AnalysisInput = UserProfileData | ProfileFormData | BaseProfileAnalysisData;

export type ProfileAnalysisData = BaseProfileAnalysisData;

export interface ReadinessResult {
  ready: boolean;
  completionLevel: number;
  missing: string[];
  requirements: {
    minCompletion: number;
    autoTrigger: boolean;
  };
}

/**
 * Converts any supported input to the normalized analysis payload.
 */
export function toAnalysisData(input: AnalysisInput): ProfileAnalysisData {
  if (!input) {
    throw new Error('No input data provided');
  }

  // Already normalized
  if (input && typeof input === 'object' && 'profile' in input && 'metadata' in input) {
    return input as ProfileAnalysisData;
  }

  // UserProfileData from ReviewStep (has 'role' property but not 'profile')
  if (input && typeof input === 'object' && 'role' in input && !('profile' in input)) {
    return transformUserProfileToAnalysisData(input as UserProfileData);
  }

  // Legacy ProfileFormData — treat same as UserProfileData
  return transformUserProfileToAnalysisData(input as unknown as UserProfileData);
}

/**
 * Returns readiness info for the given profile data.
 */
export function getReadiness(input: AnalysisInput): ReadinessResult {
  try {
    if (!input) {
      return {
        ready: false,
        completionLevel: 0,
        missing: ['valid profile data'],
        requirements: {
          minCompletion: 80,
          autoTrigger: false,
        },
      };
    }

    const data = (input && typeof input === 'object' && 'profile' in input) 
      ? (input as ProfileAnalysisData) 
      : input;
    
    const status = getAnalysisStatus(data as unknown as UserProfileData);
    const minCompletion = 80; // default threshold

    return {
      ready: status.ready,
      completionLevel: status.completionLevel,
      missing: status.missing ?? [],
      requirements: {
        minCompletion,
        autoTrigger: false,
      },
    };
  } catch (error) {
    return {
      ready: false,
      completionLevel: 0,
      missing: ['valid profile data'],
      requirements: {
        minCompletion: 80,
        autoTrigger: false,
      },
    };
  }
}

export default { toAnalysisData, getReadiness };
