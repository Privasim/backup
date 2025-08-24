'use client';

import React from 'react';
import { ImplementationAlignment, MarketingStrategy } from '../types';
import { ImplementationPlan } from '@/features/implementation-plan/types';
import { 
  ClockIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ImplementationTimelineSectionProps {
  implementationPlan?: ImplementationPlan;
  marketingStrategies: MarketingStrategy[];
  alignment?: ImplementationAlignment;
  className?: string;
}

export function ImplementationTimelineSection({
  implementationPlan,
  marketingStrategies,
  alignment,
  className = ''
}: ImplementationTimelineSectionProps) {

  // Empty state when no implementation plan
  const EmptyState = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <CalendarDaysIcon className="w-6 h-6 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Implementation Plan Available
      </h3>
      <p className="text-gray-600 max-w-md mx-auto mb-4">
        Create an implementation plan in the List tab to see how your marketing activities 
        align with your development phases and milestones.
      </p>
      <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        <PlayCircleIcon className="w-4 h-4 mr-2" />
        Go to Implementation Plan
      </button>
    </div>
  );

  // Timeline item component
  const TimelineItem = ({ 
    phase, 
    isActive = false, 
    isCompleted = false 
  }: { 
    phase: any; 
    isActive?: boolean; 
    isCompleted?: boolean; 
  }) => (
    <div className="relative">
      {/* Timeline connector */}
      <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200" />
      
      <div className="relative flex items-start space-x-4">
        {/* Timeline dot */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isCompleted 
            ? 'bg-green-100 text-green-600' 
            : isActive 
            ? 'bg-blue-100 text-blue-600' 
            : 'bg-gray-100 text-gray-400'
        }`}>
          {isCompleted ? (
            <CheckCircleIcon className="w-5 h-5" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-current" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pb-8">
          <div className={`rounded-lg border p-4 ${
            isActive 
              ? 'bg-blue-50 border-blue-200' 
              : isCompleted 
              ? 'bg-green-50 border-green-200' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900">
                {phase.phaseName}
              </h4>
              {phase.duration && (
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                  {phase.duration}
                </span>
              )}
            </div>

            {/* Marketing Activities */}
            {phase.marketingActivities && phase.marketingActivities.length > 0 && (
              <div className="mb-3">
                <h5 className="text-xs font-medium text-gray-700 mb-1">Marketing Activities</h5>
                <div className="space-y-1">
                  {phase.marketingActivities.map((activity: string, index: number) => (
                    <div key={index} className="flex items-center text-xs text-gray-600">
                      <ArrowRightIcon className="w-3 h-3 mr-1 text-gray-400" />
                      {activity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Milestones */}
            {phase.milestones && phase.milestones.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-1">Key Milestones</h5>
                <div className="space-y-1">
                  {phase.milestones.map((milestone: string, index: number) => (
                    <div key={index} className="flex items-center text-xs text-gray-600">
                      <CheckCircleIcon className="w-3 h-3 mr-1 text-gray-400" />
                      {milestone}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Generate marketing timeline from strategies if no alignment exists
  const generateMarketingTimeline = () => {
    if (!marketingStrategies.length) return [];

    const phases = [
      {
        phaseId: 'planning',
        phaseName: 'Planning & Research',
        marketingActivities: [
          'Market research and competitor analysis',
          'Brand identity development',
          'Content strategy planning'
        ],
        milestones: ['Brand guidelines complete', 'Content calendar created']
      },
      {
        phaseId: 'preparation',
        phaseName: 'Marketing Preparation',
        marketingActivities: [
          'Website and landing pages setup',
          'Social media profiles creation',
          'Initial content production'
        ],
        milestones: ['Marketing assets ready', 'Analytics setup complete']
      },
      {
        phaseId: 'launch',
        phaseName: 'Launch Campaign',
        marketingActivities: [
          'Launch campaign execution',
          'PR and media outreach',
          'Influencer partnerships'
        ],
        milestones: ['Launch announcement', 'First customer acquisition']
      },
      {
        phaseId: 'growth',
        phaseName: 'Growth & Optimization',
        marketingActivities: [
          'Performance optimization',
          'A/B testing campaigns',
          'Customer feedback integration'
        ],
        milestones: ['Growth targets met', 'Customer retention improved']
      }
    ];

    return phases;
  };

  const timelinePhases = alignment?.alignedPhases || generateMarketingTimeline();
  const currentPhaseIndex = 0; // Could be determined by implementation plan status

  // Calculate progress
  const completedPhases = timelinePhases.slice(0, currentPhaseIndex);
  const progressPercentage = timelinePhases.length > 0 
    ? Math.round((completedPhases.length / timelinePhases.length) * 100) 
    : 0;

  if (!implementationPlan && marketingStrategies.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <CalendarDaysIcon className="w-6 h-6 mr-2 text-blue-600" />
            Implementation Timeline
          </h2>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <CalendarDaysIcon className="w-6 h-6 mr-2 text-blue-600" />
            Implementation Timeline
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {implementationPlan 
              ? 'Marketing activities aligned with your implementation plan'
              : 'Suggested marketing timeline for your business launch'
            }
          </p>
        </div>

        {timelinePhases.length > 0 && (
          <div className="text-right">
            <div className="text-sm text-gray-600">Progress</div>
            <div className="flex items-center space-x-2">
              <div className="text-lg font-semibold text-gray-900">
                {completedPhases.length}/{timelinePhases.length}
              </div>
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-sm text-gray-600">
                {progressPercentage}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Implementation Plan Info */}
      {implementationPlan && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Linked to Implementation Plan: {implementationPlan.meta.title}
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Marketing activities are automatically aligned with your development phases and milestones.
              </p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
                <span>📅 Created: {new Date(implementationPlan.meta.createdAt).toLocaleDateString()}</span>
                <span>🎯 Goals: {implementationPlan.overview.goals.length}</span>
                <span>📋 Phases: {implementationPlan.phases.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-0">
          {timelinePhases.map((phase, index) => (
            <TimelineItem
              key={phase.phaseId}
              phase={phase}
              isActive={index === currentPhaseIndex}
              isCompleted={index < currentPhaseIndex}
            />
          ))}
        </div>
      </div>

      {/* Marketing Strategy Integration */}
      {marketingStrategies.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Marketing Strategy Integration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketingStrategies.map((strategy) => (
              <div key={strategy.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{strategy.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    strategy.completed 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {strategy.completed ? 'Completed' : strategy.timeframe}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{strategy.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Priority: {strategy.priority}/10</span>
                  <span className="text-gray-500">{strategy.estimatedCost}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Recommendations */}
          <div className="mt-6 space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">
                🚀 Next Steps
              </h4>
              <p className="text-sm text-blue-800">
                {currentPhaseIndex === 0 
                  ? "Start with market research and brand development to establish a strong foundation."
                  : currentPhaseIndex === 1
                  ? "Focus on preparing your marketing assets and setting up tracking systems."
                  : currentPhaseIndex === 2
                  ? "Execute your launch campaign and monitor initial customer response."
                  : "Optimize your marketing performance based on data and customer feedback."
                }
              </p>
            </div>

            {!implementationPlan && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-1 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  Recommendation
                </h4>
                <p className="text-sm text-yellow-800">
                  Create a detailed implementation plan to get more precise timeline alignment 
                  and better coordination between development and marketing activities.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}