export type GenerationPhase = 
  | 'initializing'
  | 'overview'
  | 'phases'
  | 'tasks'
  | 'timeline'
  | 'resources'
  | 'budget'
  | 'risks'
  | 'kpis'
  | 'next90days'
  | 'finalizing'
  | 'complete';

export interface ProcessedSection {
  id: string;
  type: GenerationPhase;
  title: string;
  content: string[];
  isComplete: boolean;
  timestamp: number;
}

export interface StreamingProgress {
  currentPhase: GenerationPhase;
  completedPhases: GenerationPhase[];
  progress: number; // 0-100
  estimatedTimeRemaining?: number;
}

export interface StreamingState {
  rawContent: string;
  processedSections: ProcessedSection[];
  currentPhase: GenerationPhase;
  progress: number;
  error: string | null;
  isProcessing: boolean;
}

export interface FormattedContent {
  title?: string;
  bulletPoints: string[];
  description?: string;
  metadata?: Record<string, any>;
}

export interface ContentExtractionResult {
  sections: ProcessedSection[];
  progress: StreamingProgress;
  hasNewContent: boolean;
}

export interface StreamingContentProcessorConfig {
  maxBufferSize: number;
  updateThrottleMs: number;
  enableFallback: boolean;
}