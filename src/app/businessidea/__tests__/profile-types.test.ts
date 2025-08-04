/**
 * @jest-environment node
 */

// Setup for this test file
import './jest.setup.js';

import { 
  CONDITIONAL_FIELD_CONFIG, 
  ProfileType, 
  DEFAULT_PROFILE,
  PROFILE_TYPE_LABELS
} from '../types/profile.types';

describe('Profile Types and Configuration', () => {
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
        expect(PROFILE_TYPE_LABELS[type]).toBeDefined();
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

  describe('Profile Type Labels', () => {
    it('should have human-readable labels for all profile types', () => {
      Object.keys(CONDITIONAL_FIELD_CONFIG).forEach(type => {
        const label = PROFILE_TYPE_LABELS[type as ProfileType];
        expect(label).toBeDefined();
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      });
    });

    it('should have descriptive labels', () => {
      expect(PROFILE_TYPE_LABELS.student).toBe('Student');
      expect(PROFILE_TYPE_LABELS.working_full_time).toBe('Working Full Time');
      expect(PROFILE_TYPE_LABELS.career_shifter).toBe('Career Shifter');
      expect(PROFILE_TYPE_LABELS.entrepreneur).toBe('Entrepreneur');
      expect(PROFILE_TYPE_LABELS.unemployed).toBe('Unemployed (Actively Searching)');
    });
  });
});