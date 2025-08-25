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

// Enhanced skill categories with role-specific skills
export const TECHNICAL_SKILLS = {
  FOUNDATIONAL: ['HTML/CSS', 'JavaScript', 'Python', 'Basic SQL', 'Git Basics'],
  INTERMEDIATE: ['TypeScript', 'React', 'Node.js', 'SQL', 'Git'],
  ADVANCED: ['AWS', 'Docker', 'Kubernetes', 'System Design', 'Architecture'],
  DATA: ['Python', 'R', 'SQL', 'Excel', 'Tableau', 'Power BI'],
  DESIGN: ['Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping', 'Design Systems'],
  MOBILE: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile Design'],
  DEVOPS: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Infrastructure as Code']
};

export const BUSINESS_SKILLS = {
  STRATEGY: ['Strategic Planning', 'Business Development', 'Market Analysis', 'Competitive Analysis'],
  FINANCE: ['Financial Planning', 'Budgeting', 'Investment Analysis', 'Risk Management'],
  MARKETING: ['Digital Marketing', 'Content Marketing', 'SEO/SEM', 'Social Media', 'Brand Management'],
  SALES: ['Sales Strategy', 'Customer Acquisition', 'Negotiation', 'CRM', 'Lead Generation'],
  OPERATIONS: ['Process Optimization', 'Supply Chain', 'Quality Management', 'Project Management']
};

export const LEADERSHIP_SKILLS = [
  'Team Leadership', 'Vision Setting', 'Decision Making', 'Delegation', 'Mentoring',
  'Change Management', 'Conflict Resolution', 'Performance Management', 'Strategic Thinking'
];

export const TOOLING_SKILLS = {
  PRODUCTIVITY: ['Google Workspace', 'Microsoft Office', 'Notion', 'Slack', 'Zoom'],
  DEVELOPMENT: ['Git', 'VS Code', 'Jira', 'GitHub', 'Postman'],
  DESIGN: ['Figma', 'Sketch', 'Adobe Creative Suite', 'InVision', 'Miro'],
  BUSINESS: ['Salesforce', 'HubSpot', 'Tableau', 'Power BI', 'QuickBooks'],
  PROJECT_MANAGEMENT: ['Jira', 'Asana', 'Trello', 'Monday.com', 'Microsoft Project']
};

export const SOFT_SKILLS = {
  COMMUNICATION: ['Written Communication', 'Verbal Communication', 'Presentation', 'Active Listening'],
  LEADERSHIP: ['Team Leadership', 'Mentoring', 'Influence', 'Emotional Intelligence'],
  PROBLEM_SOLVING: ['Critical Thinking', 'Analytical Thinking', 'Creative Problem Solving', 'Decision Making'],
  PERSONAL: ['Time Management', 'Adaptability', 'Learning Agility', 'Self-Motivation', 'Resilience'],
  COLLABORATION: ['Teamwork', 'Cross-functional Collaboration', 'Conflict Resolution', 'Networking']
};

export const ACADEMIC_SKILLS = [
  'Research', 'Academic Writing', 'Data Analysis', 'Critical Thinking', 'Project Management',
  'Presentation', 'Literature Review', 'Statistical Analysis', 'Laboratory Skills'
];

export const TRANSFERABLE_SKILLS = [
  'Communication', 'Problem Solving', 'Teamwork', 'Customer Service', 'Time Management',
  'Adaptability', 'Learning Ability', 'Attention to Detail', 'Organization', 'Leadership'
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

// Role-based skill mappings for conditional logic
export const ROLE_SKILL_MAPPING = {
  [Role.Student]: {
    technical: TECHNICAL_SKILLS.FOUNDATIONAL,
    tooling: TOOLING_SKILLS.PRODUCTIVITY.concat(TOOLING_SKILLS.DEVELOPMENT.slice(0, 3)),
    soft: [...SOFT_SKILLS.COMMUNICATION, ...SOFT_SKILLS.PERSONAL],
    academic: ACADEMIC_SKILLS
  },
  [Role.Professional]: {
    technical: TECHNICAL_SKILLS.INTERMEDIATE,
    tooling: [...TOOLING_SKILLS.DEVELOPMENT, ...TOOLING_SKILLS.PRODUCTIVITY],
    soft: [...SOFT_SKILLS.COMMUNICATION, ...SOFT_SKILLS.COLLABORATION, ...SOFT_SKILLS.LEADERSHIP],
    business: [] as string[] // Will be populated based on job function
  },
  [Role.BusinessOwner]: {
    business: [...BUSINESS_SKILLS.STRATEGY, ...BUSINESS_SKILLS.FINANCE, ...BUSINESS_SKILLS.MARKETING],
    leadership: LEADERSHIP_SKILLS,
    technical: [...BUSINESS_SKILLS.MARKETING, 'Business Analytics', 'CRM Systems'],
    soft: [...SOFT_SKILLS.LEADERSHIP, ...SOFT_SKILLS.PROBLEM_SOLVING]
  },
  [Role.CareerShifter]: {
    transferable: TRANSFERABLE_SKILLS,
    emerging: ['Digital Literacy', 'Remote Work', 'Online Collaboration', 'Basic Programming'],
    soft: [...SOFT_SKILLS.PERSONAL, 'Growth Mindset', 'Networking', 'Career Transition']
  }
};

// Industry-specific job function skills
export const INDUSTRY_FUNCTION_SKILLS: Record<string, Record<string, string[]>> = {
  "Technology": {
    "Software Engineering": [...TECHNICAL_SKILLS.INTERMEDIATE, ...TECHNICAL_SKILLS.ADVANCED.slice(0, 3)],
    "Product Management": ['Product Strategy', 'User Research', 'Analytics', 'A/B Testing', 'Roadmapping'],
    "Design (UI/UX)": [...TECHNICAL_SKILLS.DESIGN, 'User Research', 'Usability Testing'],
    "Data/AI/ML": [...TECHNICAL_SKILLS.DATA, 'Machine Learning', 'Deep Learning', 'Statistics'],
    "Marketing": [...BUSINESS_SKILLS.MARKETING, 'Growth Hacking', 'Content Strategy']
  },
  "Healthcare": {
    "Clinical Care": ['Patient Care', 'Medical Knowledge', 'Healthcare Software', 'Communication'],
    "Healthcare Administration": ['Healthcare Management', 'Compliance', 'Medical Billing', 'Operations'],
    "Health Technology": ['Healthcare IT', 'Telemedicine', 'Medical Devices', 'Data Privacy']
  },
  "Finance": {
    "Investment Banking": ['Financial Modeling', 'Valuation', 'Risk Analysis', 'Client Relations'],
    "Financial Planning": ['Financial Analysis', 'Portfolio Management', 'Client Advisory', 'Compliance'],
    "Fintech": ['Financial Technology', 'Blockchain', 'Payment Systems', 'Regulatory Knowledge']
  },
  "Education": {
    "Teaching": ['Curriculum Development', 'Classroom Management', 'Assessment', 'Educational Technology'],
    "Administration": ['Educational Leadership', 'Policy Development', 'Budget Management', 'Staff Management'],
    "EdTech": ['Educational Technology', 'Learning Management Systems', 'Content Development']
  },
  "Retail": {
    "Sales": ['Customer Service', 'Sales Techniques', 'Product Knowledge', 'CRM'],
    "Marketing": [...BUSINESS_SKILLS.MARKETING, 'Retail Analytics', 'Customer Experience'],
    "Operations": ['Inventory Management', 'Supply Chain', 'Store Operations', 'Team Management'],
    "E-commerce": ['Online Retail', 'Digital Marketing', 'Customer Experience', 'Analytics']
  }
};

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

// Field of study options by education level
export const FIELD_OF_STUDY_BY_EDUCATION_LEVEL: Record<string, string[]> = {
  "High School": ["General Studies", "STEM Focus", "Liberal Arts", "Vocational Training", "Arts & Humanities"],
  "Associate Degree": ["Business", "Technology", "Healthcare", "Liberal Arts", "Skilled Trades", "Criminal Justice"],
  "Bachelor's Degree": [
    "Computer Science", "Business Administration", "Engineering", "Design", "Psychology", 
    "Marketing", "Finance", "Liberal Arts", "Sciences", "Healthcare", "Education", "Communications"
  ],
  "Master's Degree": [
    "MBA", "Computer Science", "Engineering", "Design", "Data Science", "Psychology", 
    "Education", "Healthcare Administration", "Public Policy", "Marketing", "Finance"
  ],
  "Doctorate": ["PhD", "MD", "JD", "Ed.D", "Professional Doctorate", "Research Doctorate"]
};

// Job functions by industry
export const JOB_FUNCTION_BY_INDUSTRY: Record<string, string[]> = {
  "Technology": ["Software Engineering", "Product Management", "Design (UI/UX)", "Data/AI/ML", "DevOps", "Marketing", "Sales"],
  "Healthcare": ["Clinical Care", "Healthcare Administration", "Health Technology", "Research", "Medical Sales"],
  "Finance": ["Investment Banking", "Financial Planning", "Risk Management", "Fintech", "Insurance", "Accounting"],
  "Education": ["Teaching", "Administration", "Curriculum Development", "EdTech", "Student Services"],
  "Retail": ["Sales", "Marketing", "Operations", "E-commerce", "Customer Experience", "Merchandising"]
};
