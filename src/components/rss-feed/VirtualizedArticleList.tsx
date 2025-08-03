'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RSSArticle, AnalysisResult } from '@/lib/rss/types';
import ArticleCard from './ArticleCard';

interface VirtualizedArticleListProps {
  articles: RSSArticle[];
  analysisResults: Record<string, AnalysisResult>;
  selectedArticles: string[];
  onToggleSelection: (id: string) => void;
  maxHeight?: string;
  itemHeight?: number;
  className?: string;
}

export default function VirtualizedArticleList({
  articles,
  analysisResults,
  selectedArticles,
  onToggleSelection,
  maxHeight = 'max-h-96',
  itemHeight = 200, // Estimated height per article card
  className = ''
}: VirtualizedArticleListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update container height when ref changes
  useEffect(() => {
    if (containerRef.current) {
      const height = containerRef.current.clientHeight;
      setContainerHeight(height);
    }
  }, []);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      articles.length
    );
    
    return {
      start: Math.max(0, startIndex - 1), // Add buffer
      end: Math.min(articles.length, endIndex + 1) // Add buffer
    };
  }, [scrollTop, containerHeight, itemHeight, articles.length]);

  // Get visible articles
  const visibleArticles = useMemo(() => {
    return articles.slice(visibleRange.start, visibleRange.end);
  }, [articles, visibleRange]);

  // Handle scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Calculate total height and offset
  const totalHeight = articles.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  // If we have fewer than 20 articles, don't virtualize
  if (articles.length <= 20) {
    return (
      <div className={`space-y-4 overflow-y-auto transition-all duration-300 ${maxHeight} ${className}`}>
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            analysisResult={analysisResults[article.id]}
            isSelected={selectedArticles.includes(article.id)}
            onToggleSelection={onToggleSelection}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto transition-all duration-300 ${maxHeight} ${className}`}
      onScroll={handleScroll}
      style={{ height: containerHeight }}
    >
      {/* Virtual container with total height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <div className="space-y-4">
            {visibleArticles.map((article, index) => (
              <div
                key={article.id}
                style={{ minHeight: itemHeight }}
              >
                <ArticleCard
                  article={article}
                  analysisResult={analysisResults[article.id]}
                  isSelected={selectedArticles.includes(article.id)}
                  onToggleSelection={onToggleSelection}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Loading indicator for bottom */}
      {visibleRange.end < articles.length && (
        <div className="flex items-center justify-center py-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading more articles...</span>
          </div>
        </div>
      )}
    </div>
  );
}