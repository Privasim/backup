/**
 * Profile Analysis Adapter
 * Minimal facade that unifies profile data and exposes readiness helpers.
 */

import type { UserProfileData } from '@/app/businessidea/tabs/user-profile/types';
import type { ProfileFormData } from '@/app/businessidea/types/profile.types';
import type { ProfileAnalysisData as BaseProfileAnalysisData } from '@/components/chatbox/services/ProfileIntegrationService';
import { transformUserProfileToAnalysisData } from '@/components/chatbox/utils/profile-transformation';
import { getAnalysisStatus } from '@/components/chatbox/utils/profile-transformation';
import { profileIntegrationService } from '@/components/chatbox/services/ProfileIntegrationService';

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

  // If it's already an analysis payload (has 'profileType' and 'skills')
  if (input && typeof input === 'object' && 'profileType' in input && 'skills' in input) {
    return input as BaseProfileAnalysisData;
  }

  // If it's ProfileFormData (has 'profile' and 'skillset')
  if (input && typeof input === 'object' && 'profile' in input && 'skillset' in input) {
    return profileIntegrationService.transformProfileData(input as ProfileFormData);
  }

  // If it's UserProfileData (has 'role' but not 'profile')
  if (input && typeof input === 'object' && 'role' in input && !('profile' in input)) {
    return transformUserProfileToAnalysisData(input as UserProfileData);
  }

  // Fallback: attempt legacy transform
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

    // If input is ProfileFormData (has 'profile' key), use integration service readiness
    if (input && typeof input === 'object' && 'profile' in input) {
      const status = profileIntegrationService.getAnalysisStatus(input as ProfileFormData);
      return {
        ready: status.ready,
        completionLevel: status.completionLevel,
        missing: status.missing ?? [],
        requirements: status.requirements,
      };
    }

    // If input resembles UserProfileData (has 'role'), use legacy readiness
    if (input && typeof input === 'object' && 'role' in input) {
      const status = getAnalysisStatus(input as unknown as UserProfileData);
      const minCompletion = 80; // default threshold for legacy path
      return {
        ready: status.ready,
        completionLevel: status.completionLevel,
        missing: status.missing ?? [],
        requirements: {
          minCompletion,
          autoTrigger: false,
        },
      };
    }

    // Fallback: normalize and infer readiness from transformed analysis data
    const normalized = transformUserProfileToAnalysisData(input as unknown as UserProfileData);
    const ready = normalized.metadata.completionLevel >= 80 && normalized.profileType !== 'unknown';
    return {
      ready,
      completionLevel: normalized.metadata.completionLevel,
      missing: ready ? [] : ['insufficient completion'],
      requirements: { minCompletion: 80, autoTrigger: false },
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
