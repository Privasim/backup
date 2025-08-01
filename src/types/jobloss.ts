export interface NewsItem {
  id: string;
  title: string;
  snippet: string;
  url: string;
  source: string;
  publishedAt: string;
  content?: string;
  jobLossCount?: number;
  keywords?: string[];
  imageUrl?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  impactLevel?: 'low' | 'medium' | 'high';
}

export interface AnalysisResult {
  id: string;
  articleId: string;
  summary: string;
  impactLevel: 'low' | 'medium' | 'high';
  companies: string[];
  jobLossCount: number | null;
  keyInsights: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  modelUsed?: string;
  confidenceScore?: number;
  rawResponse?: any;
}

export interface SearchFilters {
  dateRange: 'day' | 'week' | 'month' | 'all';
  sources: string[];
  minRelevance: number;
}
