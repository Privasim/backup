export interface SearchOptions {
  query: string;
  count?: number;
  offset?: number;
  freshness?: 'day' | 'week' | 'month' | 'year';
  safeSearch?: 'Off' | 'Moderate' | 'Strict';
}

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  displayUrl: string;
  snippet: string;
  datePublished: string;
  isFamilyFriendly: boolean;
  language: string;
  isNavigational: boolean;
  provider?: {
    name: string;
    favIconUrl?: string;
  };
}

export interface SearchResponse {
  results: SearchResult[];
  totalEstimatedMatches: number;
  nextOffset?: number;
}

export interface WebSearchProvider {
  search(options: SearchOptions): Promise<SearchResponse>;
  getProviderName(): string;
}
