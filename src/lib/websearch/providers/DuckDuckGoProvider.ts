import { SearchOptions, SearchResult, SearchResponse, WebSearchProvider } from '../types';

export class DuckDuckGoProvider implements WebSearchProvider {
  private readonly apiUrl = 'https://api.duckduckgo.com/';
  private readonly defaultOptions: Partial<SearchOptions> = {
    count: 10,
    offset: 0,
    freshness: 'month',
    safeSearch: 'Moderate',
  };

  async search(options: SearchOptions): Promise<SearchResponse> {
    const params = new URLSearchParams({
      q: options.query,
      format: 'json',
      no_html: '1',
      no_redirect: '1',
      skip_disambig: '1',
      t: 'joblosstracker', // User agent token
      ...(options.freshness && this.getTimeRangeParam(options.freshness)),
    });

    try {
      const response = await fetch(`${this.apiUrl}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`DuckDuckGo API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform DuckDuckGo response to our format
      const results: SearchResult[] = [
        // Main results
        ...(data.Results || []).map((result: any) => ({
          id: `ddg_${result.FirstURL?.hashCode() || Date.now()}`,
          title: result.Text,
          url: result.FirstURL,
          displayUrl: new URL(result.FirstURL).hostname,
          snippet: result.Text,
          datePublished: new Date().toISOString(), // DuckDuckGo doesn't provide dates
          isFamilyFriendly: true,
          language: 'en',
          isNavigational: false,
          provider: {
            name: 'DuckDuckGo',
          },
        })),
        // Related topics
        ...(data.RelatedTopics || []).map((topic: any) => ({
          id: `ddg_${topic.FirstURL?.hashCode() || Date.now()}`,
          title: topic.Text,
          url: topic.FirstURL,
          displayUrl: topic.FirstURL ? new URL(topic.FirstURL).hostname : '',
          snippet: topic.Text,
          datePublished: new Date().toISOString(),
          isFamilyFriendly: true,
          language: 'en',
          isNavigational: false,
          provider: {
            name: 'DuckDuckGo',
          },
        })),
      ];

      return {
        results: results.filter((r) => r.url), // Filter out results without URLs
        totalEstimatedMatches: results.length,
      };
    } catch (error) {
      console.error('DuckDuckGo search failed:', error);
      throw new Error('Failed to fetch search results. Please try again later.');
    }
  }

  private getTimeRangeParam(freshness: string): { tbs?: string } {
    switch (freshness) {
      case 'day':
        return { tbs: 'qd:1' };
      case 'week':
        return { tbs: 'qdr:w' };
      case 'month':
        return { tbs: 'qdr:m' };
      case 'year':
        return { tbs: 'qdr:y' };
      default:
        return {};
    }
  }

  getProviderName(): string {
    return 'DuckDuckGo';
  }
}

// Helper function to generate hash code
if (!String.prototype.hashCode) {
  String.prototype.hashCode = function() {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
      const char = this.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  };
}
