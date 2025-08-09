/**
 * Throttle function to limit update frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Debounce function to delay execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Simple memory usage tracker
 */
export class MemoryTracker {
  private maxSize: number;
  private currentSize: number = 0;

  constructor(maxSize: number = 1024 * 1024) { // 1MB default
    this.maxSize = maxSize;
  }

  track(content: string): boolean {
    const size = new Blob([content]).size;
    this.currentSize += size;
    
    if (this.currentSize > this.maxSize) {
      this.cleanup();
      return false;
    }
    
    return true;
  }

  cleanup(): void {
    this.currentSize = 0;
  }

  getCurrentSize(): number {
    return this.currentSize;
  }

  getMaxSize(): number {
    return this.maxSize;
  }
}