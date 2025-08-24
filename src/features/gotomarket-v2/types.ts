import { ImplementationPlan } from '@/features/implementation-plan/types';

export type GoToMarketStatus = 'idle' | 'generating' | 'streaming' | 'success' | 'error';

export type ContentLength = 'brief' | 'standard' | 'detailed';

export interface ContentLengthConfig {
  brief: {
    sentenceRange: [number, number];
    maxSections: number;
    focusOnEssentials: boolean;
  };
  standard: {
    sentenceRange: [number, number];
    maxSections: number;
    includeDetails: boolean;
  };
  detailed: {
    sentenceRange: [number, number];
    maxSections: number;
    comprehensiveAnalysis: boolean;
  };
}

export const CONTENT_LENGTH_CONFIG: ContentLengthConfig = {
  brief: {
    sentenceRange: [3, 5],
    maxSections: 3,
    focusOnEssentials: true,
  },
  standard: {
    sentenceRange: [6, 9],
    maxSections: 5,
    includeDetails: true,
  },
  detailed: {
    sentenceRange: [10, 12],
    maxSections: 8,
    comprehensiveAnalysis: true,
  },
};

export interface BusinessContext {
  businessIdea: string;
  targetMarket: string;
  valueProposition: string;
  implementationPhases: ImplementationPhase[];
  goals: string[];
  constraints: string[];
}

export interface ImplementationPhase {
  id: string;
  name: string;
  objectives: string[];
  duration?: string;
}

export interface BudgetEstimate {
  min: string;
  max: string;
  currency: string;
}

export interface MarketingTactic {
  id: string;
  name: string;
  description: string;
  estimatedCost: string;
  timeframe: string;
  difficulty: 'low' | 'medium' | 'high';
}

export interface MarketingStrategy {
  id: string;
  type: 'digital' | 'content' | 'social' | 'traditional';
  title: string;
  description: string;
  tactics: MarketingTactic[];
  budget: BudgetEstimate;
  timeline: string;
  expectedROI: string;
  difficulty: 'low' | 'medium' | 'high';
  completed: boolean;
}

export interface ImplementationStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  dependencies?: string[];
}

export interface CostStructure {
  setup: string;
  monthly: string;
  commission?: string;
  notes?: string;
}

export interface SalesChannel {
  id: string;
  name: string;
  type: 'direct' | 'retail' | 'online' | 'partner';
  description: string;
  implementationSteps: ImplementationStep[];
  costStructure: CostStructure;
  expectedReach: string;
  suitabilityScore: number;
  completed: boolean;
}

export interface PricePoint {
  tier: string;
  price: string;
  features: string[];
  targetSegment: string;
}

export interface PricingStrategy {
  id: string;
  model: 'freemium' | 'subscription' | 'one-time' | 'tiered';
  title: string;
  description: string;
  pricePoints: PricePoint[];
  marketFit: number;
  competitiveAnalysis: string;
  completed: boolean;
}

export interface DistributionPlan {
  id: string;
  channel: string;
  strategy: string;
  timeline: string;
  resources: string[];
  expectedOutcome: string;
}

export interface TimelinePhase {
  phase: string;
  startDate: string;
  endDate: string;
  activities: string[];
  milestones: string[];
}

export interface ToolRecommendation {
  id: string;
  name: string;
  category: string;
  relevanceScore: number;
  implementationPriority: 'high' | 'medium' | 'low';
  costEstimate: string;
  integrationComplexity: 'simple' | 'moderate' | 'complex';
  recommendedFor: string[];
}

export interface GoToMarketStrategies {
  id: string;
  businessContext: BusinessContext;
  marketingStrategies: MarketingStrategy[];
  salesChannels: SalesChannel[];
  pricingStrategies: PricingStrategy[];
  distributionPlans: DistributionPlan[];
  implementationTimeline: TimelinePhase[];
  toolRecommendations: ToolRecommendation[];
  generatedAt: string;
  version: string;
}

export interface GenerationOptions {
  focusAreas?: ('marketing' | 'sales' | 'pricing' | 'distribution')[];
  budgetRange?: 'low' | 'medium' | 'high';
  timeframe?: 'immediate' | 'short-term' | 'long-term';
  customPrompt?: string;
  contentLength?: ContentLength;
}

export interface GoToMarketV2State {
  strategies: GoToMarketStrategies | null;
  status: GoToMarketStatus;
  progress: number;
  error: string | null;
  implementationContext: ImplementationPlan | null;
  hasValidContext: boolean;
}

export interface StreamingState {
  rawContent: string;
  currentSection: string;
  progress: number;
  isProcessing: boolean;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Markdown-specific types
export interface MarkdownSection {
  id: string;
  type: 'marketing' | 'sales' | 'pricing' | 'distribution' | 'timeline' | 'tools';
  title: string;
  content: string;
  subsections: MarkdownSubsection[];
  completed: boolean;
  editable: boolean;
}

export interface MarkdownSubsection {
  id: string;
  heading: string;
  content: string;
  actionItems: string[];
  keyMetrics: string[];
}

export interface MarkdownGoToMarketStrategies {
  id: string;
  businessContext: BusinessContext;
  rawMarkdown: string;
  sections: MarkdownSection[];
  metadata: {
    contentLength: ContentLength;
    generatedAt: string;
    wordCount: number;
    estimatedReadTime: number;
  };
}