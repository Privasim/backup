import { SpecsSettings } from './types';

// Document profiles with their characteristics
export const DOC_PROFILES = {
  'prd': {
    name: 'Product Requirements Document',
    description: 'Concise PRD with requirements, acceptance criteria, and key constraints',
    pageTarget: 2,
    tokenBudget: 1000,
    include: {
      requirements: true,
      api: false,
      dataModel: false,
      nonFunctional: true,
      security: false,
      risks: true,
      acceptance: true,
      glossary: true
    },
    outlineStyle: 'numbered' as const,
    audienceLevel: 'engineer' as const,
    tone: 'concise' as const,
    systemTemplate: `You are a product manager creating a technical Product Requirements Document (PRD) for software engineers. 
Focus on clear requirements, acceptance criteria, and non-functional constraints. 
Be concise but precise. Avoid implementation details.`
  },
  'prd-design': {
    name: 'PRD + Technical Design',
    description: 'Complete specification with requirements and technical architecture',
    pageTarget: 3,
    tokenBudget: 1500,
    include: {
      requirements: true,
      api: true,
      dataModel: true,
      nonFunctional: true,
      security: true,
      risks: true,
      acceptance: true,
      glossary: true
    },
    outlineStyle: 'numbered' as const,
    audienceLevel: 'engineer' as const,
    tone: 'detailed' as const,
    systemTemplate: `You are a senior software architect creating a comprehensive technical specification. 
Combine product requirements with detailed technical design. 
Include API endpoints, data models, and security considerations. 
Target senior software engineers building full-stack applications.`
  },
  'full-suite': {
    name: 'Complete Specification Suite',
    description: 'Full suite including PRD, design, and implementation task breakdown',
    pageTarget: 9,
    tokenBudget: 4000,
    include: {
      requirements: true,
      api: true,
      dataModel: true,
      nonFunctional: true,
      security: true,
      risks: true,
      acceptance: true,
      glossary: true
    },
    outlineStyle: 'numbered' as const,
    audienceLevel: 'engineer' as const,
    tone: 'detailed' as const,
    systemTemplate: `You are a technical project manager creating a complete specification suite for a full-stack application. 
Cover product requirements, technical architecture, and detailed implementation tasks. 
Break down complex features into actionable engineering tasks. 
Target senior software engineers and tech leads.`
  }
} as const;

// Language options for the selector
export const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Chinese-Simplified', label: 'Chinese (Simplified)' },
  { value: 'Chinese-Traditional', label: 'Chinese (Traditional)' }
] as const;

// Helper function to get profile settings
export function getProfileSettings(profile: keyof typeof DOC_PROFILES): Omit<SpecsSettings, 'version' | 'language' | 'docProfile'> {
  const profileData = DOC_PROFILES[profile];
  return {
    include: profileData.include,
    outlineStyle: profileData.outlineStyle,
    audienceLevel: profileData.audienceLevel,
    tone: profileData.tone,
    tokenBudget: profileData.tokenBudget
  };
}

// Helper function to get system template
export function getSystemTemplate(profile: keyof typeof DOC_PROFILES): string {
  return DOC_PROFILES[profile].systemTemplate;
}
