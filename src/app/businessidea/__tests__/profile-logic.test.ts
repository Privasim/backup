import { describe, it, expect } from '@jest/globals';
import { 
  CONDITIONAL_FIELD_CONFIG, 
  ProfileType, 
  DEFAULT_PROFILE 
} from '../types/profile.types';
import { 
  createValidationSchema, 
  validateProfileStep 
} from '../lib/validation';
import { ProfileStorage } from '../lib/storage';

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('Profile Logic Implementation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile Types', () => {
    it('should have all required profile types', () => {
      const expectedTypes: ProfileType[] = [
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

      expectedTypes.forEach(type => {
        expect(CONDITIONAL_FIELD_CONFIG[type]).toBeDefined();
      });
    });

    it('should have proper field configuration for each profile type', () => {
      Object.entries(CONDITIONAL_FIELD_CONFIG).forEach(([type, config]) => {
        expect(config.required).toBeDefined();
        expect(config.optional).toBeDefined();
        expect(config.nextSteps).toBeDefined();
        expect(Array.isArray(config.required)).toBe(true);
        expect(Array.isArray(config.optional)).toBe(true);
        expect(Array.isArray(config.nextSteps)).toBe(true);
      });
    });
  });

  describe('Validation', () => {
    it('should create validation schema for student profile', () => {
      const schema = createValidationSchema('student');
      expect(schema).toBeDefined();
      
      // Test valid student data
      const validData = {
        profileType: 'student',
        educationLevel: 'Bachelor\'s Degree'
      };
      
      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate required fields for entrepreneur profile', () => {
      const result = validateProfileStep('entrepreneur', {
        profileType: 'entrepreneur'
        // Missing required businessStage
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.path.includes('businessStage'))).toBe(true);
      }
    });

    it('should accept valid entrepreneur data', () => {
      const result = validateProfileStep('entrepreneur', {
        profileType: 'entrepreneur',
        businessStage: 'mvp',
        industry: 'Technology'
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('Storage', () => {
    it('should save draft profile', () => {
      const profileData = {
        profile: DEFAULT_PROFILE.profileData!,
        experience: [],
        skillset: DEFAULT_PROFILE.skillset!,
        metadata: DEFAULT_PROFILE.metadata!
      };

      const result = ProfileStorage.saveDraft(profileData);
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should handle storage errors gracefully', () => {
      // Mock localStorage to throw error
      (localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const profileData = {
        profile: DEFAULT_PROFILE.profileData!,
        experience: [],
        skillset: DEFAULT_PROFILE.skillset!,
        metadata: DEFAULT_PROFILE.metadata!
      };

      const result = ProfileStorage.saveDraft(profileData);
      expect(result).toBe(false);
    });

    it('should return correct profile status', () => {
      // Mock no profile
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      expect(ProfileStorage.getProfileStatus()).toBe('none');

      // Mock draft profile
      (localStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === 'profile_draft') {
          return JSON.stringify({ metadata: { isDraft: true } });
        }
        return null;
      });
      expect(ProfileStorage.getProfileStatus()).toBe('draft');

      // Mock completed profile
      (localStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === 'profile_completed') {
          return JSON.stringify({ metadata: { isDraft: false } });
        }
        return null;
      });
      expect(ProfileStorage.getProfileStatus()).toBe('completed');
    });
  });

  describe('Conditional Field Logic', () => {
    it('should have different required fields for different profile types', () => {
      const studentFields = CONDITIONAL_FIELD_CONFIG.student.required;
      const entrepreneurFields = CONDITIONAL_FIELD_CONFIG.entrepreneur.required;
      const freelancerFields = CONDITIONAL_FIELD_CONFIG.freelancer.required;

      expect(studentFields).toContain('educationLevel');
      expect(entrepreneurFields).toContain('businessStage');
      expect(freelancerFields).toContain('services');

      // Should not overlap inappropriately
      expect(studentFields).not.toContain('businessStage');
      expect(entrepreneurFields).not.toContain('educationLevel');
    });

    it('should have appropriate next steps for all profile types', () => {
      Object.values(CONDITIONAL_FIELD_CONFIG).forEach(config => {
        expect(config.nextSteps.length).toBeGreaterThan(0);
        expect(config.nextSteps).toContain('experience');
        expect(config.nextSteps).toContain('skills');
      });
    });
  });

  describe('Default Profile', () => {
    it('should have valid default profile structure', () => {
      expect(DEFAULT_PROFILE.type).toBe('student');
      expect(DEFAULT_PROFILE.skills).toEqual([]);
      expect(DEFAULT_PROFILE.experience).toEqual([]);
      expect(DEFAULT_PROFILE.skillset).toBeDefined();
      expect(DEFAULT_PROFILE.profileData).toBeDefined();
      expect(DEFAULT_PROFILE.metadata).toBeDefined();
      expect(DEFAULT_PROFILE.metadata?.isDraft).toBe(true);
    });

    it('should have proper skillset structure', () => {
      const skillset = DEFAULT_PROFILE.skillset!;
      expect(skillset.technical).toEqual([]);
      expect(skillset.soft).toEqual([]);
      expect(skillset.languages).toEqual([]);
      expect(skillset.certifications).toEqual([]);
      expect(skillset.categories).toEqual([]);
      expect(skillset.certificationsDetailed).toEqual([]);
      expect(skillset.languageProficiency).toEqual([]);
    });
  });
});