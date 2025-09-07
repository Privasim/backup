'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import type { VisualizationProps } from './visualizationRegistry';
import ReactMarkdown from 'react-markdown';

// Timeline item interface
interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  content: string;
  type: 'phase' | 'milestone' | 'task';
  status: 'upcoming' | 'current' | 'completed';
  duration?: string;
  startDate?: string;
  endDate?: string;
  dependencies?: string[];
}

// Parse plan content into timeline items
const parsePlanContent = (content: string): TimelineItem[] => {
  if (!content) return [];

  const lines = content.split('\n');
  const items: TimelineItem[] = [];
  let currentPhase: TimelineItem | null = null;
  let currentContent: string[] = [];
  let itemId = 0;

  const commitCurrentPhase = () => {
    if (currentPhase) {
      currentPhase.content = currentContent.join('\n').trim();
      currentContent = [];
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    // Preserve blank lines inside a phase for Markdown paragraph separation
    if (trimmed.length === 0) {
      if (currentPhase) currentContent.push('');
      continue;
    }

    // Phase headers: support markdown H1/H2 and plain 'Phase N - Name' lines
    const mdHeaderMatch = trimmed.match(/^#{1,2}\s+(.+)/);
    const plainPhaseMatch = trimmed.match(/^Phase\s+([1-3])\s*[-:]\s+(.+)$/i);

    if (mdHeaderMatch) {
      const titleText = trimmed.replace(/^#{1,2}\s+/, '');
      const lower = titleText.toLowerCase();
      if (lower.includes('phase') || lower.includes('stage') || lower.includes('step')) {
        // Finalize previous phase
        commitCurrentPhase();
        // Start new phase; we don't include the header itself in content to avoid duplication
        currentPhase = {
          id: `phase-${itemId++}`,
          title: titleText,
          content: '',
          type: 'phase',
          status: itemId === 1 ? 'current' : 'upcoming',
        };
        items.push(currentPhase);
        continue;
      }
    } else if (plainPhaseMatch) {
      const n = plainPhaseMatch[1];
      const name = plainPhaseMatch[2].trim();
      const titleText = `Phase ${n}: ${name}`;
      // Finalize previous phase
      commitCurrentPhase();
      currentPhase = {
        id: `phase-${itemId++}`,
        title: titleText,
        content: '',
        type: 'phase',
        status: itemId === 1 ? 'current' : 'upcoming',
      };
      items.push(currentPhase);
      continue;
    }

    // Accumulate any other lines under the current phase
    if (currentPhase) {
      currentContent.push(rawLine);
      continue;
    }
  }

  // Finalize last phase content
  commitCurrentPhase();

  // If no phases were found, create a default structure using paragraph sections
  if (items.length === 0) {
    const sections = content.split(/\n\s*\n/);
    sections.forEach((section, index) => {
      if (section.trim()) {
        const secLines = section.trim().split('\n');
        const title = secLines[0].replace(/^#{1,6}\s*/, '') || `Section ${index + 1}`;
        items.push({
          id: `section-${index}`,
          title,
          content: section.trim(),
          type: 'phase',
          status: index === 0 ? 'current' : 'upcoming',
        });
      }
    });
  }

  return items;
};

// Timeline item component
const TimelineItemComponent: React.FC<{
  item: TimelineItem;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}> = React.memo(({ item, isExpanded, onToggle, isLast }) => {
  const getStatusIcon = () => {
    switch (item.status) {
      case 'completed':
        return <CheckCircleIcon className="h-3 w-3 text-green-600" />;
      case 'current':
        return <PlayCircleIcon className="h-3 w-3 text-blue-600" />;
      default:
        return <ClockIcon className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (item.status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'current':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'phase':
        return 'bg-purple-100 text-purple-800';
      case 'milestone':
        return 'bg-blue-100 text-blue-800';
      case 'task':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-2.5 top-5 w-px h-full bg-gray-100"></div>
      )}
      
      {/* Timeline item */}
      <div className="flex items-start space-x-2">
        {/* Status indicator */}
        <div className={`flex-shrink-0 w-4 h-4 mt-0.5 rounded-full flex items-center justify-center ${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div 
            className="cursor-pointer group"
            onClick={onToggle}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <h3 className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight truncate">
                  {item.title}
                </h3>
                <span className={`px-1.5 py-px text-[8px] font-medium rounded-md capitalize border border-current/20 ${getTypeColor()}`}>
                  {item.type}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {item.duration && (
                  <span className="text-[10px] text-gray-500 flex items-center">
                    <CalendarIcon className="h-2.5 w-2.5 mr-1" />
                    {item.duration}
                  </span>
                )}
                {isExpanded ? (
                  <ChevronDownIcon className="h-3 w-3 text-gray-400" />
                ) : (
                  <ChevronRightIcon className="h-3 w-3 text-gray-400" />
                )}
              </div>
            </div>
            
            {item.description && (
              <p className="text-sm text-gray-600 mt-1">
                {item.description}
              </p>
            )}
          </div>
          
          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-2 rounded-md border border-slate-200/70 bg-slate-50 p-3">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h4 className="text-xs font-semibold text-slate-900 mt-2 mb-2" {...props} />,
                  h2: ({ node, ...props }) => <h5 className="text-[11px] font-semibold text-slate-900 mt-2 mb-2" {...props} />,
                  h3: ({ node, ...props }) => <h6 className="text-[11px] font-semibold text-slate-900 mt-2 mb-2" {...props} />,
                  p: ({ node, ...props }) => {
                    const text = String(props.children || '');
                    
                    // Style phase metadata lines (Timeline:, Tools:, Channels:, Description:)
                    if (text.match(/^(Timeline|Tools|Channels|Description):/i)) {
                      const parts = text.split(':');
                      const label = parts[0].trim();
                      const value = parts.slice(1).join(':').trim();
                      
                      return (
                        <div className="flex mb-3 last:mb-1 text-[11px] leading-5">
                          <span className="font-bold text-slate-800 min-w-[90px] flex-shrink-0">{label}:</span>
                          <span className="text-slate-700">{value}</span>
                        </div>
                      );
                    }
                    
                    // Default paragraph style
                    return <p className="text-[11px] text-slate-700 leading-5 mb-3 last:mb-1" {...props} />;
                  },
                  ul: ({ node, ...props }) => <ul className="ml-4 list-disc space-y-1.5 mb-3" {...props} />,
                  ol: ({ node, ...props }) => <ol className="ml-4 list-decimal space-y-1.5 mb-3" {...props} />,
                  li: ({ node, ...props }) => <li className="text-[11px] text-slate-700 leading-5" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-semibold text-slate-900" {...props} />,
                  em: ({ node, ...props }) => <em className="italic text-slate-700" {...props} />,
                  code: (props) => (
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">{props.children as any}</code>
                  ),
                }}
              >
                {item.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TimelineItemComponent.displayName = 'TimelineItemComponent';

// Main VerticalTimeline component
export const VerticalTimeline: React.FC<VisualizationProps> = React.memo(({
  planContent,
  planData,
  isLoading,
  onError,
  className = '',
}) => {
  // Parse timeline items from content
  const timelineItems = useMemo(() => {
    try {
      return parsePlanContent(planContent || '');
    } catch (error) {
      console.error('Error parsing plan content for timeline:', error);
      onError?.(error as Error);
      return [];
    }
  }, [planContent, onError]);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Toggle item expansion
  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Set all items expanded by default when timelineItems changes
  useEffect(() => {
    if (timelineItems.length > 0) {
      setExpandedItems(new Set(timelineItems.map(item => item.id)));
    }
  }, [timelineItems]);


  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-8 ${className}`}>
        <div className="space-y-4 w-full max-w-md">
          <div className="animate-pulse">
            <div className="h-6 bg-gradient-to-r from-purple-200 to-blue-300 rounded-lg w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-purple-200 rounded w-full"></div>
              <div className="h-3 bg-purple-200 rounded w-5/6"></div>
              <div className="h-3 bg-purple-200 rounded w-4/6"></div>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-slate-900 mb-1">Building Your Timeline</h3>
            <p className="text-[10px] text-slate-600">Parsing implementation plan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!planContent || timelineItems.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full text-center p-8 ${className}`}>
        <div className="rounded-full bg-purple-50 p-4 mb-4">
          <ClockIcon className="h-8 w-8 text-purple-500 mb-2" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">No Timeline Data</h3>
        <p className="text-xs text-gray-600 mb-3 max-w-md">
          Generate an implementation plan to see it visualized as a timeline with phases and milestones.
        </p>
      </div>
    );
  }

  return (
    <div className={`h-full ${className}`}>
      <div className="bg-white h-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Timeline</h2>
              <p className="text-[9px] text-gray-500">{timelineItems.length} items</p>
            </div>
          </div>
        </div>
        
        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="space-y-3">
            {timelineItems.map((item, index) => (
              <TimelineItemComponent
                key={item.id}
                item={item}
                isExpanded={expandedItems.has(item.id)}
                onToggle={() => toggleItem(item.id)}
                isLast={index === timelineItems.length - 1}
              />
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
                <span>Upcoming</span>
              </div>
            </div>
            <div>
              Timeline View • {expandedItems.size} of {timelineItems.length} expanded
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

VerticalTimeline.displayName = 'VerticalTimeline';

export default VerticalTimeline;