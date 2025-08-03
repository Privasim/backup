'use client';

import React, { useState, useEffect } from 'react';
import { debugLog } from '@/components/debug/DebugConsole';

interface JobLossEvent {
  id: string;
  company: string;
  industry: string;
  layoffCount: number;
  date: string;
  reason: string;
  source: string;
  aiRelated: boolean;
  automationRelated: boolean;
  location?: string;
  severity: 'low' | 'medium' | 'high';
}

interface JobLossFeedProps {
  className?: string;
}

// Mock data for demonstration - in production this would come from an API
const mockJobLossEvents: JobLossEvent[] = [
  {
    id: '1',
    company: 'TechCorp',
    industry: 'Technology',
    layoffCount: 1200,
    date: '2025-01-15',
    reason: 'AI automation replacing customer service roles',
    source: 'TechCrunch',
    aiRelated: true,
    automationRelated: true,
    location: 'San Francisco, CA',
    severity: 'high'
  },
  {
    id: '2',
    company: 'MediaGiant',
    industry: 'Media & Entertainment',
    layoffCount: 800,
    date: '2025-01-10',
    reason: 'AI content generation reducing need for writers and editors',
    source: 'Reuters',
    aiRelated: true,
    automationRelated: false,
    location: 'New York, NY',
    severity: 'high'
  },
  {
    id: '3',
    company: 'RetailChain',
    industry: 'Retail',
    layoffCount: 450,
    date: '2025-01-08',
    reason: 'Automated checkout systems and inventory management',
    source: 'Wall Street Journal',
    aiRelated: false,
    automationRelated: true,
    location: 'Multiple locations',
    severity: 'medium'
  },
  {
    id: '4',
    company: 'FinanceInc',
    industry: 'Financial Services',
    layoffCount: 300,
    date: '2025-01-05',
    reason: 'AI-powered trading algorithms and robo-advisors',
    source: 'Bloomberg',
    aiRelated: true,
    automationRelated: true,
    location: 'Chicago, IL',
    severity: 'medium'
  },
  {
    id: '5',
    company: 'ManufacturingCo',
    industry: 'Manufacturing',
    layoffCount: 600,
    date: '2025-01-03',
    reason: 'Robotic assembly lines and quality control systems',
    source: 'Industry Week',
    aiRelated: false,
    automationRelated: true,
    location: 'Detroit, MI',
    severity: 'medium'
  },
  {
    id: '6',
    company: 'LogisticsPro',
    industry: 'Transportation & Logistics',
    layoffCount: 350,
    date: '2025-01-02',
    reason: 'Autonomous vehicles and AI route optimization',
    source: 'Transport Topics',
    aiRelated: true,
    automationRelated: true,
    location: 'Atlanta, GA',
    severity: 'medium'
  },
  {
    id: '7',
    company: 'HealthSystem',
    industry: 'Healthcare',
    layoffCount: 200,
    date: '2024-12-28',
    reason: 'AI diagnostic tools reducing need for radiologists',
    source: 'Modern Healthcare',
    aiRelated: true,
    automationRelated: false,
    location: 'Boston, MA',
    severity: 'low'
  },
  {
    id: '8',
    company: 'EnergyGiant',
    industry: 'Energy',
    layoffCount: 750,
    date: '2024-12-20',
    reason: 'Smart grid automation and predictive maintenance AI',
    source: 'Energy News',
    aiRelated: true,
    automationRelated: true,
    location: 'Houston, TX',
    severity: 'high'
  }
];

export default function JobLossFeed({ className = '' }: JobLossFeedProps) {
  const [events, setEvents] = useState<JobLossEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ai' | 'automation'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'count'>('date');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const loadEvents = async () => {
      setIsLoading(true);
      debugLog.info('JobLossFeed', 'Loading job loss events...');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEvents(mockJobLossEvents);
      setIsLoading(false);
      
      debugLog.success('JobLossFeed', 'Job loss events loaded', {
        eventCount: mockJobLossEvents.length,
        aiRelated: mockJobLossEvents.filter(e => e.aiRelated).length,
        automationRelated: mockJobLossEvents.filter(e => e.automationRelated).length
      });
    };

    loadEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesFilter = (() => {
      switch (filter) {
        case 'ai':
          return event.aiRelated;
        case 'automation':
          return event.automationRelated;
        default:
          return true;
      }
    })();
    
    const matchesIndustry = selectedIndustry === 'all' || event.industry === selectedIndustry;
    
    return matchesFilter && matchesIndustry;
  });

  const industries = ['all', ...Array.from(new Set(events.map(e => e.industry)))];

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'severity':
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      case 'count':
        return b.layoffCount - a.layoffCount;
      default:
        return 0;
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className={`job-loss-feed ${className}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Job Loss Feed</h2>
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading latest events...</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`job-loss-feed ${className}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Job Loss Feed</h2>
              <p className="text-sm text-gray-600 mt-1">
                Real-time tracking of AI and automation-related job losses
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Filter Controls */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Type:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'ai' | 'automation')}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Events</option>
                <option value="ai">AI-Related</option>
                <option value="automation">Automation-Related</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Industry:</label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {industries.map(industry => (
                  <option key={industry} value={industry}>
                    {industry === 'all' ? 'All Industries' : industry}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'severity' | 'count')}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Latest First</option>
                <option value="severity">By Severity</option>
                <option value="count">By Impact</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-700">
              {events.reduce((sum, event) => sum + event.layoffCount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-red-600">Total Jobs Lost</div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-700">
              {events.filter(e => e.aiRelated).length}
            </div>
            <div className="text-sm text-blue-600">AI-Related Events</div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-700">
              {events.filter(e => e.automationRelated).length}
            </div>
            <div className="text-sm text-purple-600">Automation Events</div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-700">
              {new Set(events.map(e => e.industry)).size}
            </div>
            <div className="text-sm text-gray-600">Industries Affected</div>
          </div>
        </div>

        {/* Events List */}
        <div className={`space-y-4 overflow-y-auto transition-all duration-300 ${
          isExpanded ? 'max-h-96' : 'max-h-48'
        }`}>
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{event.company}</h3>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{event.industry}</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                      {event.severity.toUpperCase()}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">{event.reason}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="font-medium text-red-600">
                      {event.layoffCount.toLocaleString()} jobs affected
                    </span>
                    {event.location && (
                      <>
                        <span>•</span>
                        <span>{event.location}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{formatDate(event.date)}</span>
                    <span>•</span>
                    <span>Source: {event.source}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-1 ml-4">
                  {event.aiRelated && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      AI
                    </span>
                  )}
                  {event.automationRelated && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      Automation
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedEvents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium">No events match your current filter</p>
            <p className="text-sm mt-1">Try adjusting your filter settings</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {sortedEvents.length} of {events.length} events
            </span>
            <span>
              Last updated: {new Date().toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}