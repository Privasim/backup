'use client';

import React from 'react';
import { RSSArticle, AnalysisResult } from '@/lib/rss/types';

interface ArticleCardProps {
  article: RSSArticle;
  analysisResult?: AnalysisResult;
  isSelected?: boolean;
  onToggleSelection: (id: string) => void;
  onAnalyze?: (id: string) => void;
  className?: string;
}

export default function ArticleCard({
  article,
  analysisResult,
  isSelected = false,
  onToggleSelection,
  onAnalyze,
  className = ''
}: ArticleCardProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getRelevanceColor = (score?: number) => {
    if (!score) return 'text-gray-500 bg-gray-100';
    if (score >= 0.7) return 'text-green-700 bg-green-100';
    if (score >= 0.5) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const getImpactColor = (level?: string) => {
    switch (level) {
      case 'high':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-700 bg-green-100 border-green-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className={`article-card border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors ${
      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
    } ${className}`}>
      <div className="flex items-start space-x-3">
        {/* Selection Checkbox */}
        <div className="flex-shrink-0 mt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(article.id)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        {/* Article Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Metadata */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 leading-tight">
              {article.title}
            </h3>
            
            <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
              {/* Relevance Score */}
              {article.relevanceScore !== undefined && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelevanceColor(article.relevanceScore)}`}>
                  {Math.round(article.relevanceScore * 100)}%
                </span>
              )}
              
              {/* Analysis Status */}
              {analysisResult ? (
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(analysisResult.impactLevel)}`}>
                  {analysisResult.impactLevel.toUpperCase()}
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
                  Not Analyzed
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
            {truncateText(article.description, 200)}
          </p>

          {/* Metadata Row */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <span>{formatDate(article.pubDate)}</span>
              {article.author && (
                <>
                  <span>•</span>
                  <span>By {article.author}</span>
                </>
              )}
              {article.category && article.category.length > 0 && (
                <>
                  <span>•</span>
                  <span>{article.category[0]}</span>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* External Link */}
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Read Full</span>
              </a>
              
              {/* Analyze Button */}
              {onAnalyze && !analysisResult && (
                <button
                  onClick={() => onAnalyze(article.id)}
                  className="text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Analyze</span>
                </button>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  AI Analysis Results
                </h4>
                <span className="text-xs text-gray-500">
                  Confidence: {Math.round(analysisResult.confidence * 100)}%
                </span>
              </div>
              
              <div className="space-y-2">
                {/* Companies and Industries */}
                {(analysisResult.companies.length > 0 || analysisResult.industries.length > 0) && (
                  <div className="flex flex-wrap gap-1">
                    {analysisResult.companies.map((company, index) => (
                      <span key={`company-${index}`} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        🏢 {company}
                      </span>
                    ))}
                    {analysisResult.industries.map((industry, index) => (
                      <span key={`industry-${index}`} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        🏭 {industry}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Jobs Affected */}
                {analysisResult.jobsAffected && (
                  <div className="text-xs text-red-600 font-medium">
                    📊 ~{analysisResult.jobsAffected.toLocaleString()} jobs affected
                  </div>
                )}
                
                {/* AI/Automation Tags */}
                <div className="flex items-center space-x-2">
                  {analysisResult.isAIRelated && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      🤖 AI-Related
                    </span>
                  )}
                  {analysisResult.isAutomationRelated && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                      ⚙️ Automation
                    </span>
                  )}
                </div>
                
                {/* Key Insights */}
                {analysisResult.keyInsights.length > 0 && (
                  <div className="text-xs text-gray-700">
                    <div className="font-medium mb-1">Key Insights:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {analysisResult.keyInsights.slice(0, 2).map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}