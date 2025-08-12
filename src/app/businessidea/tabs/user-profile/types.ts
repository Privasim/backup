export enum Role {
  Student = 'Student',
  Professional = 'Professional',
  BusinessOwner = 'Business Owner',
  CareerShifter = 'Unemployed/Career Shifter',
}

export type WorkPreference = 'Remote' | 'Hybrid' | 'On-site';

export type StudentDetails = {
  educationLevel?: string;
  fieldOfStudy?: string;
  graduationYear?: string;
  status?: 'Full-time' | 'Part-time';
};

export type ProfessionalDetails = {
  yearsExperience?: string;
  jobFunction?: string;
  seniority?: string;
};

export type BusinessOwnerDetails = {
  companySize?: string;
  sector?: string;
  stage?: 'Idea' | 'MVP' | 'Growing' | 'Scaling';
  teamSize?: string;
};

export type CareerShifterDetails = {
  previousField?: string;
  desiredField?: string;
  timeline?: 'Immediate' | '3–6 months' | '6–12 months';
  workPreference?: WorkPreference;
};

export type RoleDetails =
  | { role: Role.Student; student: StudentDetails }
  | { role: Role.Professional; professional: ProfessionalDetails }
  | { role: Role.BusinessOwner; business: BusinessOwnerDetails }
  | { role: Role.CareerShifter; shifter: CareerShifterDetails };

export type UserProfileData = {
  role?: Role;
  roleDetails?: RoleDetails;
  industry?: string;
  location?: string;
  workPreference?: WorkPreference;
  skills: string[];
};

// Placeholder option lists (UI-only). Replace with backend data later.
export const EDUCATION_LEVEL_OPTIONS = [
  'High School',
  'Associate Degree',
  "Bachelor's Degree",
  "Master's Degree",
  'Doctorate',
];

export const FIELD_OF_STUDY_OPTIONS = [
  'Computer Science',
  'Business Administration',
  'Engineering',
  'Design',
  'Health Sciences',
];

export const GRAD_YEAR_OPTIONS = ['2025', '2026', '2027', '2028'];

export const YEARS_EXPERIENCE_OPTIONS = [
  '0–1',
  '2–3',
  '4–6',
  '7–10',
  '10+',
];

export const JOB_FUNCTION_OPTIONS = [
  'Software Engineering',
  'Product Management',
  'Design (UI/UX)',
  'Data/AI/ML',
  'Marketing',
];

export const SENIORITY_OPTIONS = ['Junior', 'Mid', 'Senior', 'Lead', 'Director+'];

export const COMPANY_SIZE_OPTIONS = ['Solo', '2–10', '11–50', '51–200', '200+'];

export const SECTOR_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
];

export const TEAM_SIZE_OPTIONS = ['1', '2–5', '6–10', '11–20', '21+'];

export const PREVIOUS_FIELD_OPTIONS = [
  'Hospitality',
  'Retail',
  'Education',
  'Operations',
  'Other',
];

export const DESIRED_FIELD_OPTIONS = [
  'Technology',
  'Design',
  'Marketing',
  'Operations',
  'Finance',
];

export const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
];

export const LOCATION_OPTIONS = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Singapore',
];

export const TECHNICAL_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Python',
  'SQL',
  'AWS',
];

export const TOOLING_SKILLS = [
  'Git',
  'Figma',
  'Docker',
  'Jira',
  'Notion',
];

export const SOFT_SKILLS = [
  'Communication',
  'Leadership',
  'Problem Solving',
  'Time Management',
  'Adaptability',
];
