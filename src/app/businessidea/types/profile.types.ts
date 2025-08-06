export type ProfileType = 
  | 'student'
  | 'professional'
  | 'businessOwner'
  | 'unemployed';

export interface Profile {
  type: ProfileType;
  skills: string[];
  skillset?: EnhancedSkillset;
  experience: ExperienceEntry[];
  profileData?: ProfileData;
  metadata?: ProfileMetadata;
}

export interface ProfileData {
  profileType: ProfileType;
  completedAt?: string;
  
  // Student fields
  educationLevel?: string;
  fieldOfStudy?: string;
  yearLevel?: string;
  
  // Professional fields
  industry?: string;
  employmentType?: string;
  yearsOfExperience?: string;
  toolsUsed?: string[];
  topWorkActivities?: string;
  
  // Business Owner fields
  businessType?: string;
  businessStatus?: string;
  teamSize?: string;
  salesChannels?: string[];
  biggestChallenge?: string;
  
  // Unemployed fields
  previousRole?: string;
  targetIndustry?: string;
  goal?: string;
  toolsPreviouslyUsed?: string[];
  enjoyedTasks?: string;
}

export interface ProfileMetadata {
  completedAt?: string;
  lastModified: string;
  version: string;
  isDraft: boolean;
}

export interface ExperienceEntry {
  id: string;
  type: 'work' | 'education' | 'project' | 'volunteer';
  title: string;
  organization?: string; // Optional - keeping for backward compatibility
  industry: string;
  companySize: string;
  seniority: string;
  description?: string;
  skills?: string[];
  achievements?: string[];
}

export interface Skillset {
  technical: string[];
  soft: string[];
  languages: string[];
  certifications: string[];
}

export interface EnhancedSkillset {
  technical: string[];
  soft: string[];
  languages: string[];
  certifications: string[];
  categories: SkillCategory[];
  certificationsDetailed: Certification[];
  languageProficiency: LanguageProficiency[];
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: 1 | 2 | 3 | 4 | 5;
  yearsOfExperience?: number;
  highlight: boolean;
  source: 'manual' | 'experience' | 'education';
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  dateObtained: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface LanguageProficiency {
  id: string;
  language: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  student: 'Student',
  professional: 'Professional',
  businessOwner: 'Business Owner',
  unemployed: 'Unemployed'
};

export const DEFAULT_PROFILE: Profile = {
  type: 'student',
  skills: [],
  skillset: {
    technical: [],
    soft: [],
    languages: [],
    certifications: [],
    categories: [],
    certificationsDetailed: [],
    languageProficiency: []
  },
  experience: [],
  profileData: {
    profileType: 'student'
  },
  metadata: {
    lastModified: new Date().toISOString(),
    version: '1.0.0',
    isDraft: true
  }
};
// Form step types
export type FormStep = 'profile' | 'conditional' | 'experience' | 'skills' | 'review';

// Conditional field configuration
export interface ConditionalFieldConfig {
  required: string[];
  optional: string[];
  nextSteps: FormStep[];
}

export const CONDITIONAL_FIELD_CONFIG: Record<ProfileType, ConditionalFieldConfig> = {
  student: {
    required: ['educationLevel'],
    optional: ['fieldOfStudy', 'yearLevel'],
    nextSteps: ['experience', 'skills']
  },
  professional: {
    required: ['industry', 'employmentType', 'yearsOfExperience'],
    optional: ['toolsUsed', 'topWorkActivities'],
    nextSteps: ['experience', 'skills']
  },
  businessOwner: {
    required: ['businessType', 'businessStatus', 'teamSize'],
    optional: ['salesChannels', 'biggestChallenge'],
    nextSteps: ['experience', 'skills']
  },
  unemployed: {
    required: ['previousRole', 'targetIndustry', 'goal'],
    optional: ['toolsPreviouslyUsed', 'enjoyedTasks'],
    nextSteps: ['experience', 'skills']
  }
};

// Complete profile form data interface
export interface ProfileFormData {
  profile: ProfileData;
  experience: ExperienceEntry[];
  skillset: EnhancedSkillset;
  metadata: ProfileMetadata;
}