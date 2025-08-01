import { ResearchDataService } from './research-data-service';
import { KnowledgeBase } from '../types';

// Global service instance
let globalServiceInstance: ResearchDataService | null = null;

/**
 * Initialize the global research data service
 */
export async function initializeResearchService(knowledgeBase?: KnowledgeBase): Promise<ResearchDataService> {
  if (!globalServiceInstance) {
    globalServiceInstance = new ResearchDataService();
  }

  if (knowledgeBase) {
    await globalServiceInstance.initialize(knowledgeBase);
  } else {
    // Load from default location
    try {
      await globalServiceInstance.loadFromFile('/src/lib/research/data/ai_employment_risks.json');
    } catch (error) {
      console.warn('Failed to load default knowledge base, service will need manual initialization');
    }
  }

  return globalServiceInstance;
}

/**
 * Get the global research data service instance
 */
export function getResearchService(): ResearchDataService {
  if (!globalServiceInstance) {
    throw new Error('Research service not initialized. Call initializeResearchService() first.');
  }
  return globalServiceInstance;
}

/**
 * Create a new research data service instance
 */
export function createResearchService(knowledgeBase?: KnowledgeBase): ResearchDataService {
  return new ResearchDataService(knowledgeBase);
}

// Re-export types and classes
export { ResearchDataService } from './research-data-service';
export { CacheManager, ResearchDataCache } from './cache-manager';
export { 
  ErrorHandler, 
  ResearchDataError, 
  DataNotFoundError, 
  ServiceNotInitializedError,
  InvalidDataError,
  CacheError 
} from './error-handling';

export type {
  OccupationRisk,
  OccupationMatch,
  ChartConfig,
  SearchFilters,
} from './research-data-service';

export type {
  CacheConfig,
  CacheStats,
  CacheEntry,
} from './cache-manager';

export type {
  ErrorHandlingConfig,
} from './error-handling';

// Utility functions for common operations
export async function searchOccupations(query: string, limit?: number) {
  const service = getResearchService();
  return service.searchOccupations(query, { limit });
}

export async function getOccupationRisk(occupationIdentifier: string) {
  const service = getResearchService();
  return service.getOccupationRiskWithFallback(occupationIdentifier);
}

export async function getTopRiskOccupations(limit: number = 10) {
  const service = getResearchService();
  return service.getTopRiskOccupations(limit);
}

export async function getIndustryExposureData() {
  const service = getResearchService();
  return service.getIndustryData();
}

export async function getTaskAutomationData() {
  const service = getResearchService();
  return service.getTaskAutomationData();
}

export async function getVisualizationConfig(chartType: string) {
  const service = getResearchService();
  return service.getVisualizationConfig(chartType);
}

// Service health check
export function getServiceHealth() {
  try {
    const service = getResearchService();
    const stats = service.getCacheStats();
    
    return {
      status: 'healthy',
      initialized: true,
      cache: {
        hitRate: stats.hitRate,
        size: stats.size,
        hits: stats.hits,
        misses: stats.misses,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      initialized: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}