import { OpenRouterClient } from '../client';
import { AnalysisRequest, AnalysisResult, AnalysisOptions, BatchAnalysisResult } from './types';

const DEFAULT_ANALYSIS_OPTIONS: Required<Omit<AnalysisOptions, 'userPrompt' | 'systemPrompt'>> = {
  model: 'anthropic/claude-3-opus',
  temperature: 0.3,
  maxTokens: 2000,
};

const DEFAULT_SYSTEM_PROMPT = `You are an AI assistant that analyzes news articles about job losses and business impacts due to AI. 
Your task is to extract key information and provide structured analysis. Be concise and factual.`;

const DEFAULT_USER_PROMPT = (article: any) => `Analyze this news article about AI's impact on jobs and businesses:

Title: ${article.title}
Source: ${article.source || 'Unknown'}
Published: ${article.publishedAt || 'Date not available'}

Content:
${article.content || article.snippet || 'No content available'}

Please provide a structured analysis including:
1. A brief summary of the article
2. The main companies or industries affected
3. Estimated number of jobs impacted (if mentioned)
4. The type of impact (layoffs, automation, business closure, etc.)
5. Key insights or notable points
6. Sentiment analysis (positive/negative/neutral)

Format your response as a JSON object with these fields:
{
  "summary": "Brief summary of the article",
  "impactLevel": "low/medium/high",
  "companies": ["Company A", "Company B"],
  "jobLossCount": number or null,
  "keyInsights": ["insight 1", "insight 2"],
  "sentiment": "positive/negative/neutral"
}`;

export class NewsAnalyzer {
  private client: OpenRouterClient;
  private options: Required<AnalysisOptions>;

  constructor(apiKey: string, options: AnalysisOptions = {}) {
    this.client = new OpenRouterClient(apiKey);
    this.options = {
      ...DEFAULT_ANALYSIS_OPTIONS,
      ...options,
      systemPrompt: options.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      userPrompt: options.userPrompt || DEFAULT_USER_PROMPT,
    };
  }

  /**
   * Analyze a single news article
   */
  async analyzeArticle(article: any): Promise<AnalysisResult> {
    try {
      const { model, temperature, maxTokens, systemPrompt, userPrompt } = this.options;
      
      const response = await this.client.chat({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt(article) }
        ],
        temperature,
        max_tokens: maxTokens,
      });

      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('No content in AI response');
      }

      // Try to parse the JSON response
      let resultData;
      try {
        // Extract JSON from markdown code block if present
        const content = response.choices[0].message.content;
        const jsonMatch = content.match(/```(?:json)?\n([\s\S]*?)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;
        
        resultData = JSON.parse(jsonString);
      } catch (e) {
        console.error('Failed to parse AI response:', e);
        throw new Error('Failed to parse AI analysis response');
      }

      // Validate and normalize the response
      const result: AnalysisResult = {
        articleId: article.id || `article-${Date.now()}`,
        summary: resultData.summary || 'No summary available',
        impactLevel: this.normalizeImpactLevel(resultData.impactLevel),
        companies: Array.isArray(resultData.companies) ? resultData.companies : [],
        jobLossCount: typeof resultData.jobLossCount === 'number' ? resultData.jobLossCount : null,
        keyInsights: Array.isArray(resultData.keyInsights) ? resultData.keyInsights : [],
        sentiment: this.normalizeSentiment(resultData.sentiment),
        timestamp: new Date().toISOString(),
        modelUsed: model,
        rawResponse: resultData,
      };

      return result;
    } catch (error) {
      console.error('Error analyzing article:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze multiple news articles in batch
   */
  async analyzeBatch(articles: any[]): Promise<BatchAnalysisResult> {
    const results: AnalysisResult[] = [];
    const errors: Array<{ articleId: string; error: string }> = [];

    // Process articles in sequence to avoid rate limiting
    for (const article of articles) {
      try {
        const result = await this.analyzeArticle(article);
        results.push(result);
      } catch (error) {
        errors.push({
          articleId: article.id || `article-${Date.now()}`,
          error: error.message,
        });
      }
    }

    // Generate a summary if we have results
    let summary: string | undefined;
    if (results.length > 0) {
      summary = await this.generateSummary(results);
    }

    return {
      results,
      summary,
      totalArticles: articles.length,
      processedAt: new Date().toISOString(),
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Generate a summary of multiple analysis results
   */
  private async generateSummary(results: AnalysisResult[]): Promise<string> {
    try {
      const { model } = this.options;
      const analysisText = results
        .map((r, i) => `Article ${i + 1}: ${r.summary}`)
        .join('\n\n');

      const response = await this.client.chat({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that summarizes multiple analyses into a coherent overview.',
          },
          {
            role: 'user',
            content: `Please provide a concise summary of the following ${results.length} article analyses. 
            Highlight common themes, notable impacts, and overall sentiment.
            
            ${analysisText}
            
            Summary:`,
          },
        ],
        temperature: 0.5,
        max_tokens: 500,
      });

      return response?.choices?.[0]?.message?.content || 'No summary available.';
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Summary generation failed.';
    }
  }

  /**
   * Normalize impact level to ensure it's one of the allowed values
   */
  private normalizeImpactLevel(level: any): 'low' | 'medium' | 'high' {
    if (typeof level !== 'string') return 'medium';
    const normalized = level.toLowerCase().trim();
    if (['low', 'medium', 'high'].includes(normalized)) {
      return normalized as 'low' | 'medium' | 'high';
    }
    return 'medium';
  }

  /**
   * Normalize sentiment to ensure it's one of the allowed values
   */
  private normalizeSentiment(sentiment: any): 'positive' | 'negative' | 'neutral' {
    if (typeof sentiment !== 'string') return 'neutral';
    const normalized = sentiment.toLowerCase().trim();
    if (['positive', 'negative', 'neutral'].includes(normalized)) {
      return normalized as 'positive' | 'negative' | 'neutral';
    }
    return 'neutral';
  }
}

// Helper function to create a pre-configured NewsAnalyzer instance
export const createNewsAnalyzer = (apiKey: string, options: AnalysisOptions = {}) => {
  return new NewsAnalyzer(apiKey, options);
};
