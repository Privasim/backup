// Shared types for Job Risk visualizations (kept local to job-risk tab)
export type CutSeriesPoint = { t: string | Date; cuts: number };
export type CutSeries = CutSeriesPoint[];

export type SkillImpact = { skillGroupId: string; impact: number; volume?: number };
export type SkillImpacts = SkillImpact[];
export type RoleSkillMatrix = number[][]; // rows: role clusters, cols: skill clusters

export type ForecastPoint = { t: string | Date; expected: number; p10?: number; p90?: number };
export type ForecastSeries = ForecastPoint[];

export type GlobalKPI = {
  label: string;
  value: string;
  deltaLabel?: string;
  tone?: 'neutral' | 'positive' | 'negative';
};

export type VizInsight = {
  title: string;
  bullets: string[]; // concise lines
};

export type InsightsBundle = {
  global: GlobalKPI[];
  velocity: VizInsight;
  skills: VizInsight;
  forecast: VizInsight;
};

export type SkillClusterId =
  | 'cognitive_routine'
  | 'analytical'
  | 'creative'
  | 'social'
  | 'manual_routine';

export const SKILL_CLUSTER_LABELS: Record<SkillClusterId, string> = {
  cognitive_routine: 'Cognitive Routine',
  analytical: 'Analytical',
  creative: 'Creative',
  social: 'Social',
  manual_routine: 'Manual Routine',
};
