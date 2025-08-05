import { ProfileFormData } from '@/app/businessidea/types/profile.types';
import { AnalysisConfig } from '@/components/chatbox/types';

/**
 * Create mock profile data for testing
 */
export const createMockProfileData = (): ProfileFormData => {
  return {
    profile: {
      profileType: 'working_full_time',
      currentRole: 'Software Engineer',
      industry: 'Technology',
      yearsOfExperience: 5
    },
    experience: [
      {
        id: '1',
        type: 'work',
        title: 'Senior Software Engineer',
        organization: 'Tech Corp',
        startDate: '2022-01-01',
        current: true,
        description: 'Full-stack development with React and Node.js',
        skills: ['React', 'Node.js', 'TypeScript'],
        achievements: ['Led team of 4 developers', 'Improved performance by 40%']
      },
      {
        id: '2',
        type: 'work',
        title: 'Software Engineer',
        organization: 'StartupCo',
        startDate: '2020-01-01',
        endDate: '2021-12-31',
        current: false,
        description: 'Frontend development with React',
        skills: ['React', 'JavaScript', 'CSS'],
        achievements: ['Built user dashboard', 'Reduced load time by 30%']
      }
    ],
    skillset: {
      technical: ['React', 'Node.js', 'TypeScript', 'Python'],
      soft: ['Leadership', 'Communication', 'Problem Solving'],
      languages: ['English', 'Spanish'],
      certifications: ['AWS Certified Developer'],
      categories: [
        {
          id: '1',
          name: 'frontend',
          skills: [
            {
              id: '1',
              name: 'React',
              category: 'frontend',
              proficiency: 5,
              yearsOfExperience: 4,
              highlight: true,
              source: 'experience'
            },
            {
              id: '2',
              name: 'TypeScript',
              category: 'frontend',
              proficiency: 4,
              yearsOfExperience: 3,
              highlight: true,
              source: 'experience'
            }
          ]
        },
        {
          id: '2',
          name: 'backend',
          skills: [
            {
              id: '3',
              name: 'Node.js',
              category: 'backend',
              proficiency: 4,
              yearsOfExperience: 3,
              highlight: true,
              source: 'experience'
            }
          ]
        }
      ],
      certificationsDetailed: [
        {
          id: '1',
          name: 'AWS Certified Developer',
          issuer: 'Amazon Web Services',
          dateObtained: '2023-06-01',
          expiryDate: '2026-06-01'
        }
      ],
      languageProficiency: [
        {
          id: '1',
          language: 'English',
          proficiency: 'native'
        },
        {
          id: '2',
          language: 'Spanish',
          proficiency: 'conversational'
        }
      ]
    },
    metadata: {
      lastModified: new Date().toISOString(),
      version: '1.0.0',
      isDraft: false
    }
  };
};

/**
 * Create mock analysis config for testing
 */
export const createMockAnalysisConfig = (overrides: Partial<AnalysisConfig> = {}): AnalysisConfig => {
  return {
    type: 'profile',
    model: 'qwen/qwen3-coder:free',
    apiKey: 'sk-or-v1-test-key-for-testing-purposes-only',
    temperature: 0.7,
    maxTokens: 800,
    ...overrides
  };
};

/**
 * Test the profile data transformation
 */
export const testProfileTransformation = () => {
  const mockData = createMockProfileData();
  const { transformProfileData } = require('./ProfileAnalysisProvider');
  
  const transformed = transformProfileData(mockData);
  
  console.log('Profile Transformation Test:', {
    profileType: transformed.profileType,
    statistics: transformed.statistics,
    keySkillsCount: transformed.keySkills.length,
    experienceCount: transformed.recentExperience.length,
    certificationsCount: transformed.certifications.length,
    languagesCount: transformed.languages.length
  });
  
  return transformed;
};

/**
 * Test prompt generation
 */
export const testPromptGeneration = () => {
  const mockData = createMockProfileData();
  const { transformProfileData, generateProfilePrompt } = require('./ProfileAnalysisProvider');
  
  const transformed = transformProfileData(mockData);
  const prompts = generateProfilePrompt(transformed);
  
  console.log('Prompt Generation Test:', {
    systemPromptLength: prompts.systemPrompt.length,
    userPromptLength: prompts.userPrompt.length,
    systemPrompt: prompts.systemPrompt.substring(0, 100) + '...',
    userPrompt: prompts.userPrompt.substring(0, 200) + '...'
  });
  
  return prompts;
};

/**
 * Test analysis service initialization
 */
export const testServiceInitialization = async () => {
  const { initializeChatboxServices, getChatboxServiceStatus } = await import('./initialization');
  
  initializeChatboxServices();
  const status = getChatboxServiceStatus();
  
  console.log('Service Initialization Test:', status);
  
  return status;
};