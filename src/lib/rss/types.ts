export interface RSSArticle {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  author?: string;
  category?: string[];
  guid?: string;
  
  // Analysis fields
  isJobLossRelated?: boolean;
  relevanceScore?: number;
  analysisResult?: AnalysisResult;
  isSelected?: boolean;
}

export interface FeedConfig {
  url: string;
  refreshInterval: number; // minutes
  maxArticles: number;
  filterRelevant: boolean;
  autoAnalyze: boolean;
}

export interface RSSFeedData {
  title: string;
  description: string;
  link: string;
  lastBuildDate?: Date;
  articles: RSSArticle[];
}

export interface FeedStatus {
  status: 'healthy' | 'error' | 'loading';
  lastUpdated: Date | null;
  lastError?: string;
  articleCount: number;
}

export interface AnalysisResult {
  articleId: string;
  impactLevel: 'low' | 'medium' | 'high';
  companies: string[];
  industries: string[];
  jobsAffected?: number;
  isAIRelated: boolean;
  isAutomationRelated: boolean;
  keyInsights: string[];
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface RelevanceFilter {
  keywords: string[];
  titleWeight: number;
  descriptionWeight: number;
  minimumScore: number;
}

export interface DeduplicationConfig {
  titleSimilarityThreshold: number;
  linkNormalization: boolean;
  timeWindowHours: number;
  guidComparison: boolean;
}