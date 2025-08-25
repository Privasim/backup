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
