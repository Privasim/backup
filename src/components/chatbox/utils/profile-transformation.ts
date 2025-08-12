/**
 * Utility functions for transforming UserProfileData to ProfileAnalysisData
 */

import { UserProfileData, Role } from '@/app/businessidea/tabs/user-profile/types';
import { ProfileAnalysisData } from '../services/ProfileIntegrationService';

/**
 * Transform UserProfileData to ProfileAnalysisData format
 */
export const transformUserProfileToAnalysisData = (userProfile: UserProfileData): ProfileAnalysisData => {
  if (!userProfile) {
    throw new Error('No user profile data provided');
  }

  // Debug logging for transformation
  if (process.env.NODE_ENV === 'development') {
    console.debug('Profile transformation started:', {
      role: userProfile.role,
      hasRoleDetails: !!userProfile.roleDetails,
      skillsCount: userProfile.skills?.length || 0,
      hasIndustry: !!userProfile.industry,
      hasLocation: !!userProfile.location
    });
  }

  // Extract role-specific information
  const roleInfo = extractRoleSpecificInfo(userProfile);
  
  // Transform skills data
  const transformedSkills = {
    technical: userProfile.skills?.filter(skill => 
      ['JavaScript', 'TypeScript', 'React', 'Python', 'SQL', 'AWS', 'Git', 'Docker'].includes(skill)
    ) || [],
    soft: userProfile.skills?.filter(skill => 
      ['Communication', 'Leadership', 'Problem Solving', 'Time Management', 'Adaptability'].includes(skill)
    ) || [],
    languages: [], // UserProfileData doesn't have language info, so empty for now
    certifications: [] // UserProfileData doesn't have certification info, so empty for now
  };

  // Create experience entries from role details
  const experience = roleInfo.experience;

  // Calculate completion level
  const completionLevel = calculateCompletionLevel(userProfile);

  const result = {
    profileType: userProfile.role || 'unknown',
    experience,
    skills: transformedSkills,
    metadata: {
      completionLevel,
      lastModified: new Date().toISOString()
    }
  };

  // Debug logging for transformation result
  if (process.env.NODE_ENV === 'development') {
    console.debug('Profile transformation completed:', {
      profileType: result.profileType,
      experienceCount: result.experience.length,
      technicalSkillsCount: result.skills.technical.length,
      completionLevel: result.metadata.completionLevel
    });
  }

  return result;
};

/**
 * Extract role-specific information and convert to experience format
 */
const extractRoleSpecificInfo = (userProfile: UserProfileData) => {
  const roleDetails = userProfile.roleDetails;
  const experience: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }> = [];

  if (!roleDetails) {
    return { experience };
  }

  switch (roleDetails.role) {
    case Role.Student:
      if (roleDetails.student) {
        experience.push({
          title: `${roleDetails.student.educationLevel || 'Student'} in ${roleDetails.student.fieldOfStudy || 'Unknown Field'}`,
          company: 'Educational Institution',
          duration: `Expected graduation: ${roleDetails.student.graduationYear || 'Unknown'}`,
          description: `${roleDetails.student.status || 'Full-time'} student`
        });
      }
      break;

    case Role.Professional:
      if (roleDetails.professional) {
        experience.push({
          title: roleDetails.professional.jobFunction || 'Professional',
          company: 'Current Organization',
          duration: `${roleDetails.professional.yearsExperience || 'Unknown'} years of experience`,
          description: `${roleDetails.professional.seniority || 'Unknown'} level professional`
        });
      }
      break;

    case Role.BusinessOwner:
      if (roleDetails.business) {
        experience.push({
          title: 'Business Owner',
          company: `${roleDetails.business.sector || 'Unknown'} Company`,
          duration: `Company size: ${roleDetails.business.companySize || 'Unknown'}`,
          description: `${roleDetails.business.stage || 'Unknown'} stage business with ${roleDetails.business.teamSize || 'unknown'} team members`
        });
      }
      break;

    case Role.CareerShifter:
      if (roleDetails.shifter) {
        if (roleDetails.shifter.previousField) {
          experience.push({
            title: 'Previous Role',
            company: 'Previous Organization',
            duration: 'Past experience',
            description: `Previous field: ${roleDetails.shifter.previousField}`
          });
        }
        if (roleDetails.shifter.desiredField) {
          experience.push({
            title: 'Target Role',
            company: 'Future Organization',
            duration: `Timeline: ${roleDetails.shifter.timeline || 'Unknown'}`,
            description: `Desired field: ${roleDetails.shifter.desiredField}`
          });
        }
      }
      break;
  }

  return { experience };
};

/**
 * Calculate profile completion level
 */
const calculateCompletionLevel = (userProfile: UserProfileData): number => {
  const fields = [
    userProfile.role,
    userProfile.roleDetails,
    userProfile.industry,
    userProfile.location,
    userProfile.workPreference,
    userProfile.skills?.length > 0 ? userProfile.skills : null
  ];

  const completedFields = fields.filter(field => field !== undefined && field !== null).length;
  return Math.round((completedFields / fields.length) * 100);
};

/**
 * Validate if UserProfileData is ready for analysis
 */
export const validateProfileReadiness = (userProfile: UserProfileData): {
  ready: boolean;
  completionLevel: number;
  missing: string[];
} => {
  const missing: string[] = [];
  
  if (!userProfile.role) missing.push('role');
  if (!userProfile.roleDetails) missing.push('role details');
  if (!userProfile.industry) missing.push('industry');
  if (!userProfile.location) missing.push('location');
  if (!userProfile.workPreference) missing.push('work preference');
  if (!userProfile.skills || userProfile.skills.length === 0) missing.push('skills');

  const completionLevel = calculateCompletionLevel(userProfile);
  const ready = missing.length === 0 && completionLevel >= 80;

  return {
    ready,
    completionLevel,
    missing
  };
};

/**
 * Get analysis status for UserProfileData
 */
export const getAnalysisStatus = (userProfile: UserProfileData) => {
  const validation = validateProfileReadiness(userProfile);
  
  return {
    ready: validation.ready,
    completionLevel: validation.completionLevel,
    missing: validation.missing,
    requirements: {
      minCompletion: 80,
      autoTrigger: true
    }
  };
};