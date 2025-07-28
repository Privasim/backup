import { QuizContextData } from './types';

export const quizContextData: QuizContextData = {
  'marketer': {
    jobDescription: 'Marketer',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Banking', 'Technology', 'Healthcare', 'E-commerce', 'FMCG', 'Real Estate', 'Education'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam'],
    salaryRanges: ['₱15,000-25,000', '₱25,000-40,000', '₱40,000-60,000', '₱60,000-100,000', '₱100,000+'],
    skillSets: ['Digital Marketing', 'Copy Writing', 'SEO/SEM', 'Social Media Marketing', 'Content Marketing', 'Email Marketing', 'Analytics', 'Brand Management']
  },
  'software-developer': {
    jobDescription: 'Software Developer',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Technology', 'Fintech', 'Healthcare Tech', 'E-commerce', 'Gaming', 'Startup', 'Enterprise'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'Remote'],
    salaryRanges: ['₱25,000-40,000', '₱40,000-70,000', '₱70,000-120,000', '₱120,000-200,000', '₱200,000+'],
    skillSets: ['JavaScript', 'Python', 'React', 'Node.js', 'Database Management', 'API Development', 'Cloud Services', 'DevOps']
  },
  'data-analyst': {
    jobDescription: 'Data Analyst',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Banking', 'Technology', 'Healthcare', 'E-commerce', 'Consulting', 'Government', 'Research'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Remote'],
    salaryRanges: ['₱20,000-35,000', '₱35,000-55,000', '₱55,000-85,000', '₱85,000-150,000', '₱150,000+'],
    skillSets: ['SQL', 'Python', 'Excel', 'Tableau', 'Power BI', 'Statistics', 'Machine Learning', 'Data Visualization']
  },
  'graphic-designer': {
    jobDescription: 'Graphic Designer',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Advertising', 'Technology', 'E-commerce', 'Media', 'Fashion', 'Gaming', 'Startup'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Remote'],
    salaryRanges: ['₱18,000-30,000', '₱30,000-45,000', '₱45,000-70,000', '₱70,000-120,000', '₱120,000+'],
    skillSets: ['Adobe Creative Suite', 'UI/UX Design', 'Branding', 'Web Design', 'Print Design', 'Typography', 'Illustration', 'Motion Graphics']
  },
  'accountant': {
    jobDescription: 'Accountant',
    experiences: ['Entry Level (0-1 years)', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    industries: ['Banking', 'Accounting Firms', 'Manufacturing', 'Real Estate', 'Government', 'Non-profit', 'Consulting'],
    locations: ['Philippines', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia'],
    salaryRanges: ['₱20,000-30,000', '₱30,000-50,000', '₱50,000-80,000', '₱80,000-150,000', '₱150,000+'],
    skillSets: ['Financial Reporting', 'Tax Preparation', 'Auditing', 'QuickBooks', 'Excel', 'SAP', 'Budgeting', 'Compliance']
  }
};

export const getJobDescriptions = (): string[] => {
  return Object.keys(quizContextData);
};

export const getContextForJob = (jobKey: string) => {
  return quizContextData[jobKey] || null;
};