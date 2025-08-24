export type PlanStatus = 'idle' | 'generating' | 'streaming' | 'success' | 'error';

export interface ImplementationPlanMeta {
  ideaId: string;
  title: string;
  category?: string;
  version: string; // e.g. v1
  createdAt: string; // ISO
}

export interface Milestone { id: string; title: string; due?: string; successCriteria?: string[] }
export interface Phase { id: string; name: string; objectives: string[]; duration?: string; milestones: Milestone[] }
export interface Task { id: string; phaseId?: string; title: string; description?: string; owner?: string; effort?: string; dependencies?: string[] }
export interface Resource { role: string; count?: number; skills?: string[]; tools?: string[] }
export interface Risk { item: string; likelihood: 'Low' | 'Med' | 'High'; impact: 'Low' | 'Med' | 'High'; mitigation?: string }
export interface KPI { id?: string; metric: string; target: string; cadence?: string; description?: string }

export interface ContentSection {
  type: 'overview' | 'phases' | 'tasks' | 'resources' | 'risks' | 'kpis' | 'timeline' | 'other';
  title: string;
  content: string;
  level: number;
}

export interface ImplementationPlan {
  meta: ImplementationPlanMeta;
  overview: { goals: string[]; successCriteria?: string[]; assumptions?: string[] };
  phases: Phase[];
  tasks: Task[];
  timeline?: { start?: string; end?: string; milestones?: Milestone[] };
  resources?: { team?: Resource[]; vendors?: string[] };
  budget?: { items: { label: string; cost: string; notes?: string }[]; total?: string; assumptions?: string[] };
  risks?: Risk[];
  kpis?: KPI[];
  next90Days?: { days30: string[]; days60: string[]; days90: string[] };
  
  // New text-focused fields (primary content)
  textContent?: string;           // Raw markdown content from LLM
  formattedContent?: string;      // Processed content for display
  contentSections?: ContentSection[]; // Parsed sections for structured display
  
  // Display mode support
  displayMode?: 'text' | 'structured' | 'hybrid';
  
  // Legacy support
  rawContent?: string; // Raw content from the API response (deprecated, use textContent)
}

export interface PlanSettings {
  systemPromptOverride?: string;
  sources?: string[];
  usePlaceholder?: boolean;
  simulateStreaming?: boolean;
  compactMode?: boolean;
  compactMaxPhaseCards?: number;
  lengthPreset?: 'brief' | 'standard' | 'long';
  model?: string;
  apiKey?: string;
}

export interface PlanState {
  selectedSuggestion?: any; // BusinessSuggestion, typed via existing codebase
  status: PlanStatus;
  error?: string;
  rawStream?: string; // accumulated raw text for fallback
  plan?: ImplementationPlan;
  settings: PlanSettings;
}
