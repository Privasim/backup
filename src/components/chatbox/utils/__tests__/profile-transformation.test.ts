import { 
  toEnhancedSkillset, 
  transformUserProfileToAnalysisData, 
  adaptFormDataToUserProfile,
  adaptUserProfileToFormData
} from '../profile-transformation';
import { Role, WorkPreference } from '@/app/businessidea/types/profile.types';

describe('Profile Transformation Functions', () => {
  describe('toEnhancedSkillset', () => {
    it('should preserve all skills including uncategorized ones', () => {
      // Arrange
      const skills = ['JavaScript', 'Leadership', 'Cooking', 'Gardening'];
      
      // Act
      const result = toEnhancedSkillset(skills);
      
      // Assert
      expect(result.technical).toContain('JavaScript');
      expect(result.soft).toContain('Leadership');
      
      // Uncategorized skills should be added to technical
      expect(result.technical).toContain('Cooking');
      expect(result.technical).toContain('Gardening');
      
      // All skills should be preserved (no data loss)
      const allSkills = [...result.technical, ...result.soft, ...result.languages, ...result.certifications];
      expect(allSkills.length).toEqual(skills.length);
    });
    
    it('should handle empty or undefined skills', () => {
      // Act & Assert
      expect(toEnhancedSkillset([])).toEqual({
        technical: [],
        soft: [],
        languages: [],
        certifications: []
      });
      
      expect(toEnhancedSkillset(undefined)).toEqual({
        technical: [],
        soft: [],
        languages: [],
        certifications: []
      });
    });
  });
  
  describe('transformUserProfileToAnalysisData', () => {
    it('should preserve all skills when transforming UserProfileData', () => {
      // Arrange
      const userProfile = {
        role: Role.SoftwareDeveloper,
        skills: ['JavaScript', 'Leadership', 'Cooking', 'Gardening'],
        experience: []
      };
      
      // Act
      const result = transformUserProfileToAnalysisData(userProfile);
      
      // Assert
      expect(result.skills.technical).toContain('JavaScript');
      expect(result.skills.soft).toContain('Leadership');
      
      // Uncategorized skills should be added to technical
      expect(result.skills.technical).toContain('Cooking');
      expect(result.skills.technical).toContain('Gardening');
      
      // All skills should be preserved (no data loss)
      const allSkills = [
        ...result.skills.technical, 
        ...result.skills.soft, 
        ...result.skills.languages, 
        ...result.skills.certifications
      ];
      expect(allSkills.length).toEqual(userProfile.skills.length);
    });
  });
  
  describe('adaptFormDataToUserProfile', () => {
    it('should not set workPreference for non-CareerShifter roles', () => {
      // Arrange
      const formData = {
        profileType: 'SoftwareDeveloper',
        profile: {
          currentRole: 'Developer',
          industry: 'Technology'
        },
        skillset: {
          technical: ['JavaScript', 'TypeScript'],
          soft: ['Communication'],
          languages: [],
          certifications: []
        },
        metadata: {
          lastModified: new Date().toISOString()
        }
      };
      
      // Act
      const result = adaptFormDataToUserProfile(formData);
      
      // Assert
      expect(result.role).toBe(Role.SoftwareDeveloper);
      expect(result.workPreference).toBeUndefined();
    });
    
    it('should set workPreference only for CareerShifter with targetIndustry', () => {
      // Arrange
      const formData = {
        profileType: 'CareerShifter',
        profile: {
          currentRole: 'Teacher',
          industry: 'Education',
          targetIndustry: 'Technology'
        },
        skillset: {
          technical: ['JavaScript'],
          soft: ['Communication'],
          languages: [],
          certifications: []
        },
        metadata: {
          lastModified: new Date().toISOString()
        }
      };
      
      // Act
      const result = adaptFormDataToUserProfile(formData);
      
      // Assert
      expect(result.role).toBe(Role.CareerShifter);
      expect(result.workPreference).toBe('Remote');
    });
    
    it('should not set workPreference for CareerShifter without targetIndustry', () => {
      // Arrange
      const formData = {
        profileType: 'CareerShifter',
        profile: {
          currentRole: 'Teacher',
          industry: 'Education'
          // No targetIndustry
        },
        skillset: {
          technical: ['JavaScript'],
          soft: ['Communication'],
          languages: [],
          certifications: []
        },
        metadata: {
          lastModified: new Date().toISOString()
        }
      };
      
      // Act
      const result = adaptFormDataToUserProfile(formData);
      
      // Assert
      expect(result.role).toBe(Role.CareerShifter);
      expect(result.workPreference).toBeUndefined();
    });
    
    it('should extract skills from all skillset categories', () => {
      // Arrange
      const formData = {
        profileType: 'SoftwareDeveloper',
        profile: {
          currentRole: 'Developer',
          industry: 'Technology'
        },
        skillset: {
          technical: ['JavaScript', 'TypeScript'],
          soft: ['Communication'],
          languages: ['English', 'Spanish'],
          certifications: ['AWS Certified']
        },
        metadata: {
          lastModified: new Date().toISOString()
        }
      };
      
      // Act
      const result = adaptFormDataToUserProfile(formData);
      
      // Assert
      expect(result.skills).toContain('JavaScript');
      expect(result.skills).toContain('TypeScript');
      expect(result.skills).toContain('Communication');
      expect(result.skills).toContain('English');
      expect(result.skills).toContain('Spanish');
      expect(result.skills).toContain('AWS Certified');
      expect(result.skills.length).toBe(6); // All skills should be included
    });
  });
  
  describe('adaptUserProfileToFormData', () => {
    it('should correctly transform UserProfileData to ProfileFormData', () => {
      // Arrange
      const userProfile = {
        role: Role.SoftwareDeveloper,
        skills: ['JavaScript', 'Leadership', 'English', 'AWS Certified'],
        experience: []
      };
      
      // Act
      const result = adaptUserProfileToFormData(userProfile);
      
      // Assert
      expect(result.profileType).toBe('SoftwareDeveloper');
      
      // Check that skills are properly categorized
      expect(result.skillset.technical).toContain('JavaScript');
      expect(result.skillset.soft).toContain('Leadership');
      
      // Check that uncategorized skills are preserved in technical
      const allSkills = [
        ...result.skillset.technical,
        ...result.skillset.soft,
        ...result.skillset.languages,
        ...result.skillset.certifications
      ];
      
      // All skills should be preserved
      expect(allSkills.length).toEqual(userProfile.skills.length);
    });
  });
});
