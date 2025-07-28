import { getDomain } from './utils';

export class SearchTracker {
  private searchId: string;
  private status: 'queued' | 'active' | 'processing' | 'completed' | 'failed' = 'queued';
  private visitedSources: Set<string> = new Set();
  private sourceDetails: {
    url: string;
    domain: string;
    title?: string;
    snippet?: string;
  }[] = [];
  private startedAt: Date;
  private completedAt?: Date;

  constructor(searchId: string) {
    this.searchId = searchId;
    this.startedAt = new Date();
  }

  start() {
    this.status = 'active';
  }

  logSource(url: string, title?: string, snippet?: string) {
    const domain = getDomain(url);
    // Only add if we haven't seen this URL before
    if (!this.visitedSources.has(url)) {
      this.visitedSources.add(url);
      this.sourceDetails.push({ url, domain, title, snippet });
    }
  }

  processing() {
    this.status = 'processing';
  }

  complete() {
    this.status = 'completed';
    this.completedAt = new Date();
  }

  fail() {
    this.status = 'failed';
    this.completedAt = new Date();
  }

  getSearchMetadata() {
    const uniqueDomains = new Set(this.sourceDetails.map(source => source.domain)).size;
    
    return {
      status: this.status,
      visitedSources: [...this.sourceDetails],
      stats: {
        totalVisited: this.sourceDetails.length,
        uniqueDomains,
        startedAt: this.startedAt,
        completedAt: this.completedAt,
        durationMs: this.completedAt ? this.completedAt.getTime() - this.startedAt.getTime() : undefined
      }
    };
  }

  getStatus() {
    return this.status;
  }

  getSourceCount() {
    return this.sourceDetails.length;
  }

  getDurationMs() {
    if (!this.completedAt) {
      return undefined;
    }
    return this.completedAt.getTime() - this.startedAt.getTime();
  }
}
