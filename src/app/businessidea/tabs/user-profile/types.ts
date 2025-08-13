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
  hobbies?: string[];
  interests?: string[];
  values?: string[];
  studentGoals?: string[];
};

export type ProfessionalDetails = {
  yearsExperience?: string;
  jobFunction?: string;
  seniority?: string;
  professionalGoals?: string[];
  hobbies?: string[];
  interests?: string[];
  values?: string[];
};

export type BusinessOwnerDetails = {
  companySize?: string;
  sector?: string;
  stage?: 'Idea' | 'MVP' | 'Growing' | 'Scaling';
  teamSize?: string;
  businessGoals?: string[];
  hobbies?: string[];
  interests?: string[];
  values?: string[];
};

export type CareerShifterDetails = {
  previousField?: string;
  desiredField?: string;
  timeline?: 'Immediate' | '3–6 months' | '6–12 months';
  workPreference?: WorkPreference;
  transitionGoals?: string[];
  hobbies?: string[];
  interests?: string[];
  values?: string[];
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
  hobbies?: string[];
  interests?: string[];
  values?: string[];
  goals?: string[];
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

// Curated option lists for new fields
export const HOBBY_OPTIONS = [
  "Reading", "Gaming", "Cooking", "Traveling", "Photography", "Fitness", "Music", "Art", "Sports", "Gardening", "Crafting", "Volunteering", "Investing", "Coding", "Writing", "Dancing", "Hiking", "Yoga", "Meditation", "Learning"
];

export const INTEREST_OPTIONS = [
  "Technology", "Business", "Finance", "Marketing", "Design", "Healthcare", "Education", "Sustainability", "AI/ML", "Data Science", "Product Management", "Entrepreneurship", "Leadership", "Innovation", "Social Impact", "Remote Work", "Startups", "Consulting", "E-commerce", "Cybersecurity"
];

export const VALUE_OPTIONS = [
  "Work-life balance", "Financial security", "Career growth", "Impact", "Autonomy", "Creativity", "Recognition", "Flexibility", "Learning", "Stability", "Collaboration", "Innovation", "Diversity", "Sustainability", "Purpose", "Challenge", "Ownership", "Community", "Transparency", "Excellence"
];

export const GOAL_OPTIONS_STUDENT = [
  "Graduate with honors", "Gain industry experience", "Build portfolio", "Secure internship", "Develop technical skills", "Network professionally", "Explore career paths", "Start freelancing", "Prepare for job search", "Learn new technologies"
];

export const GOAL_OPTIONS_PROFESSIONAL = [
  "Get promoted", "Switch companies", "Learn new skills", "Lead a team", "Increase salary", "Improve work-life balance", "Start side business", "Get certification", "Build personal brand", "Mentor others"
];

export const GOAL_OPTIONS_BUSINESS = [
  "Scale business", "Increase revenue", "Expand market reach", "Launch new product", "Improve operations", "Build team", "Secure funding", "Enhance brand", "Optimize processes", "Enter new markets"
];

export const GOAL_OPTIONS_SHIFTER = [
  "Learn new industry", "Build transferable skills", "Network in new field", "Update resume", "Prepare for interviews", "Gain relevant experience", "Take courses", "Find mentors", "Build portfolio", "Transition smoothly"
];

export const INTEREST_OPTIONS_BY_INDUSTRY: Record<string, string[]> = {
  "Technology": ["AI/ML", "Data Science", "Cybersecurity", "Cloud Computing", "Software Development", "DevOps", "Blockchain", "IoT"],
  "Healthcare": ["Telemedicine", "Health Tech", "Medical Devices", "Pharmaceuticals", "Biotech", "Mental Health", "Elder Care"],
  "Finance": ["Fintech", "Investment", "Banking", "Insurance", "Cryptocurrency", "Wealth Management", "Financial Planning"],
  "Education": ["EdTech", "Online Learning", "Curriculum Development", "Educational Content", "Teaching", "Training"],
  "Marketing": ["Digital Marketing", "Content Marketing", "SEO", "Social Media", "Brand Management", "Market Research"],
  "Consulting": ["Strategy", "Management", "Operations", "HR", "IT", "Finance", "Marketing"],
  "E-commerce": ["Online Retail", "Marketplaces", "Dropshipping", "Logistics", "Customer Experience", "Digital Payments"],
  "Sustainability": ["Green Tech", "Renewable Energy", "Environmental Consulting", "Circular Economy", "Carbon Footprint"],
  "Startups": ["Innovation", "Product Development", "Growth Hacking", "Fundraising", "Team Building", "Market Fit"],
  "Remote Work": ["Digital Nomadism", "Remote Team Management", "Virtual Collaboration", "Work-life Balance", "Productivity"]
};
