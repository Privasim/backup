// Future service interfaces for LLM integration (no implementation)
import { ProfileFormData } from '../types/profile.types';

// Result types for future LLM responses
export interface BackupPlanResult {
  plans: Array<{
    id: string;
    title: string;
    description: string;
    steps: string[];
    timeframe: string;
    difficulty: 'low' | 'medium' | 'high';
    requiredSkills: string[];
    marketDemand: 'low' | 'medium' | 'high';
  }>;
  reasoning: string;
  confidence: number;
}

export interface BusinessIdeaResult {
  ideas: Array<{
    id: string;
    title: string;
    description: string;
    targetMarket: string;
    revenueModel: string;
    startupCosts: string;
    timeToMarket: string;
    difficulty: 'low' | 'medium' | 'high';
    marketSize: string;
  }>;
  reasoning: string;
  confidence: number;
}

export interface IndustryFitResult {
  industries: Array<{
    name: string;
    fitScore: number;
    strengths: string[];
    gaps: string[];
    recommendations: string[];
    averageSalary: string;
    jobGrowth: string;
  }>;
  topRecommendation: string;
  reasoning: string;
}

export interface LearningPathResult {
  path: {
    title: string;
    description: string;
    estimatedDuration: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    skills: string[];
    resources: Array<{
      type: 'course' | 'book' | 'project' | 'certification';
      title: string;
      provider: string;
      url?: string;
      cost: string;
    }>;
    estimatedTime: string;
  }>;
  reasoning: string;
}

// Data transformation interfaces for future API integration
export interface AnalysisProfileData {
  profileType: string;
  skillSummary: {
    technical: string[];
    soft: string[];
    certifications: string[];
    totalYearsExperience: number;
  };
  experienceSummary: {
    totalYears: number;
    industries: string[];
    roles: string[];
    achievements: string[];
  };
  goals: {
    shortTerm: string[];
    longTerm: string[];
    targetIndustries: string[];
  };
  preferences: {
    workStyle: string[];
    interests: string[];
    values: string[];
  };
}

export interface ApiProfileData {
  id?: string;
  userId?: string;
  profileData: ProfileFormData;
  analysisData: AnalysisProfileData;
  createdAt: string;
  updatedAt: string;
}

// Service interfaces (no implementation)
export interface ProfileAnalysisService {
  generateBackupPlan(profile: ProfileFormData): Promise<BackupPlanResult>;
  suggestBusinessIdea(profile: ProfileFormData): Promise<BusinessIdeaResult>;
  analyzeIndustryFit(profile: ProfileFormData): Promise<IndustryFitResult>;
  createLearningPath(profile: ProfileFormData): Promise<LearningPathResult>;
}

export interface ProfileDataTransformer {
  toApiFormat(profile: ProfileFormData): ApiProfileData;
  fromApiFormat(apiData: ApiProfileData): ProfileFormData;
  sanitizeForAnalysis(profile: ProfileFormData): AnalysisProfileData;
  extractSkillsFromExperience(profile: ProfileFormData): string[];
  calculateExperienceMetrics(profile: ProfileFormData): {
    totalYears: number;
    industries: string[];
    roles: string[];
  };
}

export interface ProfileApiClient {
  saveProfile(profile: ApiProfileData): Promise<SaveProfileResponse>;
  getProfile(id: string): Promise<ApiProfileData>;
  updateProfile(id: string, profile: Partial<ApiProfileData>): Promise<ApiProfileData>;
  deleteProfile(id: string): Promise<void>;
  listProfiles(userId: string): Promise<ApiProfileData[]>;
}

// Response types for future API integration
export interface SaveProfileResponse {
  id: string;
  success: boolean;
  message: string;
  profile?: ApiProfileData;
}

export interface AnalysisRequest {
  profileId: string;
  analysisType: 'backup-plan' | 'business-idea' | 'industry-fit' | 'learning-path';
  options?: {
    includeMarketData?: boolean;
    focusAreas?: string[];
    timeframe?: string;
  };
}

export interface AnalysisResponse<T> {
  id: string;
  profileId: string;
  analysisType: string;
  result: T;
  confidence: number;
  createdAt: string;
  metadata: {
    processingTime: number;
    modelUsed: string;
    version: string;
  };
}

// Event types for future analytics integration
export interface ProfileEvent {
  type: 'profile_created' | 'profile_updated' | 'profile_completed' | 'analysis_requested';
  profileId?: string;
  userId?: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface AnalyticsService {
  trackEvent(event: ProfileEvent): Promise<void>;
  getProfileMetrics(profileId: string): Promise<ProfileMetrics>;
  getUserMetrics(userId: string): Promise<UserMetrics>;
}

export interface ProfileMetrics {
  completionRate: number;
  timeToComplete: number;
  mostCommonProfileType: string;
  averageSkillCount: number;
  popularIndustries: string[];
}

export interface UserMetrics {
  profilesCreated: number;
  analysesRequested: number;
  lastActivity: string;
  engagementScore: number;
}

// Configuration interfaces for extensibility
export interface FieldConfiguration {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'textarea' | 'date';
  options?: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  conditional?: {
    dependsOn: string;
    values: any[];
  };
}

export interface ProfileTypeConfiguration {
  id: string;
  label: string;
  description: string;
  fields: FieldConfiguration[];
  nextSteps: string[];
  analysisPrompts?: {
    backupPlan?: string;
    businessIdea?: string;
    industryFit?: string;
    learningPath?: string;
  };
}

// Placeholder implementations (stubs)
export class ProfileAnalysisServiceStub implements ProfileAnalysisService {
  async generateBackupPlan(profile: ProfileFormData): Promise<BackupPlanResult> {
    // Placeholder implementation
    return {
      plans: [
        {
          id: '1',
          title: 'Placeholder Backup Plan',
          description: 'This is a placeholder for future LLM integration',
          steps: ['Step 1', 'Step 2', 'Step 3'],
          timeframe: '6-12 months',
          difficulty: 'medium',
          requiredSkills: ['Skill 1', 'Skill 2'],
          marketDemand: 'high'
        }
      ],
      reasoning: 'Placeholder reasoning',
      confidence: 0.8
    };
  }

  async suggestBusinessIdea(profile: ProfileFormData): Promise<BusinessIdeaResult> {
    // Placeholder implementation
    return {
      ideas: [
        {
          id: '1',
          title: 'Placeholder Business Idea',
          description: 'This is a placeholder for future LLM integration',
          targetMarket: 'Placeholder market',
          revenueModel: 'Subscription',
          startupCosts: '$10,000 - $50,000',
          timeToMarket: '3-6 months',
          difficulty: 'medium',
          marketSize: '$1B+'
        }
      ],
      reasoning: 'Placeholder reasoning',
      confidence: 0.75
    };
  }

  async analyzeIndustryFit(profile: ProfileFormData): Promise<IndustryFitResult> {
    // Placeholder implementation
    return {
      industries: [
        {
          name: 'Technology',
          fitScore: 85,
          strengths: ['Technical skills', 'Problem solving'],
          gaps: ['Leadership experience'],
          recommendations: ['Consider leadership training'],
          averageSalary: '$80,000 - $120,000',
          jobGrowth: '15% (Much faster than average)'
        }
      ],
      topRecommendation: 'Technology',
      reasoning: 'Placeholder reasoning'
    };
  }

  async createLearningPath(profile: ProfileFormData): Promise<LearningPathResult> {
    // Placeholder implementation
    return {
      path: {
        title: 'Placeholder Learning Path',
        description: 'This is a placeholder for future LLM integration',
        estimatedDuration: '6 months',
        difficulty: 'intermediate'
      },
      milestones: [
        {
          id: '1',
          title: 'Milestone 1',
          description: 'Placeholder milestone',
          skills: ['Skill 1', 'Skill 2'],
          resources: [
            {
              type: 'course',
              title: 'Placeholder Course',
              provider: 'Placeholder Provider',
              cost: 'Free'
            }
          ],
          estimatedTime: '2 weeks'
        }
      ],
      reasoning: 'Placeholder reasoning'
    };
  }
}