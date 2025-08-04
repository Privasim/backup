export type ProfileType = 
  | 'student'
  | 'working_full_time'
  | 'working_part_time'
  | 'freelancer'
  | 'business_owner'
  | 'stay_at_home_parent'
  | 'unemployed'
  | 'career_shifter'
  | 'entrepreneur'
  | 'other';

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
  
  // Student-specific fields
  educationLevel?: string;
  fieldOfStudy?: string;
  graduationYear?: number;
  interestedIndustries?: string[];
  
  // Professional fields (working_full_time, working_part_time)
  currentRole?: string;
  industry?: string;
  yearsOfExperience?: number;
  technologies?: string[];
  
  // Freelancer fields
  services?: string[];
  clientTypes?: string[];
  hourlyRate?: number;
  
  // Entrepreneur fields
  businessStage?: 'idea' | 'mvp' | 'launched' | 'profitable';
  teamSize?: number;
  noCodeFamiliarity?: boolean;
  fundingStage?: string;
  
  // Career shifter fields
  previousCareer?: string;
  yearsInPreviousCareer?: number;
  targetIndustry?: string;
  transitionReason?: string;
  
  // Unemployed fields
  lastRole?: string;
  unemployedTargetIndustry?: string;
  jobSearchDuration?: number;
  
  // Other
  customDescription?: string;
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
  organization: string;
  startDate: string;
  endDate?: string;
  current: boolean;
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
  working_full_time: 'Working Full Time',
  working_part_time: 'Working Part Time',
  freelancer: 'Freelancer',
  business_owner: 'Business Owner',
  stay_at_home_parent: 'Stay-at-Home Parent',
  unemployed: 'Unemployed (Actively Searching)',
  career_shifter: 'Career Shifter',
  entrepreneur: 'Entrepreneur',
  other: 'Other'
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
    optional: ['fieldOfStudy', 'graduationYear', 'interestedIndustries'],
    nextSteps: ['experience', 'skills']
  },
  working_full_time: {
    required: ['currentRole', 'industry'],
    optional: ['yearsOfExperience', 'technologies'],
    nextSteps: ['experience', 'skills']
  },
  working_part_time: {
    required: ['currentRole'],
    optional: ['industry', 'yearsOfExperience', 'technologies'],
    nextSteps: ['experience', 'skills']
  },
  freelancer: {
    required: ['services'],
    optional: ['clientTypes', 'yearsOfExperience', 'technologies', 'hourlyRate'],
    nextSteps: ['experience', 'skills']
  },
  business_owner: {
    required: ['businessStage'],
    optional: ['industry', 'teamSize', 'yearsOfExperience'],
    nextSteps: ['experience', 'skills']
  },
  stay_at_home_parent: {
    required: [],
    optional: ['previousRole', 'yearsOutOfWorkforce', 'interestedIndustries'],
    nextSteps: ['experience', 'skills']
  },
  unemployed: {
    required: ['unemployedTargetIndustry'],
    optional: ['lastRole', 'jobSearchDuration'],
    nextSteps: ['experience', 'skills']
  },
  career_shifter: {
    required: ['previousCareer', 'targetIndustry'],
    optional: ['yearsInPreviousCareer', 'transitionReason'],
    nextSteps: ['experience', 'skills']
  },
  entrepreneur: {
    required: ['businessStage'],
    optional: ['industry', 'teamSize', 'noCodeFamiliarity', 'fundingStage'],
    nextSteps: ['experience', 'skills']
  },
  other: {
    required: ['customDescription'],
    optional: [],
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