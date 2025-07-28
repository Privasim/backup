'use client';

import { useState, useEffect } from 'react';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  impact: 'Low' | 'Medium' | 'High';
  probability: number;
}

interface TimelineChartProps {
  jobRole: string;
  industry: string;
  animated?: boolean;
}

export default function TimelineChart({ jobRole, industry, animated = true }: TimelineChartProps) {
  const [visibleEvents, setVisibleEvents] = useState<number>(0);

  // Generate timeline events based on job role and industry
  const generateTimeline = (): TimelineEvent[] => {
    const currentYear = new Date().getFullYear();
    
    return [
      {
        year: `${currentYear}`,
        title: 'Current State',
        description: `${jobRole} roles are stable with emerging AI tools being adopted gradually`,
        impact: 'Low',
        probability: 95
      },
      {
        year: `${currentYear + 1}-${currentYear + 2}`,
        title: 'AI Tool Integration',
        description: `Widespread adoption of AI assistants and automation tools in ${industry}`,
        impact: 'Medium',
        probability: 85
      },
      {
        year: `${currentYear + 3}-${currentYear + 5}`,
        title: 'Workflow Transformation',
        description: `Significant changes in daily workflows, with AI handling routine tasks`,
        impact: 'Medium',
        probability: 70
      },
      {
        year: `${currentYear + 5}-${currentYear + 8}`,
        title: 'Role Evolution',
        description: `${jobRole} roles evolve to focus on AI collaboration and strategic oversight`,
        impact: 'High',
        probability: 60
      },
      {
        year: `${currentYear + 8}+`,
        title: 'New Paradigm',
        description: `Fully integrated AI-human collaboration becomes the standard in ${industry}`,
        impact: 'High',
        probability: 45
      }
    ];
  };

  const timelineEvents = generateTimeline();

  useEffect(() => {
    if (animated) {
      const timer = setInterval(() => {
        setVisibleEvents(prev => {
          if (prev < timelineEvents.length) {
            return prev + 1;
          }
          clearInterval(timer);
          return prev;
        });
      }, 600);
      return () => clearInterval(timer);
    } else {
      setVisibleEvents(timelineEvents.length);
    }
  }, [animated, timelineEvents.length]);

  const getImpactColor = (impact: 'Low' | 'Medium' | 'High') => {
    switch (impact) {
      case 'Low': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'High': return 'bg-red-500';
    }
  };

  const getImpactBorderColor = (impact: 'Low' | 'Medium' | 'High') => {
    switch (impact) {
      case 'Low': return 'border-green-200 bg-green-50';
      case 'Medium': return 'border-yellow-200 bg-yellow-50';
      case 'High': return 'border-red-200 bg-red-50';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
      
      <div className="space-y-8">
        {timelineEvents.map((event, index) => (
          <div
            key={index}
            className={`relative flex items-start space-x-6 transition-all duration-700 ${
              index < visibleEvents ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            {/* Timeline dot */}
            <div className="relative z-10 flex-shrink-0">
              <div className={`w-4 h-4 rounded-full ${getImpactColor(event.impact)} border-4 border-white shadow-lg`}></div>
            </div>
            
            {/* Event content */}
            <div className={`flex-1 p-4 rounded-lg border-2 ${getImpactBorderColor(event.impact)}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{event.title}</h4>
                  <p className="text-sm font-medium text-gray-600">{event.year}</p>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${getProbabilityColor(event.probability)}`}>
                    {event.probability}%
                  </div>
                  <div className="text-xs text-gray-500">Probability</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">{event.description}</p>
              
              {/* Impact indicator */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-600">Impact Level:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  event.impact === 'Low' ? 'bg-green-100 text-green-800' :
                  event.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {event.impact}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Timeline summary */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-semibold text-blue-900 mb-2">Timeline Insights</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">2-3 Years</div>
            <div className="text-blue-700">Significant AI Integration</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">5-8 Years</div>
            <div className="text-blue-700">Role Transformation</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">8+ Years</div>
            <div className="text-blue-700">New Work Paradigm</div>
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-3 text-center">
          Predictions based on current AI advancement trends and industry analysis
        </p>
      </div>
    </div>
  );
}