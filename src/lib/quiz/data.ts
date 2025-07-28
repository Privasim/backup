import { QuizContextData, DropdownOption } from './types';

export const quizContextData: QuizContextData = {
  'marketer': {
    jobDescription: 'Marketer',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Banking', 'Technology', 'Healthcare', 'E-commerce', 'FMCG', 'Real Estate', 'Education'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam'],
    salaryRanges: ['₱15,000-25,000', '₱25,000-40,000', '₱40,000-60,000', '₱60,000-100,000', '₱100,000+'],
    skillSets: [
      'Digital Marketing', 'Content Marketing', 'Social Media Marketing', 'Email Marketing', 
      'SEO/SEM', 'PPC Advertising', 'Marketing Analytics', 'Brand Management',
      'Copy Writing', 'Graphic Design', 'Video Marketing', 'Influencer Marketing',
      'Marketing Automation', 'CRM Management', 'A/B Testing', 'Conversion Optimization',
      'Market Research', 'Customer Segmentation', 'Lead Generation', 'Event Marketing'
    ]
  },
  'software-developer': {
    jobDescription: 'Software Developer',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Technology', 'Fintech', 'Healthcare Tech', 'E-commerce', 'Gaming', 'Startup', 'Enterprise'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'Remote'],
    salaryRanges: ['₱25,000-40,000', '₱40,000-70,000', '₱70,000-120,000', '₱120,000-200,000', '₱200,000+'],
    skillSets: [
      'JavaScript', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
      'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Django', 'Laravel',
      'Database Management', 'SQL', 'MongoDB', 'PostgreSQL', 'Redis',
      'API Development', 'REST APIs', 'GraphQL', 'Microservices',
      'Cloud Services', 'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
      'DevOps', 'CI/CD', 'Git', 'Testing', 'Agile Development'
    ]
  },
  'data-analyst': {
    jobDescription: 'Data Analyst',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Banking', 'Technology', 'Healthcare', 'E-commerce', 'Consulting', 'Government', 'Research'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Remote'],
    salaryRanges: ['₱20,000-35,000', '₱35,000-55,000', '₱55,000-85,000', '₱85,000-150,000', '₱150,000+'],
    skillSets: [
      'SQL', 'Python', 'R', 'Excel', 'Google Sheets',
      'Tableau', 'Power BI', 'Looker', 'QlikView', 'Data Studio',
      'Statistics', 'Statistical Analysis', 'Hypothesis Testing',
      'Machine Learning', 'Predictive Analytics', 'Data Mining',
      'Data Visualization', 'Dashboard Creation', 'Reporting',
      'Data Cleaning', 'ETL Processes', 'Database Management',
      'Business Intelligence', 'KPI Development', 'A/B Testing'
    ]
  },
  'graphic-designer': {
    jobDescription: 'Graphic Designer',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Advertising', 'Technology', 'E-commerce', 'Media', 'Fashion', 'Gaming', 'Startup'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Remote'],
    salaryRanges: ['₱18,000-30,000', '₱30,000-45,000', '₱45,000-70,000', '₱70,000-120,000', '₱120,000+'],
    skillSets: [
      'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'InDesign', 'After Effects',
      'Figma', 'Sketch', 'Adobe XD', 'Canva', 'Procreate',
      'UI/UX Design', 'Web Design', 'Mobile Design', 'Responsive Design',
      'Branding', 'Logo Design', 'Brand Identity', 'Style Guides',
      'Print Design', 'Layout Design', 'Typography', 'Color Theory',
      'Illustration', 'Digital Art', 'Icon Design', 'Infographic Design',
      'Motion Graphics', 'Animation', 'Video Editing', '3D Design'
    ]
  },
  'accountant': {
    jobDescription: 'Accountant',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Banking', 'Accounting Firms', 'Manufacturing', 'Real Estate', 'Government', 'Non-profit', 'Consulting'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia'],
    salaryRanges: ['₱20,000-30,000', '₱30,000-50,000', '₱50,000-80,000', '₱80,000-150,000', '₱150,000+'],
    skillSets: [
      'Financial Reporting', 'Financial Analysis', 'Financial Planning',
      'Tax Preparation', 'Tax Planning', 'Tax Compliance',
      'Auditing', 'Internal Audit', 'External Audit', 'Risk Assessment',
      'QuickBooks', 'Xero', 'SAP', 'Oracle', 'Peachtree',
      'Excel', 'Advanced Excel', 'Pivot Tables', 'Financial Modeling',
      'Budgeting', 'Forecasting', 'Cost Accounting', 'Management Accounting',
      'Compliance', 'Regulatory Reporting', 'GAAP', 'IFRS',
      'Payroll Processing', 'Accounts Payable', 'Accounts Receivable'
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