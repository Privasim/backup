export type ProfileType = 
  | 'student'
  | 'working_full_time'
  | 'working_part_time'
  | 'business_owner'
  | 'stay_at_home_parent'
  | 'unemployed';

export interface Profile {
  type: ProfileType;
  skills: string[];
  skillset?: Skillset;
  experience: Experience[];
}

export interface Experience {
  role: string;
  company?: string;
  duration: string;
  description: string;
}

export interface Skillset {
  technical: string[];
  soft: string[];
  languages: string[];
  certifications: string[];
}

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  student: 'Student',
  working_full_time: 'Working Full Time',
  working_part_time: 'Working Part Time',
  business_owner: 'Business Owner',
  stay_at_home_parent: 'Stay-at-Home Parent',
  unemployed: 'Unemployed'
};

export const DEFAULT_PROFILE: Profile = {
  type: 'student',
  skills: [],
  skillset: {
    technical: [],
    soft: [],
    languages: [],
    certifications: []
  },
  experience: []
};
