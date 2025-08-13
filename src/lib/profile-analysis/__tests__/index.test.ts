/**
 * Tests for Profile Analysis Adapter
 */

import { toAnalysisData, getReadiness, type AnalysisInput } from '../index';
import { UserProfileData, Role } from '@/app/businessidea/tabs/user-profile/types';
import { ProfileFormData } from '@/app/businessidea/types/profile.types';

// Mock the transformation utilities
jest.mock('@/components/chatbox/utils/profile-transformation', () => ({
  transformUserProfileToAnalysisData: jest.fn(),
  getAnalysisStatus: jest.fn(),
}));

const mockTransformUserProfileToAnalysisData = require('@/components/chatbox/utils/profile-transformation').transformUserProfileToAnalysisData;
const mockGetAnalysisStatus = require('@/components/chatbox/utils/profile-transformation').getAnalysisStatus;

describe('Profile Analysis Adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('toAnalysisData', () => {
    it('should return ProfileAnalysisData as-is when already normalized', () => {
      const input = {
        profile: { role: 'student' },
        metadata: { completionLevel: 80 }
      };

      const result = toAnalysisData(input as any);
      
      expect(result).toBe(input);
      expect(mockTransformUserProfileToAnalysisData).not.toHaveBeenCalled();
    });

    it('should transform UserProfileData using transformation utility', () => {
      const mockTransformed = {
        profileType: 'student',
        experience: [],
        skills: { technical: [], soft: [], languages: [], certifications: [] },
        metadata: { completionLevel: 60 }
      };

      mockTransformUserProfileToAnalysisData.mockReturnValue(mockTransformed);

      const userProfile: UserProfileData = {
        role: Role.Student,
        roleDetails: {
          role: Role.Student,
          student: {
            educationLevel: 'Bachelor',
            fieldOfStudy: 'Computer Science',
            graduationYear: '2025',
            status: 'Full-time',
            studentGoals: ['Get internship']
          }
        },
        industry: 'Technology',
        location: 'Remote',
        workPreference: 'Remote',
        skills: ['JavaScript', 'React'],
        goals: ['Learn new skills']
      };

      const result = toAnalysisData(userProfile);

      expect(result).toBe(mockTransformed);
      expect(mockTransformUserProfileToAnalysisData).toHaveBeenCalledWith(userProfile);
    });

    it('should handle ProfileFormData by treating it as UserProfileData', () => {
      const mockTransformed = {
        profileType: 'professional',
        experience: [],
        skills: { technical: [], soft: [], languages: [], certifications: [] },
        metadata: { completionLevel: 90 }
      };

      mockTransformUserProfileToAnalysisData.mockReturnValue(mockTransformed);

      const profileForm: ProfileFormData = {
        profileType: 'working_full_time',
        yearsExperience: 5,
        currentRole: 'Developer'
      } as any;

      const result = toAnalysisData(profileForm);

      expect(result).toBe(mockTransformed);
      expect(mockTransformUserProfileToAnalysisData).toHaveBeenCalledWith(profileForm);
    });
  });

  describe('getReadiness', () => {
    it('should return readiness for UserProfileData', () => {
      const mockStatus = {
        ready: true,
        completionLevel: 85,
        missing: [],
        requirements: { minCompletion: 80, autoTrigger: true }
      };

      mockGetAnalysisStatus.mockReturnValue(mockStatus);

      const userProfile: UserProfileData = {
        role: Role.Professional,
        roleDetails: {
          role: Role.Professional,
          professional: {
            yearsExperience: '5',
            jobFunction: 'Software Engineer',
            seniority: 'Senior',
            professionalGoals: ['Career growth']
          }
        },
        industry: 'Technology',
        location: 'New York',
        workPreference: 'Hybrid',
        skills: ['JavaScript', 'Python', 'React'],
        goals: ['Lead a team']
      };

      const result = getReadiness(userProfile);

      expect(result).toEqual({
        ready: true,
        completionLevel: 85,
        missing: [],
        requirements: {
          minCompletion: 80,
          autoTrigger: false // Note: adapter sets this to false
        }
      });
      expect(mockGetAnalysisStatus).toHaveBeenCalledWith(userProfile);
    });

    it('should return readiness for already normalized ProfileAnalysisData', () => {
      const mockStatus = {
        ready: false,
        completionLevel: 60,
        missing: ['skills', 'location'],
        requirements: { minCompletion: 80, autoTrigger: true }
      };

      mockGetAnalysisStatus.mockReturnValue(mockStatus);

      const analysisData = {
        profile: { role: 'student' },
        metadata: { completionLevel: 60 }
      };

      const result = getReadiness(analysisData as any);

      expect(result).toEqual({
        ready: false,
        completionLevel: 60,
        missing: ['skills', 'location'],
        requirements: {
          minCompletion: 80,
          autoTrigger: false
        }
      });
      expect(mockGetAnalysisStatus).toHaveBeenCalledWith(analysisData);
    });

    it('should handle incomplete profiles with missing fields', () => {
      const mockStatus = {
        ready: false,
        completionLevel: 40,
        missing: ['role details', 'skills', 'industry'],
        requirements: { minCompletion: 80, autoTrigger: true }
      };

      mockGetAnalysisStatus.mockReturnValue(mockStatus);

      const incompleteProfile: Partial<UserProfileData> = {
        role: Role.Student,
        location: 'Boston'
      };

      const result = getReadiness(incompleteProfile as UserProfileData);

      expect(result.ready).toBe(false);
      expect(result.completionLevel).toBe(40);
      expect(result.missing).toEqual(['role details', 'skills', 'industry']);
      expect(result.requirements.minCompletion).toBe(80);
      expect(result.requirements.autoTrigger).toBe(false);
    });
  });

  describe('type guards and edge cases', () => {
    it('should handle null/undefined input gracefully', () => {
      mockGetAnalysisStatus.mockImplementation(() => {
        throw new Error('Invalid input');
      });

      expect(() => toAnalysisData(null as any)).toThrow();
      expect(() => getReadiness(null as any)).not.toThrow();
      
      const result = getReadiness(null as any);
      expect(result.ready).toBe(false);
      expect(result.missing).toEqual(['valid profile data']);
    });

    it('should correctly identify ProfileAnalysisData by structure', () => {
      const profileAnalysisData = {
        profile: { role: 'entrepreneur' },
        metadata: { completionLevel: 95, lastModified: '2025-01-01' }
      };

      const result = toAnalysisData(profileAnalysisData as any);
      expect(result).toBe(profileAnalysisData);
      expect(mockTransformUserProfileToAnalysisData).not.toHaveBeenCalled();
    });

    it('should correctly identify UserProfileData by structure', () => {
      const mockTransformed = {
        profileType: 'career_shifter',
        experience: [],
        skills: { technical: [], soft: [], languages: [], certifications: [] },
        metadata: { completionLevel: 70 }
      };

      mockTransformUserProfileToAnalysisData.mockReturnValue(mockTransformed);

      const userProfileData = {
        role: Role.CareerShifter,
        roleDetails: {
          role: Role.CareerShifter,
          shifter: {
            previousField: 'Marketing',
            desiredField: 'Technology',
            timeline: '6 months',
            workPreference: 'Remote',
            transitionGoals: ['Learn coding']
          }
        },
        // Note: no 'profile' or 'metadata' properties
        industry: 'Technology',
        skills: ['Communication']
      };

      const result = toAnalysisData(userProfileData as any);
      expect(result).toBe(mockTransformed);
      expect(mockTransformUserProfileToAnalysisData).toHaveBeenCalledWith(userProfileData);
    });
  });
});