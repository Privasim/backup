import type { GenerationPhase, StreamingProgress } from './types';

export class ProgressTracker {
  private readonly PHASE_ORDER: GenerationPhase[] = [
    'initializing',
    'overview',
    'phases',
    'tasks',
    'timeline',
    'resources',
    'budget',
    'risks',
    'kpis',
    'next90days',
    'finalizing',
    'complete'
  ];

  private readonly PHASE_WEIGHTS: Record<GenerationPhase, number> = {
    'initializing': 5,
    'overview': 15,
    'phases': 20,
    'tasks': 25,
    'timeline': 10,
    'resources': 8,
    'budget': 7,
    'risks': 5,
    'kpis': 3,
    'next90days': 2,
    'finalizing': 0,
    'complete': 0
  };

  private completedPhases: Set<GenerationPhase> = new Set();
  private currentPhase: GenerationPhase = 'initializing';
  private startTime: number = Date.now();

  /**
   * Detect current generation phase from content
   */
  detectCurrentPhase(content: string): GenerationPhase {
    const lowerContent = content.toLowerCase();

    // Check for section patterns in order of likelihood
    if (this.containsPattern(lowerContent, ['next90days', '90 days', 'action plan'])) {
      return this.updateCurrentPhase('next90days');
    }
    if (this.containsPattern(lowerContent, ['kpis', 'kpi', 'metrics', 'performance indicator'])) {
      return this.updateCurrentPhase('kpis');
    }
    if (this.containsPattern(lowerContent, ['risks', 'risk', 'mitigation', 'likelihood'])) {
      return this.updateCurrentPhase('risks');
    }
    if (this.containsPattern(lowerContent, ['budget', 'cost', 'financial', 'expense'])) {
      return this.updateCurrentPhase('budget');
    }
    if (this.containsPattern(lowerContent, ['resources', 'team', 'vendor', 'tools'])) {
      return this.updateCurrentPhase('resources');
    }
    if (this.containsPattern(lowerContent, ['timeline', 'schedule', 'milestone', 'deadline'])) {
      return this.updateCurrentPhase('timeline');
    }
    if (this.containsPattern(lowerContent, ['tasks', 'task', 'todo', 'action item'])) {
      return this.updateCurrentPhase('tasks');
    }
    if (this.containsPattern(lowerContent, ['phases', 'phase', 'stage', 'step'])) {
      return this.updateCurrentPhase('phases');
    }
    if (this.containsPattern(lowerContent, ['overview', 'goals', 'objectives', 'success criteria'])) {
      return this.updateCurrentPhase('overview');
    }

    // Check for completion indicators
    if (this.containsPattern(lowerContent, ['}', 'complete', 'finished', 'done'])) {
      if (this.completedPhases.size >= 6) { // Most sections completed
        return this.updateCurrentPhase('finalizing');
      }
    }

    return this.currentPhase;
  }

  /**
   * Calculate progress percentage based on completed phases
   */
  calculateProgress(): number {
    let totalWeight = 0;
    let completedWeight = 0;

    for (const phase of this.PHASE_ORDER) {
      const weight = this.PHASE_WEIGHTS[phase];
      totalWeight += weight;
      
      if (this.completedPhases.has(phase)) {
        completedWeight += weight;
      } else if (phase === this.currentPhase) {
        // Add partial weight for current phase
        completedWeight += weight * 0.5;
      }
    }

    return Math.min(100, Math.round((completedWeight / totalWeight) * 100));
  }

  /**
   * Mark a phase as completed
   */
  markPhaseComplete(phase: GenerationPhase): void {
    this.completedPhases.add(phase);
    
    // Auto-advance to next phase if current phase is completed
    if (phase === this.currentPhase) {
      const currentIndex = this.PHASE_ORDER.indexOf(this.currentPhase);
      if (currentIndex < this.PHASE_ORDER.length - 1) {
        this.currentPhase = this.PHASE_ORDER[currentIndex + 1];
      }
    }
  }

  /**
   * Get current streaming progress
   */
  getProgress(): StreamingProgress {
    return {
      currentPhase: this.currentPhase,
      completedPhases: Array.from(this.completedPhases),
      progress: this.calculateProgress(),
      estimatedTimeRemaining: this.estimateTimeRemaining()
    };
  }

  /**
   * Reset tracker for new generation
   */
  reset(): void {
    this.completedPhases.clear();
    this.currentPhase = 'initializing';
    this.startTime = Date.now();
  }

  /**
   * Get human-readable phase name
   */
  getPhaseDisplayName(phase: GenerationPhase): string {
    const displayNames: Record<GenerationPhase, string> = {
      'initializing': 'Initializing',
      'overview': 'Business Overview',
      'phases': 'Implementation Phases',
      'tasks': 'Task Planning',
      'timeline': 'Timeline & Milestones',
      'resources': 'Resource Planning',
      'budget': 'Budget Analysis',
      'risks': 'Risk Assessment',
      'kpis': 'Success Metrics',
      'next90days': '90-Day Action Plan',
      'finalizing': 'Finalizing Plan',
      'complete': 'Complete'
    };

    return displayNames[phase] || phase;
  }

  /**
   * Check if phase is completed
   */
  isPhaseComplete(phase: GenerationPhase): boolean {
    return this.completedPhases.has(phase);
  }

  /**
   * Get completion status for all phases
   */
  getPhaseStatuses(): Record<GenerationPhase, 'pending' | 'current' | 'complete'> {
    const statuses: Record<GenerationPhase, 'pending' | 'current' | 'complete'> = {} as any;

    for (const phase of this.PHASE_ORDER) {
      if (this.completedPhases.has(phase)) {
        statuses[phase] = 'complete';
      } else if (phase === this.currentPhase) {
        statuses[phase] = 'current';
      } else {
        statuses[phase] = 'pending';
      }
    }

    return statuses;
  }

  private updateCurrentPhase(newPhase: GenerationPhase): GenerationPhase {
    // Only advance, don't go backwards
    const currentIndex = this.PHASE_ORDER.indexOf(this.currentPhase);
    const newIndex = this.PHASE_ORDER.indexOf(newPhase);
    
    if (newIndex > currentIndex) {
      // Mark previous phases as complete
      for (let i = 0; i < newIndex; i++) {
        this.completedPhases.add(this.PHASE_ORDER[i]);
      }
      this.currentPhase = newPhase;
    }

    return this.currentPhase;
  }

  private containsPattern(content: string, patterns: string[]): boolean {
    return patterns.some(pattern => content.includes(pattern));
  }

  private estimateTimeRemaining(): number | undefined {
    const elapsed = Date.now() - this.startTime;
    const progress = this.calculateProgress();
    
    if (progress > 10 && progress < 95) {
      const totalEstimated = (elapsed / progress) * 100;
      return Math.max(0, totalEstimated - elapsed);
    }

    return undefined;
  }
}