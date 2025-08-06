import { z } from 'zod';
import { ProfileType, CONDITIONAL_FIELD_CONFIG } from '../types/profile.types';

// Base validation schema
const baseProfileSchema = z.object({
  profileType: z.enum([
    'student',
    'professional',
    'business_owner',
    'unemployed'
  ])
});

// Field validators
const getFieldValidator = (field: string, required: boolean) => {
  const validators: Record<string, z.ZodTypeAny> = {
    // Student fields
    educationLevel: z.enum(['High School', 'College', 'Graduate School']),
    fieldOfStudy: z.string().min(1, 'Field of study is required'),
    yearLevel: z.enum(['1st', '2nd', '3rd', '4th', '5th+']),
    
    // Professional fields
    industry: z.enum([
      'Technology', 'Healthcare', 'Finance', 'Education', 
      'Manufacturing', 'Retail', 'Consulting', 'Media', 
      'Non-profit', 'Other'
    ]),
    employmentType: z.enum(['Full-time', 'Part-time', 'Freelancer', 'Contract']),
    yearsOfExperience: z.enum(['0-1', '2-4', '5-9', '10+']),
    toolsUsed: z.array(z.string()).min(1, 'Please select at least one tool'),
    topWorkActivities: z.array(z.string()).min(1, 'Please add at least one activity').max(3, 'Maximum 3 activities'),
    
    // Business Owner fields
    businessType: z.string().min(1, 'Business type is required'),
    businessStatus: z.enum(['Active', 'Paused', 'Closed']),
    teamSize: z.enum(['Solo', '2-5', '6-20', '20+']),
    salesChannels: z.array(z.string()).min(1, 'Please select at least one sales channel'),
    biggestChallenge: z.enum([
      'Getting leads', 'Managing costs', 'Staffing', 
      'Customer churn', 'Scaling operations', 'Marketing'
    ]),
    
    // Unemployed fields
    previousRole: z.string().min(1, 'Previous role is required'),
    targetIndustry: z.enum([
      'Technology', 'Healthcare', 'Finance', 'Education', 
      'Manufacturing', 'Retail', 'Consulting', 'Media', 
      'Non-profit', 'Other'
    ]),
    goal: z.enum(['Find job', 'Start business', 'Undecided']),
    toolsPreviouslyUsed: z.array(z.string()).optional(),
    enjoyedTasks: z.array(z.string()).min(1, 'Please add at least one task').max(3, 'Maximum 3 tasks')
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