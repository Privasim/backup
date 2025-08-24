'use client';

import React from 'react';
import { useGoToMarketV2 } from '@/features/gotomarket-v2/hooks/useGoToMarketV2';
import { GoToMarketV2Generator } from '@/features/gotomarket-v2/components/GoToMarketV2Generator';
import { StrategyDisplay } from '@/features/gotomarket-v2/components/StrategyDisplay';
import { GoToMarketErrorBoundary } from '@/features/gotomarket-v2/components/ErrorBoundary';

export default function GoToMarketV2Content() {
  const {
    strategies,
    status,
    updateStrategy,
    importStrategies,
    rawMarkdown,
    preferMarkdownView,
    updateMarkdown
  } = useGoToMarketV2();

  return (
    <GoToMarketErrorBoundary>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Go-to-Market Strategy (V2)</h1>
          <p className="text-gray-600">
            Generate comprehensive go-to-market strategies based on your implementation plan using AI.
          </p>
        </div>

        {/* Generator Section */}
        <div className="mb-8">
          <GoToMarketV2Generator />
        </div>

        {/* Strategy Display Section */}
        {strategies && status === 'success' && (
          <StrategyDisplay
            strategies={strategies}
            onUpdateStrategy={updateStrategy}
            rawMarkdown={rawMarkdown}
            onUpdateMarkdown={updateMarkdown}
            preferMarkdownView={preferMarkdownView}
          />
        )}
      </div>
    </GoToMarketErrorBoundary>
  );
}
