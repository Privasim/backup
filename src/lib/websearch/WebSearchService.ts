import { SearchOptions, SearchResponse, WebSearchProvider } from './types';
import { DuckDuckGoProvider } from './providers/DuckDuckGoProvider';

export class WebSearchService {
  private providers: Record<string, WebSearchProvider> = {};
  private defaultProvider: string = 'duckduckgo';

  constructor() {
    this.registerProvider('duckduckgo', new DuckDuckGoProvider());
  }

  /**
   * Register a new search provider
   */
  registerProvider(name: string, provider: WebSearchProvider): void {
    this.providers[name.toLowerCase()] = provider;
  }

  /**
   * Set the default search provider
   */
  setDefaultProvider(name: string): void {
    if (this.providers[name.toLowerCase()]) {
      this.defaultProvider = name.toLowerCase();
    } else {
      console.warn(`Search provider '${name}' not found. Keeping current default.`);
    }
  }

  /**
   * Get a search provider by name
   */
  getProvider(name?: string): WebSearchProvider {
    const providerName = name ? name.toLowerCase() : this.defaultProvider;
    const provider = this.providers[providerName];
    
    if (!provider) {
      throw new Error(`Search provider '${providerName}' not found`);
    }
    
    return provider;
  }

  /**
   * Search using the default provider
   */
  async search(
    query: string, 
    options: Partial<Omit<SearchOptions, 'query'>> = {}
  ): Promise<SearchResponse> {
    const provider = this.getProvider();
    const searchOptions: SearchOptions = {
      query,
      count: 10,
      offset: 0,
      ...options,
    };

    try {
      return await provider.search(searchOptions);
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  /**
   * Search using a specific provider
   */
  async searchWithProvider(
    providerName: string,
    query: string,
    options: Partial<Omit<SearchOptions, 'query'>> = {}
  ): Promise<SearchResponse> {
    const provider = this.getProvider(providerName);
    const searchOptions: SearchOptions = {
      query,
      count: 10,
      offset: 0,
      ...options,
    };

    try {
      return await provider.search(searchOptions);
    } catch (error) {
      console.error(`Search with ${providerName} failed:`, error);
      throw error;
    }
  }

  /**
   * Get a list of available search providers
   */
  listProviders(): string[] {
    return Object.keys(this.providers);
  }
}

// Export a singleton instance
export const webSearchService = new WebSearchService();
