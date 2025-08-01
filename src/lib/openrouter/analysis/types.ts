import { NewsItem } from '@/types/jobloss';

export interface AnalysisRequest {
  articles: NewsItem[];
  analysisType?: 'summary' | 'impact' | 'sentiment' | 'full';
  language?: string;
}

export interface AnalysisResult {
  articleId: string;
  summary: string;
  impactLevel: 'low' | 'medium' | 'high';
  companies: string[];
  jobLossCount: number | null;
  keyInsights: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  modelUsed: string;
  confidenceScore?: number;
  rawResponse?: any;
}

export interface AnalysisOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  userPrompt?: (article: NewsItem) => string;
}

export interface BatchAnalysisResult {
  results: AnalysisResult[];
  summary?: string;
  totalArticles: number;
  processedAt: string;
  errors?: Array<{ articleId: string; error: string }>;
}
