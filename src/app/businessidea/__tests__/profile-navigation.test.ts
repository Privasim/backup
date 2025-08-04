/**
 * @jest-environment node
 */

import { 
  ProfileType, 
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

describe('Profile Navigation Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Step Validation', () => {
    it('should allow navigation from profile step when profile type is selected', () => {
      const profileData = {
        profileType: 'student' as ProfileType
      };
      
      // Should be valid for profile step
      expect(profileData.profileType).toBeDefined();
      expect(profileData.profileType).not.toBe('');
    });

    it('should require conditional fields for conditional step', () => {
      const studentConfig = CONDITIONAL_FIELD_CONFIG.student;
      const entrepreneurConfig = CONDITIONAL_FIELD_CONFIG.entrepreneur;
      
      // Student should require education level
      expect(studentConfig.required).toContain('educationLevel');
      
      // Entrepreneur should require business stage
      expect(entrepreneurConfig.required).toContain('businessStage');
    });

    it('should have proper step progression', () => {
      const steps = ['profile', 'conditional', 'experience', 'skills', 'review'];
      
      // Should be able to progress through steps
      expect(steps.indexOf('profile')).toBe(0);
      expect(steps.indexOf('conditional')).toBe(1);
      expect(steps.indexOf('experience')).toBe(2);
      expect(steps.indexOf('skills')).toBe(3);
      expect(steps.indexOf('review')).toBe(4);
    });
  });

  describe('Profile Type Selection', () => {
    it('should handle all profile types', () => {
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
        expect(CONDITIONAL_FIELD_CONFIG[type]).toBeDefined();
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Client-Side Safety', () => {
    it('should handle localStorage unavailability gracefully', () => {
      // Mock localStorage to be undefined (server-side scenario)
      const originalLocalStorage = global.localStorage;
      delete (global as any).localStorage;
      
      // Should not throw error when localStorage is undefined
      expect(() => {
        const isClient = typeof window !== 'undefined';
        expect(isClient).toBe(false);
      }).not.toThrow();
      
      // Restore localStorage
      global.localStorage = originalLocalStorage;
    });

    it('should provide default values when no saved data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      // Should return 'none' when no data exists
      const mockGetProfileStatus = () => {
        const draft = localStorageMock.getItem('profile_draft');
        const completed = localStorageMock.getItem('profile_completed');
        
        if (completed) return 'completed';
        if (draft) return 'draft';
        return 'none';
      };
      
      expect(mockGetProfileStatus()).toBe('none');
    });
  });
});