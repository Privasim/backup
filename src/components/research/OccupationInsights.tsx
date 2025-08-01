'use client';

import React, { useState } from 'react';
import { OccupationRisk } from '@/lib/research/service';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export interface OccupationInsightsProps {
  occupationRisk: OccupationRisk;
  recommendations?: string[];
  className?: string;
}

export function OccupationInsights({
  occupationRisk,
  recommendations = [],
  className = '',
}: OccupationInsightsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const { occupation, riskLevel, percentile, similarOccupations } = occupationRisk;

  const getRiskColor = (risk: number): string => {
    if (risk >= 0.8) return 'text-red-600 bg-red-50';
    if (risk >= 0.6) return 'text-orange-600 bg-orange-50';
    if (risk >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getRiskBorderColor = (risk: number): string => {
    if (risk >= 0.8) return 'border-red-200';
    if (risk >= 0.6) return 'border-orange-200';
    if (risk >= 0.4) return 'border-yellow-200';
    return 'border-green-200';
  };

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${getRiskBorderColor(occupation.riskScore)}`}>
              <div className="text-sm text-gray-600 mb-1">Risk Score</div>
              <div className={`text-2xl font-bold ${getRiskColor(occupation.riskScore).split(' ')[0]}`}>
                {(occupation.riskScore * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
              <div className="text-sm text-gray-600 mb-1">Risk Level</div>
              <div className="text-2xl font-bold text-blue-600 capitalize">
                {riskLevel.replace('_', ' ')}
              </div>
            </div>
            
            <div className="p-4 rounded-lg border border-purple-200 bg-purple-50">
              <div className="text-sm text-gray-600 mb-1">Percentile</div>
              <div className="text-2xl font-bold text-purple-600">
                {percentile}th
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">SOC Code</div>
            <div className="font-mono text-lg font-semibold text-gray-800">
              {occupation.code}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'tasks',
      title: 'Key Tasks at Risk',
      content: (
        <div className="space-y-3">
          {occupation.keyTasks.map((task, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-semibold">
                {index + 1}
              </div>
              <div className="text-gray-700">{task}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'similar',
      title: 'Similar Occupations',
      content: (
        <div className="space-y-3">
          {similarOccupations.length > 0 ? (
            similarOccupations.map((similar, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">{similar.name}</div>
                  <div className="text-sm text-gray-600">SOC: {similar.code}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${getRiskColor(similar.riskScore).split(' ')[0]}`}>
                    {(similar.riskScore * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">risk</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-4">
              No similar occupations found
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      content: (
        <div className="space-y-3">
          {recommendations.length > 0 ? (
            recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  !
                </div>
                <div className="text-gray-700">{recommendation}</div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-4">
              No specific recommendations available
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {occupation.name}
        </h2>
        <p className="text-gray-600">
          Detailed analysis of AI exposure risk and career insights
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          
          return (
            <div key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {section.title}
                  </h3>
                  {isExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>
              
              {isExpanded && (
                <div className="px-6 pb-6">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OccupationInsights;