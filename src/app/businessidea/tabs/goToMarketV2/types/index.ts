import { ImplementationPlan } from '@/features/implementation-plan/types';

export interface ImplementationContext {
  title: string;
  overview: string;
  phases: Array<{
    id: string;
    name: string;
    objectives: string[];
    duration: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  kpis?: Array<{
    id: string;
    metric: string;
    target: string;
  }>;
}

export interface StrategySection {
  title: string;
  content: string;
  level: number;
}

export interface GoToMarketStrategy {
  content: string;
  sections: StrategySection[];
  generatedAt: string;
}

export type DetailLevel = 1 | 2 | 3 | 4 | 5;
export type PricingModel = 'freemium' | 'subscription' | 'one-time';
export type SalesApproach = 'self-service' | 'assisted' | 'enterprise';

export interface DistributionChannels {
  socialMedia: boolean;
  reddit: boolean;
  email: boolean;
  partnerships: boolean;
  events: boolean;
}

export interface GoToMarketSettings {
  detailLevel: DetailLevel;
  distributionChannels: DistributionChannels;
  pricingModel: PricingModel;
  salesApproach: SalesApproach;
  includeTimeline: boolean;
}

export const DEFAULT_SETTINGS: GoToMarketSettings = {
  detailLevel: 3,
  distributionChannels: {
    socialMedia: true,
    reddit: true,
    email: true,
    partnerships: true,
    events: true
  },
  pricingModel: 'subscription',
  salesApproach: 'self-service',
  includeTimeline: true
};
