'use client';

import React, { useState } from 'react';
import { GoToMarketStrategies } from '../types';
import { MarketingStrategyCard } from './MarketingStrategyCard';
import { SalesChannelCard } from './SalesChannelCard';
import { PricingStrategyCard } from './PricingStrategyCard';
import { ExportControls } from './ExportControls';
import { MarkdownStrategyDisplay } from './MarkdownStrategyDisplay';

interface StrategyDisplayProps {
  strategies: GoToMarketStrategies;
  onUpdateStrategy: (type: 'marketing' | 'sales' | 'pricing', id: string, updates: any) => void;
  className?: string;
  rawMarkdown?: string;
  onUpdateMarkdown?: (markdown: string) => void;
  preferMarkdownView?: boolean;
}

type TabType = 'overview' | 'marketing' | 'sales' | 'pricing' | 'distribution' | 'timeline' | 'tools';

export const StrategyDisplay: React.FC<StrategyDisplayProps> = React.memo(({
  strategies,
  onUpdateStrategy,
  className = '',
  rawMarkdown,
  onUpdateMarkdown,
  preferMarkdownView = false
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Use markdown view if raw markdown is provided and preferred
  if (preferMarkdownView && rawMarkdown) {
    return (
      <MarkdownStrategyDisplay
        strategies={strategies}
        rawMarkdown={rawMarkdown}
        onUpdateMarkdown={onUpdateMarkdown}
        className={className}
      />
    );
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', count: null },
    { id: 'marketing' as TabType, label: 'Marketing', count: strategies.marketingStrategies.length },
    { id: 'sales' as TabType, label: 'Sales', count: strategies.salesChannels.length },
    { id: 'pricing' as TabType, label: 'Pricing', count: strategies.pricingStrategies.length },
    { id: 'distribution' as TabType, label: 'Distribution', count: strategies.distributionPlans.length },
    { id: 'timeline' as TabType, label: 'Timeline', count: strategies.implementationTimeline.length },
    { id: 'tools' as TabType, label: 'Tools', count: strategies.toolRecommendations.length }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Business Context */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Business Context</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Business Idea:</span>
                  <p className="text-blue-700 mt-1">{strategies.businessContext.businessIdea}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Target Market:</span>
                  <p className="text-blue-700 mt-1">{strategies.businessContext.targetMarket}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-blue-800">Value Proposition:</span>
                  <p className="text-blue-700 mt-1">{strategies.businessContext.valueProposition}</p>
                </div>
              </div>
            </div>

            {/* Strategy Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Marketing Strategies</h4>
                  <span className="text-2xl font-bold text-green-600">{strategies.marketingStrategies.length}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {strategies.marketingStrategies.filter(s => s.completed).length} completed
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Sales Channels</h4>
                  <span className="text-2xl font-bold text-blue-600">{strategies.salesChannels.length}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {strategies.salesChannels.filter(s => s.completed).length} completed
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Pricing Models</h4>
                  <span className="text-2xl font-bold text-purple-600">{strategies.pricingStrategies.length}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {strategies.pricingStrategies.filter(s => s.completed).length} completed
                </p>
              </div>
            </div>

            {/* Goals */}
            {strategies.businessContext.goals.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Key Goals</h4>
                <ul className="space-y-2">
                  {strategies.businessContext.goals.map((goal, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'marketing':
        return (
          <div className="space-y-4">
            {strategies.marketingStrategies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No marketing strategies generated
              </div>
            ) : (
              strategies.marketingStrategies.map(strategy => (
                <MarketingStrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  onUpdate={(updates) => onUpdateStrategy('marketing', strategy.id, updates)}
                />
              ))
            )}
          </div>
        );

      case 'sales':
        return (
          <div className="space-y-4">
            {strategies.salesChannels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No sales channels generated
              </div>
            ) : (
              strategies.salesChannels.map(channel => (
                <SalesChannelCard
                  key={channel.id}
                  channel={channel}
                  onUpdate={(updates) => onUpdateStrategy('sales', channel.id, updates)}
                />
              ))
            )}
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-4">
            {strategies.pricingStrategies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pricing strategies generated
              </div>
            ) : (
              strategies.pricingStrategies.map(pricing => (
                <PricingStrategyCard
                  key={pricing.id}
                  strategy={pricing}
                  onUpdate={(updates) => onUpdateStrategy('pricing', pricing.id, updates)}
                />
              ))
            )}
          </div>
        );

      case 'distribution':
        return (
          <div className="space-y-4">
            {strategies.distributionPlans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No distribution plans generated
              </div>
            ) : (
              strategies.distributionPlans.map((plan, index) => (
                <div key={plan.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">{plan.channel}</h4>
                  <p className="text-sm text-gray-600 mb-3">{plan.strategy}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium text-gray-700">Timeline:</span>
                      <span className="ml-2 text-gray-600">{plan.timeline}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Expected Outcome:</span>
                      <span className="ml-2 text-gray-600">{plan.expectedOutcome}</span>
                    </div>
                  </div>
                  {plan.resources.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs font-medium text-gray-700">Required Resources:</span>
                      <ul className="mt-1 text-xs text-gray-600 list-disc list-inside">
                        {plan.resources.map((resource, idx) => (
                          <li key={idx}>{resource}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-4">
            {strategies.implementationTimeline.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No timeline generated
              </div>
            ) : (
              strategies.implementationTimeline.map((phase, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">{phase.phase}</h4>
                    <span className="text-xs text-gray-500">{phase.startDate} - {phase.endDate}</span>
                  </div>
                  
                  {phase.activities.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-gray-700">Activities:</span>
                      <ul className="mt-1 text-xs text-gray-600 list-disc list-inside">
                        {phase.activities.map((activity, idx) => (
                          <li key={idx}>{activity}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {phase.milestones.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-gray-700">Milestones:</span>
                      <ul className="mt-1 text-xs text-gray-600 list-disc list-inside">
                        {phase.milestones.map((milestone, idx) => (
                          <li key={idx}>{milestone}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        );

      case 'tools':
        return (
          <div className="space-y-4">
            {strategies.toolRecommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tool recommendations generated
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategies.toolRecommendations.map(tool => (
                  <div key={tool.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{tool.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tool.implementationPriority === 'high' ? 'bg-red-100 text-red-700' :
                        tool.implementationPriority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {tool.implementationPriority}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="text-gray-900">{tool.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost:</span>
                        <span className="text-gray-900">{tool.costEstimate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Complexity:</span>
                        <span className="text-gray-900">{tool.integrationComplexity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Relevance:</span>
                        <span className="text-gray-900">{tool.relevanceScore}/100</span>
                      </div>
                    </div>
                    
                    {tool.recommendedFor.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs font-medium text-gray-700">Recommended for:</span>
                        <ul className="mt-1 text-xs text-gray-600 list-disc list-inside">
                          {tool.recommendedFor.map((use, idx) => (
                            <li key={idx}>{use}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Go-to-Market Strategy</h2>
          <p className="text-sm text-gray-600">
            Generated on {new Date(strategies.generatedAt).toLocaleDateString()}
          </p>
        </div>
        <ExportControls strategies={strategies} />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
});