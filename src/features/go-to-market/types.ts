import { BusinessSuggestion } from '@/components/chatbox/types';
import { ImplementationPlan } from '@/features/implementation-plan/types';

export type GoToMarketStatus = 'idle' | 'loading' | 'success' | 'error';

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
  type: 'digital' | 'content' | 'partnership' | 'traditional';
  title: string;
  description: string;
  tactics: MarketingTactic[];
  estimatedCost: string;
  timeframe: string;
  expectedROI: string;
  difficulty: 'low' | 'medium' | 'high';
  priority: number;
  completed?: boolean;
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
  implementation: ImplementationStep[];
  costStructure: CostStructure;
  expectedReach: string;
  timeToImplement: string;
  suitabilityScore: number;
  pros: string[];
  cons: string[];
}

export interface PricePoint {
  tier: string;
  price: string;
  features: string[];
  targetSegment: string;
}

export interface PricingStrategy {
  id: string;
  model: 'freemium' | 'subscription' | 'one-time' | 'tiered' | 'usage-based';
  title: string;
  description: string;
  pricePoints: PricePoint[];
  pros: string[];
  cons: string[];
  marketFit: number;
  competitivePosition: string;
  recommendedFor: string[];
}

export interface ImplementationAlignment {
  alignedPhases: {
    phaseId: string;
    phaseName: string;
    marketingActivities: string[];
    milestones: string[];
  }[];
  timeline: {
    phase: string;
    marketingStart: string;
    marketingEnd: string;
    dependencies: string[];
  }[];
}

export interface ToolRecommendation {
  toolId: string;
  name: string;
  category: string;
  relevanceScore: number;
  implementationPriority: 'high' | 'medium' | 'low';
  costEstimate: string;
  integrationComplexity: 'simple' | 'moderate' | 'complex';
  recommendedFor: string[];
}

export interface GoToMarketProgress {
  completedStrategies: string[];
  completedChannels: string[];
  completedPricingTasks: string[];
  overallProgress: number;
  lastUpdated: string;
}

export interface GoToMarketData {
  selectedSuggestion?: BusinessSuggestion;
  marketingStrategies: MarketingStrategy[];
  salesChannels: SalesChannel[];
  pricingStrategies: PricingStrategy[];
  implementationAlignment?: ImplementationAlignment;
  recommendedTools: ToolRecommendation[];
  progress: GoToMarketProgress;
  status: GoToMarketStatus;
  error?: string;
}

export interface GoToMarketSettings {
  aiModel: string;
  customPrompts: {
    marketing: string;
    sales: string;
    pricing: string;
  };
  preferences: {
    focusAreas: ('digital' | 'traditional' | 'partnerships' | 'content')[];
    budgetRange: 'low' | 'medium' | 'high';
    timeframe: 'immediate' | 'short-term' | 'long-term';
  };
}

// API Response types for AI-generated content
export interface MarketingAnalysisResponse {
  strategies: Omit<MarketingStrategy, 'id' | 'completed'>[];
  channels: Omit<SalesChannel, 'id'>[];
  pricing: Omit<PricingStrategy, 'id'>[];
  tools: Omit<ToolRecommendation, 'toolId'>[];
}

// Validation schemas
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}