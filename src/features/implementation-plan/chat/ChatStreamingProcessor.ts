import { ContentTransformer } from './ContentTransformer';

export interface StreamingSection {
  id: string;
  name: string;
  content: string;
  isComplete: boolean;
  progress: number;
}

export interface StreamingProgress {
  currentSection: string;
  sections: StreamingSection[];
  overallProgress: number;
  estimatedTimeRemaining?: number;
}

export class ChatStreamingProcessor {
  private accumulatedContent: string = '';
  private sections: StreamingSection[] = [];
  private currentSectionIndex: number = 0;
  private onProgressUpdate?: (progress: StreamingProgress) => void;
  private onSectionComplete?: (section: StreamingSection) => void;
  private startTime: number = Date.now();

  // Expected sections in order
  private readonly expectedSections = [
    { id: 'meta', name: 'Plan Information', weight: 0.05 },
    { id: 'overview', name: 'Overview', weight: 0.15 },
    { id: 'phases', name: 'Implementation Phases', weight: 0.25 },
    { id: 'tasks', name: 'Action Items', weight: 0.20 },
    { id: 'timeline', name: 'Timeline', weight: 0.10 },
    { id: 'resources', name: 'Resources', weight: 0.10 },
    { id: 'budget', name: 'Budget', weight: 0.05 },
    { id: 'risks', name: 'Risk Assessment', weight: 0.05 },
    { id: 'kpis', name: 'Success Metrics', weight: 0.03 },
    { id: 'next90Days', name: '90-Day Action Plan', weight: 0.02 }
  ];

  constructor(
    onProgressUpdate?: (progress: StreamingProgress) => void,
    onSectionComplete?: (section: StreamingSection) => void
  ) {
    this.onProgressUpdate = onProgressUpdate;
    this.onSectionComplete = onSectionComplete;
    
    // Initialize sections
    this.sections = this.expectedSections.map(section => ({
      id: section.id,
      name: section.name,
      content: '',
      isComplete: false,
      progress: 0
    }));
  }

  /**
   * Process a new chunk of streaming content
   */
  processChunk(chunk: string): string {
    this.accumulatedContent += chunk;
    
    // Try to detect section completion
    this.detectSectionCompletion();
    
    // Update progress
    this.updateProgress();
    
    // Return formatted content for display
    return this.formatCurrentContent();
  }

  /**
   * Complete the streaming process
   */
  complete(finalContent?: string): string {
    if (finalContent) {
      this.accumulatedContent = finalContent;
    }

    // Mark all sections as complete
    this.sections.forEach(section => {
      section.isComplete = true;
      section.progress = 100;
    });

    // Final progress update
    this.updateProgress();

    // Parse and format the complete plan
    return this.parseAndFormatCompletePlan();
  }

  /**
   * Detect when sections are completed based on JSON structure
   */
  private detectSectionCompletion(): void {
    try {
      // Try to parse the accumulated content as JSON
      const jsonMatch = this.accumulatedContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return;

      const partialPlan = JSON.parse(jsonMatch[0]);
      
      // Check each expected section
      this.expectedSections.forEach((expectedSection, index) => {
        const section = this.sections[index];
        if (!section.isComplete && partialPlan[expectedSection.id]) {
          // Section appears to be complete
          section.isComplete = true;
          section.progress = 100;
          
          // Format the section content
          section.content = this.formatSection(expectedSection.id, partialPlan[expectedSection.id]);
          
          // Notify completion
          if (this.onSectionComplete) {
            this.onSectionComplete(section);
          }
        }
      });
    } catch (error) {
      // JSON parsing failed, continue accumulating
    }
  }

  /**
   * Update overall progress
   */
  private updateProgress(): void {
    const completedWeight = this.sections.reduce((total, section, index) => {
      const expectedSection = this.expectedSections[index];
      return total + (section.isComplete ? expectedSection.weight : 0);
    }, 0);

    const overallProgress = Math.min(completedWeight * 100, 95); // Cap at 95% until complete
    
    // Estimate time remaining
    const elapsed = Date.now() - this.startTime;
    const estimatedTotal = overallProgress > 0 ? (elapsed / overallProgress) * 100 : 0;
    const estimatedTimeRemaining = Math.max(0, estimatedTotal - elapsed);

    const progress: StreamingProgress = {
      currentSection: this.getCurrentSectionName(),
      sections: [...this.sections],
      overallProgress,
      estimatedTimeRemaining
    };

    if (this.onProgressUpdate) {
      this.onProgressUpdate(progress);
    }
  }

  /**
   * Get the name of the current section being processed
   */
  private getCurrentSectionName(): string {
    const incompleteSection = this.sections.find(section => !section.isComplete);
    return incompleteSection?.name || 'Finalizing...';
  }

  /**
   * Format content for real-time display
   */
  private formatCurrentContent(): string {
    const parts: string[] = [];
    
    // Add completed sections
    this.sections.forEach(section => {
      if (section.isComplete && section.content) {
        parts.push(section.content);
        parts.push('---\n');
      }
    });

    // Add current section indicator
    const currentSection = this.getCurrentSectionName();
    if (currentSection !== 'Finalizing...') {
      parts.push(`🔄 **Currently generating:** ${currentSection}...\n`);
    }

    return parts.join('\n');
  }

  /**
   * Format a specific section
   */
  private formatSection(sectionId: string, sectionData: any): string {
    try {
      switch (sectionId) {
        case 'meta':
          return `# ${sectionData.title}\n\n📋 **Plan Details**\n• Category: ${sectionData.category}\n• Version: ${sectionData.version}\n• Created: ${new Date(sectionData.createdAt).toLocaleDateString()}\n`;
        
        case 'overview':
          return ContentTransformer.transformOverview(sectionData);
        
        case 'phases':
          return ContentTransformer.transformPhases(sectionData);
        
        case 'tasks':
          return ContentTransformer.transformTasks(sectionData);
        
        case 'timeline':
          return ContentTransformer.transformTimeline(sectionData);
        
        case 'resources':
          return ContentTransformer.transformResources(sectionData);
        
        case 'budget':
          return ContentTransformer.transformBudget(sectionData);
        
        case 'risks':
          return ContentTransformer.transformRisks(sectionData);
        
        case 'kpis':
          return ContentTransformer.transformKPIs(sectionData);
        
        case 'next90Days':
          return ContentTransformer.transformNext90Days(sectionData);
        
        default:
          return `**${sectionId}:** ${JSON.stringify(sectionData, null, 2)}\n`;
      }
    } catch (error) {
      return `**${sectionId}:** Processing...\n`;
    }
  }

  /**
   * Parse and format the complete plan
   */
  private parseAndFormatCompletePlan(): string {
    try {
      const jsonMatch = this.accumulatedContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return 'Unable to parse the complete plan. Please try regenerating.';
      }

      const plan = JSON.parse(jsonMatch[0]);
      return ContentTransformer.transformCompletePlan(plan);
    } catch (error) {
      return 'Error parsing the complete plan. The raw content has been preserved.';
    }
  }

  /**
   * Get current progress information
   */
  getProgress(): StreamingProgress {
    const completedWeight = this.sections.reduce((total, section, index) => {
      const expectedSection = this.expectedSections[index];
      return total + (section.isComplete ? expectedSection.weight : 0);
    }, 0);

    return {
      currentSection: this.getCurrentSectionName(),
      sections: [...this.sections],
      overallProgress: Math.min(completedWeight * 100, 95)
    };
  }

  /**
   * Reset the processor for a new streaming session
   */
  reset(): void {
    this.accumulatedContent = '';
    this.currentSectionIndex = 0;
    this.startTime = Date.now();
    
    this.sections = this.expectedSections.map(section => ({
      id: section.id,
      name: section.name,
      content: '',
      isComplete: false,
      progress: 0
    }));
  }
}