// RSS Feed Services
export { rssFeedService, RSSFeedService } from './parser';
export { relevanceFilterService, RelevanceFilterService } from './relevance-filter';
export { deduplicationService, DeduplicationService } from './deduplication';

// Types
export type {
  RSSArticle,
  FeedConfig,
  RSSFeedData,
  FeedStatus,
  AnalysisResult,
  RelevanceFilter,
  DeduplicationConfig
} from './types';