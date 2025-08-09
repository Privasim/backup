import { ContentExtractor } from './ContentExtractor';
import { ProgressTracker } from './ProgressTracker';
import type { 
  ProcessedSection, 
  ContentExtractionResult, 
  StreamingContentProcessorConfig,
  GenerationPhase 
} from './types';

export class StreamingContentProcessor {
  private buffer: string = '';
  private extractor: ContentExtractor;
  private progressTracker: ProgressTracker;
  private config: StreamingContentProcessorConfig;
  private lastProcessedLength: number = 0;
  private sections: Map<GenerationPhase, ProcessedSection> = new Map();

  constructor(config: Partial<StreamingContentProcessorConfig> = {}) {
    this.config = {
      maxBufferSize: 50000,
      updateThrottleMs: 100,
      enableFallback: true,
      ...config
    };
    
    this.extractor = new ContentExtractor();
    this.progressTracker = new ProgressTracker();
  }

  /**
   * Process a new chunk of streaming content
   */
  processChunk(chunk: string): ContentExtractionResult {
    // Add chunk to buffer
    this.buffer += chunk;
    
    // Manage buffer size
    if (this.buffer.length > this.config.maxBufferSize) {
      this.buffer = this.buffer.slice(-this.config.maxBufferSize);
    }

    // Detect current phase
    const currentPhase = this.progressTracker.detectCurrentPhase(this.buffer);
    
    // Try to extract content
    const extractionResult = this.extractContent();
    
    return {
      sections: Array.from(this.sections.values()),
      progress: this.progressTracker.getProgress(),
      hasNewContent: this.buffer.length > this.lastProcessedLength
    };
  }

  /**
   * Get current processed sections
   */
  getCurrentSections(): ProcessedSection[] {
    return Array.from(this.sections.values());
  }

  /**
   * Get current progress information
   */
  getProgress() {
    return this.progressTracker.getProgress();
  }

  /**
   * Reset processor for new generation
   */
  reset(): void {
    this.buffer = '';
    this.lastProcessedLength = 0;
    this.sections.clear();
    this.progressTracker.reset();
  }

  /**
   * Get raw buffer content (fallback)
   */
  getRawContent(): string {
    return this.buffer;
  }

  private extractContent(): ContentExtractionResult {
    const hasNewContent = this.buffer.length > this.lastProcessedLength;
    
    if (!hasNewContent) {
      return {
        sections: Array.from(this.sections.values()),
        progress: this.progressTracker.getProgress(),
        hasNewContent: false
      };
    }

    // Try to parse JSON
    const parsedData = this.attemptParse(this.buffer);
    
    if (parsedData) {
      this.extractFromParsedData(parsedData);
    } else {
      // Try partial extraction
      this.extractPartialContent();
    }

    this.lastProcessedLength = this.buffer.length;
    
    return {
      sections: Array.from(this.sections.values()),
      progress: this.progressTracker.getProgress(),
      hasNewContent: true
    };
  }

  private attemptParse(content: string): any | null {
    // Strategy 1: Try complete JSON parse
    try {
      const trimmed = content.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return JSON.parse(trimmed);
      }
    } catch {}

    // Strategy 2: Try to find and parse JSON block
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}

    // Strategy 3: Try partial JSON parsing
    try {
      const openBrace = content.indexOf('{');
      const closeBrace = content.lastIndexOf('}');
      
      if (openBrace !== -1 && closeBrace > openBrace) {
        const jsonCandidate = content.slice(openBrace, closeBrace + 1);
        return JSON.parse(jsonCandidate);
      }
    } catch {}

    return null;
  }

  private extractFromParsedData(data: any): void {
    // Extract different sections based on available data
    const sectionTypes: GenerationPhase[] = [
      'overview', 'phases', 'tasks', 'timeline', 
      'resources', 'budget', 'risks', 'kpis', 'next90days'
    ];

    for (const sectionType of sectionTypes) {
      if (this.hasSectionData(data, sectionType)) {
        this.createOrUpdateSection(data, sectionType);
      }
    }
  }

  private extractPartialContent(): void {
    // Extract readable content from partial JSON or text
    const currentPhase = this.progressTracker.getProgress().currentPhase;
    
    // Look for recognizable patterns
    const patterns = this.findContentPatterns(this.buffer);
    
    if (patterns.length > 0) {
      const section: ProcessedSection = {
        id: currentPhase,
        type: currentPhase,
        title: this.progressTracker.getPhaseDisplayName(currentPhase),
        content: patterns,
        isComplete: false,
        timestamp: Date.now()
      };
      
      this.sections.set(currentPhase, section);
    }
  }

  private hasSectionData(data: any, sectionType: GenerationPhase): boolean {
    switch (sectionType) {
      case 'overview':
        return data.overview && (data.overview.goals || data.overview.successCriteria);
      case 'phases':
        return data.phases && Array.isArray(data.phases) && data.phases.length > 0;
      case 'tasks':
        return data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0;
      case 'timeline':
        return data.timeline && (data.timeline.start || data.timeline.milestones);
      case 'resources':
        return data.resources && (data.resources.team || data.resources.vendors);
      case 'budget':
        return data.budget && (data.budget.items || data.budget.total);
      case 'risks':
        return data.risks && Array.isArray(data.risks) && data.risks.length > 0;
      case 'kpis':
        return data.kpis && Array.isArray(data.kpis) && data.kpis.length > 0;
      case 'next90days':
        return data.next90Days && (data.next90Days.days30 || data.next90Days.days60 || data.next90Days.days90);
      default:
        return false;
    }
  }

  private createOrUpdateSection(data: any, sectionType: GenerationPhase): void {
    const formattedContent = this.extractor.extractReadableContent(data, sectionType);
    
    const section: ProcessedSection = {
      id: sectionType,
      type: sectionType,
      title: formattedContent.title || this.progressTracker.getPhaseDisplayName(sectionType),
      content: formattedContent.bulletPoints,
      isComplete: true,
      timestamp: Date.now()
    };

    this.sections.set(sectionType, section);
    this.progressTracker.markPhaseComplete(sectionType);
  }

  private findContentPatterns(content: string): string[] {
    const patterns: string[] = [];
    
    // Look for bullet points
    const bulletMatches = content.match(/[•\-\*]\s*([^\n\r]+)/g);
    if (bulletMatches) {
      patterns.push(...bulletMatches.map(match => match.replace(/^[•\-\*]\s*/, '')));
    }

    // Look for numbered lists
    const numberedMatches = content.match(/\d+\.\s*([^\n\r]+)/g);
    if (numberedMatches) {
      patterns.push(...numberedMatches.map(match => match.replace(/^\d+\.\s*/, '')));
    }

    // Look for key-value pairs
    const kvMatches = content.match(/([A-Za-z\s]+):\s*([^\n\r]+)/g);
    if (kvMatches) {
      patterns.push(...kvMatches.slice(0, 5)); // Limit to avoid noise
    }

    // If no patterns found, extract sentences
    if (patterns.length === 0) {
      const sentences = content.match(/[A-Z][^.!?]*[.!?]/g);
      if (sentences) {
        patterns.push(...sentences.slice(-3)); // Last 3 sentences
      }
    }

    return patterns.slice(0, 8); // Limit to 8 items
  }
}