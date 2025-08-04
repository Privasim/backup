/**
 * @jest-environment node
 */

import { 
  ProfileType, 
  DEFAULT_PROFILE,
  CONDITIONAL_FIELD_CONFIG
} from '../types/profile.types';

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('Profile Context Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile Initialization', () => {
    it('should have valid default profile structure', () => {
      expect(DEFAULT_PROFILE.type).toBe('student');
      expect(DEFAULT_PROFILE.skills).toEqual([]);
      expect(DEFAULT_PROFILE.experience).toEqual([]);
      expect(DEFAULT_PROFILE.skillset).toBeDefined();
      expect(DEFAULT_PROFILE.profileData).toBeDefined();
      expect(DEFAULT_PROFILE.metadata).toBeDefined();
    });

    it('should have proper metadata structure', () => {
      const metadata = DEFAULT_PROFILE.metadata;
      expect(metadata).toBeDefined();
      expect(metadata?.isDraft).toBe(true);
      expect(metadata?.version).toBe('1.0.0');
      expect(metadata?.lastModified).toBeDefined();
    });

    it('should have proper profile data structure', () => {
      const profileData = DEFAULT_PROFILE.profileData;
      expect(profileData).toBeDefined();
      expect(profileData?.profileType).toBe('student');
    });
  });

  describe('Conditional Field Configuration', () => {
    it('should have configuration for all profile types', () => {
      const profileTypes: ProfileType[] = [
        'student',
        'working_full_time',
        'working_part_time',
        'freelancer',
        'business_owner',
        'stay_at_home_parent',
        'unemployed',
        'career_shifter',
        'entrepreneur',
        'other'
      ];

      profileTypes.forEach(type => {
        const config = CONDITIONAL_FIELD_CONFIG[type];
        expect(config).toBeDefined();
        expect(Array.isArray(config.required)).toBe(true);
        expect(Array.isArray(config.optional)).toBe(true);
        expect(Array.isArray(config.nextSteps)).toBe(true);
      });
    });

    it('should have different required fields for different profile types', () => {
      const studentConfig = CONDITIONAL_FIELD_CONFIG.student;
      const entrepreneurConfig = CONDITIONAL_FIELD_CONFIG.entrepreneur;
      
      expect(studentConfig.required).toContain('educationLevel');
      expect(entrepreneurConfig.required).toContain('businessStage');
      
      // Should not have overlapping required fields inappropriately
      expect(studentConfig.required).not.toContain('businessStage');
      expect(entrepreneurConfig.required).not.toContain('educationLevel');
    });
  });

  describe('Profile Type Validation', () => {
    it('should handle all profile types without errors', () => {
      const profileTypes: ProfileType[] = [
        'student',
        'working_full_time',
        'working_part_time',
        'freelancer',
        'business_owner',
        'stay_at_home_parent',
        'unemployed',
        'career_shifter',
        'entrepreneur',
        'other'
      ];

      profileTypes.forEach(type => {
        expect(() => {
          const config = CONDITIONAL_FIELD_CONFIG[type];
          // Should not throw error when accessing config
          expect(config).toBeDefined();
        }).not.toThrow();
      });
    });
  });
});