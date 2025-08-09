/**
 * Simple streaming processor that displays raw LLM output without transformation
 * This is much more reliable than trying to parse and transform JSON
 */
export class SimpleStreamingProcessor {
  private accumulatedContent: string = '';
  private onContentUpdate?: (content: string) => void;
  private startTime: number = Date.now();

  constructor(onContentUpdate?: (content: string) => void) {
    this.onContentUpdate = onContentUpdate;
  }

  /**
   * Process a new chunk of streaming content
   */
  processChunk(chunk: string): string {
    this.accumulatedContent += chunk;
    
    // Notify about content update
    if (this.onContentUpdate) {
      this.onContentUpdate(this.accumulatedContent);
    }
    
    return this.accumulatedContent;
  }

  /**
   * Complete the streaming process
   */
  complete(finalContent?: string): string {
    if (finalContent) {
      this.accumulatedContent = finalContent;
    }

    // Final content update
    if (this.onContentUpdate) {
      this.onContentUpdate(this.accumulatedContent);
    }

    return this.accumulatedContent;
  }

  /**
   * Get current accumulated content
   */
  getCurrentContent(): string {
    return this.accumulatedContent;
  }

  /**
   * Get generation duration
   */
  getDuration(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Reset the processor for a new streaming session
   */
  reset(): void {
    this.accumulatedContent = '';
    this.startTime = Date.now();
  }

  /**
   * Estimate progress based on content length (rough approximation)
   */
  getEstimatedProgress(): number {
    // Very rough estimation based on content length
    // Typical implementation plan is around 2000-4000 characters
    const estimatedFinalLength = 3000;
    const progress = Math.min((this.accumulatedContent.length / estimatedFinalLength) * 100, 95);
    return Math.round(progress);
  }
}