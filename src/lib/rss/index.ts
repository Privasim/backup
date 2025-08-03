export * from './types';
export * from './parser';
export * from './relevance-filter';
export * from './deduplication';

import { rssFeedService } from './parser';
import { relevanceFilterService } from './relevance-filter';
import { deduplicationService } from './deduplication';

// Re-export services for convenience
export {
  rssFeedService,
  relevanceFilterService,
  deduplicationService
};