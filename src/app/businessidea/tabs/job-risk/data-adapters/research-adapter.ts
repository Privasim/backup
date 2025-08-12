// Adapters to map ResearchDataService outputs to local chart props.
// Not wired yet; placeholders are used via `utils/placeholder`.

import type { CutSeries, SkillImpacts, RoleSkillMatrix, ForecastSeries } from '../types';

export type IndustryData = unknown; // replace with concrete type once mapped
export type TaskAutomationData = unknown; // replace with concrete type once mapped
export type RiskMatrixData = unknown; // replace with concrete type once mapped
export type VisualizationConfig = unknown; // replace with concrete type once mapped

export function toCutSeries(_industry: IndustryData): CutSeries {
  // TODO: implement when ResearchDataService is wired
  return [];
}

export function toSkillImpacts(_taskData: TaskAutomationData): SkillImpacts {
  // TODO: implement when ResearchDataService is wired
  return [];
}

export function toRoleSkillMatrix(_risk: RiskMatrixData): RoleSkillMatrix {
  // TODO: implement when ResearchDataService is wired
  return [];
}

export function toForecastSeries(_config: VisualizationConfig): ForecastSeries {
  // TODO: implement when ResearchDataService provides forecast
  return [];
}
