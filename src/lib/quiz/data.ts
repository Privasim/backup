import { QuizContextData, DropdownOption } from './types';

export const quizContextData: QuizContextData = {
  // --- Modern/Emerging Roles ---
  'ai-prompt-engineer': {
    jobDescription: 'AI Prompt Engineer',
    experiences: [
      'Intern', 'Entry Level (0-1 years)', '1-3 years', 'Associate', '3-5 years', 'Mid-Level', '5-10 years', 'Senior', 'Lead', 'Director', 'VP', 'C-Level', 'Freelancer/Consultant', 'Career Changer'
    ],
    industries: [
      'AI & Machine Learning', 'Technology', 'Research', 'Education', 'Consulting', 'Green Energy', 'LegalTech', 'FinTech', 'Healthcare Tech', 'Remote Services', 'EdTech', 'Blockchain', 'Cybersecurity', 'Other'
    ],
    locations: [
      'Remote (Global)', 'Hybrid (Onsite & Remote)', 'Philippines', 'Singapore', 'Bangalore', 'Berlin', 'Nairobi', 'Toronto', 'San Francisco', 'New York', 'London', 'Sydney', 'Prefer not to say'
    ],
    salaryRanges: [
      'Below $20k', '$20k–$40k', '$40k–$60k', '$60k–$80k', '$80k–$100k', '$100k–$150k', '$150k–$200k', '$200k+', 'Equity Only', 'Hourly/Contract', 'Prefer not to say', 'Unpaid/Volunteer'
    ],
    skillSets: [
      'Prompt Engineering', 'AI Ethics', 'Large Language Models', 'NLP', 'Deep Learning', 'Python', 'TensorFlow', 'PyTorch', 'Cloud ML', 'No-Code Tools', 'Remote Collaboration', 'Custom Skill...'
    ]
  },
  'remote-customer-support': {
    jobDescription: 'Remote Customer Support',
    experiences: [
      'Intern', 'Entry Level (0-1 years)', '1-3 years', 'Associate', '3-5 years', 'Mid-Level', '5-10 years', 'Senior', 'Lead', 'Freelancer/Consultant', 'Career Changer'
    ],
    industries: [
      'Remote Services', 'Technology', 'E-commerce', 'Travel', 'Healthcare', 'Education', 'Government', 'Other'
    ],
    locations: [
      'Remote (Global)', 'Hybrid (Onsite & Remote)', 'Philippines', 'Singapore', 'India', 'USA', 'UK', 'Australia', 'Prefer not to say'
    ],
    salaryRanges: [
      'Below $10k', '$10k–$20k', '$20k–$30k', '$30k–$40k', '$40k+', 'Hourly/Contract', 'Prefer not to say', 'Unpaid/Volunteer'
    ],
    skillSets: [
      'Customer Service', 'Live Chat', 'CRM Tools', 'Remote Collaboration', 'Problem Solving', 'Empathy', 'Custom Skill...'
    ]
  },
  'cloud-devops-specialist': {
    jobDescription: 'Cloud DevOps Specialist',
    experiences: [
      'Intern', 'Entry Level (0-1 years)', '1-3 years', 'Associate', '3-5 years', 'Mid-Level', '5-10 years', 'Senior', 'Lead', 'Director', 'Freelancer/Consultant', 'Career Changer'
    ],
    industries: [
      'Cloud Computing', 'Technology', 'FinTech', 'AI & Machine Learning', 'E-commerce', 'Gaming', 'Healthcare Tech', 'Green Energy', 'Other'
    ],
    locations: [
      'Remote (Global)', 'Hybrid (Onsite & Remote)', 'Singapore', 'Bangalore', 'San Francisco', 'London', 'Sydney', 'Prefer not to say'
    ],
    salaryRanges: [
      '$20k–$40k', '$40k–$60k', '$60k–$80k', '$80k–$100k', '$100k–$150k', '$150k–$200k', '$200k+', 'Hourly/Contract', 'Prefer not to say'
    ],
    skillSets: [
      'Cloud Security', 'AWS', 'Azure', 'Google Cloud', 'Kubernetes', 'Terraform', 'DevOps', 'CI/CD', 'No-Code Tools', 'Remote Collaboration', 'Custom Skill...'
    ]
  },
  // --- Existing roles below (truncated for brevity, but all existing roles remain and are enriched further down) ---
  'software-developer': {
    jobDescription: 'Software Developer',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Technology', 'Fintech', 'Healthcare Tech', 'E-commerce', 'Gaming', 'Startup', 'Enterprise', 'SaaS', 'Mobile Apps'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'India', 'Remote', 'Hong Kong', 'Taiwan', 'South Korea', 'Japan'],
    salaryRanges: ['₱25,000-40,000', '₱40,000-70,000', '₱70,000-120,000', '₱120,000-200,000', '₱200,000+'],
    skillSets: [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
      'React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Laravel', 'Spring Boot',
      'Database Management', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
      'API Development', 'REST APIs', 'GraphQL', 'Microservices', 'WebSockets',
      'Cloud Services', 'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform',
      'DevOps', 'CI/CD', 'Git', 'Testing', 'Jest', 'Cypress', 'Agile Development', 'Scrum'
    ]
  },
  'data-scientist': {
    jobDescription: 'Data Scientist',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Technology', 'Banking', 'Healthcare', 'E-commerce', 'Consulting', 'Government', 'Research', 'Insurance', 'Retail'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'India', 'Remote', 'Hong Kong', 'Australia'],
    salaryRanges: ['₱30,000-50,000', '₱50,000-80,000', '₱80,000-130,000', '₱130,000-220,000', '₱220,000+'],
    skillSets: [
      'Python', 'R', 'SQL', 'Scala', 'Julia', 'MATLAB',
      'Machine Learning', 'Deep Learning', 'Neural Networks', 'NLP', 'Computer Vision',
      'TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras', 'Pandas', 'NumPy',
      'Statistics', 'Statistical Modeling', 'Hypothesis Testing', 'A/B Testing',
      'Data Visualization', 'Tableau', 'Power BI', 'Matplotlib', 'Seaborn', 'Plotly',
      'Big Data', 'Spark', 'Hadoop', 'Kafka', 'Airflow',
      'Cloud Platforms', 'AWS', 'Azure', 'Google Cloud', 'Databricks'
    ]
  },
  'marketer': {
    jobDescription: 'Digital Marketer',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Technology', 'E-commerce', 'FMCG', 'Healthcare', 'Education', 'Real Estate', 'Fashion', 'Food & Beverage', 'Travel'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'India', 'Remote', 'Hong Kong', 'Australia'],
    salaryRanges: ['₱20,000-35,000', '₱35,000-55,000', '₱55,000-85,000', '₱85,000-150,000', '₱150,000+'],
    skillSets: [
      'Digital Marketing', 'Content Marketing', 'Social Media Marketing', 'Email Marketing', 'Influencer Marketing',
      'SEO/SEM', 'Google Ads', 'Facebook Ads', 'LinkedIn Ads', 'TikTok Ads', 'PPC Advertising',
      'Marketing Analytics', 'Google Analytics', 'Brand Management', 'Growth Hacking',
      'Copy Writing', 'Content Creation', 'Video Marketing', 'Podcast Marketing',
      'Marketing Automation', 'HubSpot', 'Mailchimp', 'CRM Management', 'Salesforce',
      'Conversion Optimization', 'Landing Page Design', 'A/B Testing', 'User Experience',
      'Market Research', 'Customer Segmentation', 'Lead Generation', 'Event Marketing'
    ]
  },
  'ui-ux-designer': {
    jobDescription: 'UI/UX Designer',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Technology', 'Fintech', 'E-commerce', 'Gaming', 'Healthcare Tech', 'Education Tech', 'Startup', 'Agency'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'Remote', 'Hong Kong', 'Australia'],
    salaryRanges: ['₱25,000-40,000', '₱40,000-65,000', '₱65,000-100,000', '₱100,000-180,000', '₱180,000+'],
    skillSets: [
      'UI Design', 'UX Design', 'User Research', 'Wireframing', 'Prototyping', 'Usability Testing',
      'Figma', 'Sketch', 'Adobe XD', 'InVision', 'Principle', 'Framer',
      'Design Systems', 'Component Libraries', 'Style Guides', 'Brand Guidelines',
      'Mobile Design', 'Web Design', 'Responsive Design', 'Accessibility Design',
      'User Journey Mapping', 'Information Architecture', 'Interaction Design',
      'Visual Design', 'Typography', 'Color Theory', 'Layout Design',
      'HTML/CSS', 'JavaScript Basics', 'React Basics', 'Design Tokens'
    ]
  },
  'product-manager': {
    jobDescription: 'Product Manager',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Technology', 'Fintech', 'E-commerce', 'SaaS', 'Healthcare Tech', 'Education Tech', 'Startup', 'Enterprise'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'Remote', 'Hong Kong', 'Australia'],
    salaryRanges: ['₱40,000-60,000', '₱60,000-90,000', '₱90,000-140,000', '₱140,000-250,000', '₱250,000+'],
    skillSets: [
      'Product Strategy', 'Product Roadmapping', 'Feature Prioritization', 'User Story Writing',
      'Market Research', 'Competitive Analysis', 'User Research', 'Customer Interviews',
      'Data Analysis', 'SQL', 'Analytics Tools', 'A/B Testing', 'KPI Tracking',
      'Agile/Scrum', 'Jira', 'Confluence', 'Trello', 'Asana', 'Notion',
      'Wireframing', 'Prototyping', 'Figma', 'User Experience', 'Design Thinking',
      'Stakeholder Management', 'Cross-functional Leadership', 'Communication',
      'Go-to-Market Strategy', 'Product Launch', 'Growth Metrics'
    ]
  },
  'accountant': {
    jobDescription: 'Accountant',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Banking', 'Accounting Firms', 'Manufacturing', 'Real Estate', 'Government', 'Non-profit', 'Consulting', 'Insurance', 'Retail'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'Hong Kong'],
    salaryRanges: ['₱20,000-30,000', '₱30,000-50,000', '₱50,000-80,000', '₱80,000-150,000', '₱150,000+'],
    skillSets: [
      'Financial Reporting', 'Financial Analysis', 'Financial Planning', 'Budgeting', 'Forecasting',
      'Tax Preparation', 'Tax Planning', 'Tax Compliance', 'VAT', 'Income Tax',
      'Auditing', 'Internal Audit', 'External Audit', 'Risk Assessment', 'Compliance',
      'QuickBooks', 'Xero', 'SAP', 'Oracle', 'Peachtree', 'Sage',
      'Excel', 'Advanced Excel', 'Pivot Tables', 'Financial Modeling', 'VBA',
      'Cost Accounting', 'Management Accounting', 'GAAP', 'IFRS', 'PAS',
      'Payroll Processing', 'Accounts Payable', 'Accounts Receivable', 'Cash Flow Management'
    ]
  },
  'sales-representative': {
    jobDescription: 'Sales Representative',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Technology', 'Real Estate', 'Insurance', 'Automotive', 'Pharmaceutical', 'FMCG', 'B2B Services', 'Retail'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'Remote'],
    salaryRanges: ['₱18,000-30,000', '₱30,000-50,000', '₱50,000-80,000', '₱80,000-150,000', '₱150,000+'],
    skillSets: [
      'Sales Prospecting', 'Lead Generation', 'Cold Calling', 'Email Outreach',
      'CRM Management', 'Salesforce', 'HubSpot', 'Pipedrive', 'Zoho CRM',
      'Negotiation', 'Closing Techniques', 'Objection Handling', 'Relationship Building',
      'Product Knowledge', 'Solution Selling', 'Consultative Selling', 'B2B Sales', 'B2C Sales',
      'Sales Presentations', 'Demo Skills', 'Proposal Writing', 'Contract Management',
      'Social Selling', 'LinkedIn Sales', 'Networking', 'Referral Generation',
      'Sales Analytics', 'Pipeline Management', 'Forecasting', 'Territory Management'
    ]
  },
  'hr-specialist': {
    jobDescription: 'HR Specialist',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Technology', 'Banking', 'Manufacturing', 'Healthcare', 'Education', 'Government', 'Consulting', 'BPO'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam'],
    salaryRanges: ['₱20,000-35,000', '₱35,000-55,000', '₱55,000-85,000', '₱85,000-140,000', '₱140,000+'],
    skillSets: [
      'Recruitment', 'Talent Acquisition', 'Interviewing', 'Candidate Screening',
      'Employee Relations', 'Performance Management', 'Disciplinary Actions',
      'HR Policies', 'Employee Handbook', 'Compliance', 'Labor Law',
      'Payroll Management', 'Benefits Administration', 'Compensation Planning',
      'Training & Development', 'Onboarding', 'Learning Management Systems',
      'HRIS', 'Workday', 'BambooHR', 'ADP', 'Excel', 'Data Analysis',
      'Organizational Development', 'Change Management', 'Employee Engagement'
    ]
  }
};

export const getJobDescriptions = (): DropdownOption[] => {
  return Object.keys(quizContextData).map(key => ({
    value: key,
    label: formatJobTitle(key),
    description: `Assess AI impact on ${formatJobTitle(key)} roles`
  }));
};

export const getContextForJob = (jobKey: string) => {
  return quizContextData[jobKey] || null;
};

export const formatJobTitle = (jobKey: string): string => {
  return jobKey
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getExperienceOptions = (experiences: string[]): DropdownOption[] => {
  return experiences.map(exp => ({
    value: exp,
    label: exp,
    group: exp.includes('Entry') ? 'Junior' : exp.includes('10+') ? 'Senior' : 'Mid-Level'
  }));
};

export const getIndustryOptions = (industries: string[]): DropdownOption[] => {
  return industries.map(industry => ({
    value: industry,
    label: industry,
    group: getIndustryGroup(industry)
  }));
};

export const getLocationOptions = (locations: string[]): DropdownOption[] => {
  return locations.map(location => ({
    value: location,
    label: location,
    group: location === 'Remote' ? 'Remote Work' : 'On-site'
  }));
};

export const getSalaryOptions = (salaryRanges: string[]): DropdownOption[] => {
  return salaryRanges.map(range => ({
    value: range,
    label: range,
    group: getSalaryGroup(range)
  }));
};

const getIndustryGroup = (industry: string): string => {
  const techIndustries = ['Technology', 'Fintech', 'Healthcare Tech', 'Gaming', 'Startup'];
  const traditionalIndustries = ['Banking', 'Healthcare', 'Manufacturing', 'Real Estate', 'Government'];
  const creativeIndustries = ['Advertising', 'Media', 'Fashion', 'Education'];
  
  if (techIndustries.includes(industry)) return 'Technology';
  if (traditionalIndustries.includes(industry)) return 'Traditional';
  if (creativeIndustries.includes(industry)) return 'Creative';
  return 'Other';
};

const getSalaryGroup = (range: string): string => {
  const amount = parseInt(range.replace(/[₱,]/g, '').split('-')[0]);
  if (amount < 30000) return 'Entry Level';
  if (amount < 60000) return 'Mid Level';
  if (amount < 120000) return 'Senior Level';
  return 'Executive Level';
};

// Enhanced error handling and data validation
export const validateJobKey = (jobKey: string): boolean => {
  return Object.keys(quizContextData).includes(jobKey);
};

export const getAvailableJobKeys = (): string[] => {
  return Object.keys(quizContextData);
};