import { z } from 'zod';
import { ProfileType, CONDITIONAL_FIELD_CONFIG } from '../types/profile.types';

// Base validation schema
const baseProfileSchema = z.object({
  profileType: z.enum([
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
  ])
});

// Field validators
const getFieldValidator = (field: string, required: boolean) => {
  const validators: Record<string, z.ZodTypeAny> = {
    // Student fields
    educationLevel: z.string().min(1, 'Education level is required'),
    fieldOfStudy: z.string().optional(),
    graduationYear: z.number().min(2020).max(2030).optional(),
    interestedIndustries: z.array(z.string()).optional(),
    
    // Professional fields
    currentRole: z.string().min(1, 'Current role is required'),
    industry: z.string().min(1, 'Industry is required'),
    yearsOfExperience: z.number().min(0).max(50).optional(),
    technologies: z.array(z.string()).optional(),
    
    // Freelancer fields
    services: z.array(z.string()).min(1, 'At least one service is required'),
    clientTypes: z.array(z.string()).optional(),
    hourlyRate: z.number().min(0).optional(),
    
    // Entrepreneur fields
    businessStage: z.enum(['idea', 'mvp', 'launched', 'profitable']),
    teamSize: z.number().min(0).optional(),
    noCodeFamiliarity: z.boolean().optional(),
    fundingStage: z.string().optional(),
    
    // Career shifter fields
    previousCareer: z.string().min(1, 'Previous career is required'),
    yearsInPreviousCareer: z.number().min(0).max(50).optional(),
    targetIndustry: z.string().min(1, 'Target industry is required'),
    transitionReason: z.string().optional(),
    
    // Unemployed fields
    lastRole: z.string().optional(),
    unemployedTargetIndustry: z.string().min(1, 'Target industry is required'),
    jobSearchDuration: z.number().min(0).optional(),
    
    // Other fields
    customDescription: z.string().min(10, 'Please provide a detailed description (minimum 10 characters)')
  };

  const validator = validators[field];
  if (!validator) {
    return z.string().optional();
  }

  return required ? validator : validator.optional();
};

// Dynamic validation schema creator
export const createValidationSchema = (profileType: ProfileType) => {
  const config = CONDITIONAL_FIELD_CONFIG[profileType];
  
  // Safety check: ensure config exists
  if (!config) {
    console.warn(`No configuration found for profile type: ${profileType}`);
    return baseProfileSchema;
  }
  
  const schemaFields: Record<string, z.ZodTypeAny> = {};
  
  // Add required fields
  if (config.required) {
    config.required.forEach(field => {
      schemaFields[field] = getFieldValidator(field, true);
    });
  }
  
  // Add optional fields
  if (config.optional) {
    config.optional.forEach(field => {
      schemaFields[field] = getFieldValidator(field, false);
    });
  }
  
  return baseProfileSchema.extend(schemaFields);
};

// Experience validation schema
export const experienceSchema = z.object({
  id: z.string(),
  type: z.enum(['work', 'education', 'project', 'volunteer']),
  title: z.string().min(1, 'Title is required'),
  organization: z.string().min(1, 'Organization is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().optional(),
  skills: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional()
});

// Skill validation schema
export const skillSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Skill name is required'),
  category: z.string().min(1, 'Category is required'),
  proficiency: z.number().min(1).max(5),
  yearsOfExperience: z.number().min(0).optional(),
  highlight: z.boolean(),
  source: z.enum(['manual', 'experience', 'education'])
});

// Certification validation schema
export const certificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  dateObtained: z.string().min(1, 'Date obtained is required'),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional()
});

// Language proficiency validation schema
export const languageProficiencySchema = z.object({
  id: z.string(),
  language: z.string().min(1, 'Language is required'),
  proficiency: z.enum(['basic', 'conversational', 'fluent', 'native'])
});

// Complete form validation schema
export const profileFormSchema = z.object({
  profile: z.object({
    profileType: baseProfileSchema.shape.profileType,
    completedAt: z.string().optional()
  }).passthrough(), // Allow additional fields based on profile type
  experience: z.array(experienceSchema),
  skillset: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
    languages: z.array(z.string()),
    certifications: z.array(z.string()),
    categories: z.array(z.object({
      id: z.string(),
      name: z.string(),
      skills: z.array(skillSchema)
    })),
    certificationsDetailed: z.array(certificationSchema),
    languageProficiency: z.array(languageProficiencySchema)
  }),
  metadata: z.object({
    completedAt: z.string().optional(),
    lastModified: z.string(),
    version: z.string(),
    isDraft: z.boolean()
  })
});

// Validation helper functions
export const validateProfileStep = (profileType: ProfileType, data: any) => {
  try {
    // Safety check: ensure data exists
    if (!data || !profileType) {
      return { success: false, error: { issues: [{ path: ['general'], message: 'Invalid data or profile type' }] } };
    }
    
    const schema = createValidationSchema(profileType);
    return schema.safeParse(data);
  } catch (error) {
    console.error('Validation error:', error);
    return { success: false, error: { issues: [{ path: ['general'], message: 'Validation failed' }] } };
  }
};

export const validateExperience = (data: any) => {
  return experienceSchema.safeParse(data);
};

export const validateSkill = (data: any) => {
  return skillSchema.safeParse(data);
};

export const validateCompleteProfile = (data: any) => {
  return profileFormSchema.safeParse(data);
};