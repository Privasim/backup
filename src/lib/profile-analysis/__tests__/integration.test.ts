/**
 * Integration tests for Profile Analysis Adapter
 */

import { toAnalysisData, getReadiness } from '../index';
import { UserProfileData, Role } from '@/app/businessidea/tabs/user-profile/types';

// Mock the transformation utilities
jest.mock('@/components/chatbox/utils/profile-transformation', () => ({
  transformUserProfileToAnalysisData: jest.fn(),
  getAnalysisStatus: jest.fn(),
}));

const mockTransformUserProfileToAnalysisData = require('@/components/chatbox/utils/profile-transformation').transformUserProfileToAnalysisData;
const mockGetAnalysisStatus = require('@/components/chatbox/utils/profile-transformation').getAnalysisStatus;

describe('Profile Analysis Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle complete user profile flow', () => {
    // Mock complete profile
    const completeProfile: UserProfileData = {
      role: Role.Professional,
      roleDetails: {
        role: Role.Professional,
        professional: {
          yearsExperience: '5',
          jobFunction: 'Software Engineer',
          seniority: 'Senior',
          professionalGoals: ['Lead a team', 'Learn new technologies']
        }
      },
      industry: 'Technology',
      location: 'San Francisco',
      workPreference: 'Remote',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
      goals: ['Career advancement', 'Technical leadership'],
      hobbies: ['Reading', 'Hiking'],
      interests: ['AI/ML', 'Open Source'],
      values: ['Innovation', 'Work-life balance']
    };

    // Mock transformation result
    const mockAnalysisData = {
      profileType: 'professional',
      experience: [
        {
          title: 'Software Engineer',
          company: 'Current Organization',
          duration: '5 years of experience',
          description: 'Senior level professional'
        }
      ],
      skills: {
        technical: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        soft: [],
        languages: [],
        certifications: []
      },
      metadata: {
        completionLevel: 95,
        lastModified: '2025-01-01T00:00:00.000Z'
      }
    };

    // Mock readiness result
    const mockReadiness = {
      ready: true,
      completionLevel: 95,
      missing: [],
      requirements: { minCompletion: 80, autoTrigger: true }
    };

    mockTransformUserProfileToAnalysisData.mockReturnValue(mockAnalysisData);
    mockGetAnalysisStatus.mockReturnValue(mockReadiness);

    // Test transformation
    const analysisData = toAnalysisData(completeProfile);
    expect(analysisData).toBe(mockAnalysisData);
    expect(mockTransformUserProfileToAnalysisData).toHaveBeenCalledWith(completeProfile);

    // Test readiness
    const readiness = getReadiness(completeProfile);
    expect(readiness.ready).toBe(true);
    expect(readiness.completionLevel).toBe(95);
    expect(readiness.missing).toEqual([]);
    expect(readiness.requirements.autoTrigger).toBe(false); // Adapter overrides this
  });

  it('should handle incomplete user profile flow', () => {
    // Mock incomplete profile
    const incompleteProfile: Partial<UserProfileData> = {
      role: Role.Student,
      industry: 'Technology'
      // Missing: roleDetails, location, workPreference, skills, etc.
    };

    // Mock readiness result for incomplete profile
    const mockReadiness = {
      ready: false,
      completionLevel: 30,
      missing: ['role details', 'location', 'work preference', 'skills'],
      requirements: { minCompletion: 80, autoTrigger: true }
    };

    mockGetAnalysisStatus.mockReturnValue(mockReadiness);

    // Test readiness check
    const readiness = getReadiness(incompleteProfile as UserProfileData);
    expect(readiness.ready).toBe(false);
    expect(readiness.completionLevel).toBe(30);
    expect(readiness.missing).toEqual(['role details', 'location', 'work preference', 'skills']);
    expect(readiness.requirements.minCompletion).toBe(80);
    expect(readiness.requirements.autoTrigger).toBe(false); // Adapter overrides this
  });

  it('should handle already normalized ProfileAnalysisData', () => {
    const normalizedData = {
      profile: { role: 'entrepreneur' },
      metadata: { completionLevel: 85, lastModified: '2025-01-01T00:00:00.000Z' }
    };

    // Should not call transformation utility
    const result = toAnalysisData(normalizedData as any);
    expect(result).toBe(normalizedData);
    expect(mockTransformUserProfileToAnalysisData).not.toHaveBeenCalled();
  });

  it('should provide consistent interface for different input types', () => {
    const userProfile: UserProfileData = {
      role: Role.CareerShifter,
      roleDetails: {
        role: Role.CareerShifter,
        shifter: {
          previousField: 'Marketing',
          desiredField: 'Technology',
          timeline: '1 year',
          workPreference: 'Hybrid',
          transitionGoals: ['Learn programming']
        }
      },
      industry: 'Technology',
      location: 'Remote',
      workPreference: 'Remote',
      skills: ['Communication', 'Project Management']
    };

    const profileForm = {
      profileType: 'career_shifter',
      experience: [],
      skillset: { technical: [], soft: ['Communication'] }
    };

    const normalizedData = {
      profile: { role: 'career_shifter' },
      metadata: { completionLevel: 70 }
    };

    // Mock responses
    mockTransformUserProfileToAnalysisData.mockReturnValue({
      profileType: 'career_shifter',
      experience: [],
      skills: { technical: [], soft: ['Communication'], languages: [], certifications: [] },
      metadata: { completionLevel: 70 }
    });

    mockGetAnalysisStatus.mockReturnValue({
      ready: false,
      completionLevel: 70,
      missing: ['experience'],
      requirements: { minCompletion: 80, autoTrigger: true }
    });

    // All should work with the same interface
    expect(() => toAnalysisData(userProfile)).not.toThrow();
    expect(() => toAnalysisData(profileForm as any)).not.toThrow();
    expect(() => toAnalysisData(normalizedData as any)).not.toThrow();

    expect(() => getReadiness(userProfile)).not.toThrow();
    expect(() => getReadiness(profileForm as any)).not.toThrow();
    expect(() => getReadiness(normalizedData as any)).not.toThrow();

    // All readiness results should have consistent structure
    const readiness1 = getReadiness(userProfile);
    const readiness2 = getReadiness(profileForm as any);
    const readiness3 = getReadiness(normalizedData as any);

    [readiness1, readiness2, readiness3].forEach(readiness => {
      expect(typeof readiness.ready).toBe('boolean');
      expect(typeof readiness.completionLevel).toBe('number');
      expect(Array.isArray(readiness.missing)).toBe(true);
      expect(typeof readiness.requirements.minCompletion).toBe('number');
      expect(typeof readiness.requirements.autoTrigger).toBe('boolean');
      expect(readiness.requirements.autoTrigger).toBe(false); // Adapter always sets to false
    });
  });
});