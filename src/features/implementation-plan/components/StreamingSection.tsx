"use client";

import React from 'react';
import type { ProcessedSection } from '../streaming/types';

interface StreamingSectionProps {
  section: ProcessedSection;
  isCurrentPhase: boolean;
}

export const StreamingSection: React.FC<StreamingSectionProps> = ({
  section,
  isCurrentPhase
}) => {
  const getSectionIcon = () => {
    const icons = {
      'overview': '🎯',
      'phases': '📋',
      'tasks': '✅',
      'timeline': '📅',
      'resources': '👥',
      'budget': '💰',
      'risks': '⚠️',
      'kpis': '📊',
      'next90days': '🗓️'
    };
    return icons[section.type as keyof typeof icons] || '📝';
  };

  const getStatusIcon = () => {
    if (section.isComplete) {
      return <span className="text-green-500">✓</span>;
    }
    if (isCurrentPhase) {
      return (
        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      );
    }
    return <span className="text-gray-400">○</span>;
  };

  return (
    <div 
      className={`
        rounded-lg border transition-all duration-300 ease-in-out
        ${section.isComplete 
          ? 'bg-green-50 border-green-200' 
          : isCurrentPhase 
            ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
            : 'bg-gray-50 border-gray-200'
        }
      `}
    >
      <div className="p-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-lg">{getSectionIcon()}</span>
            <div>
              <h3 className={`text-sm font-semibold ${
                section.isComplete 
                  ? 'text-green-800' 
                  : isCurrentPhase 
                    ? 'text-indigo-800' 
                    : 'text-gray-700'
              }`}>
                {section.title}
              </h3>
              <div className="text-xs text-gray-500">
                {section.isComplete 
                  ? 'Complete' 
                  : isCurrentPhase 
                    ? 'Generating...' 
                    : 'Pending'
                }
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
          </div>
        </div>

        {/* Section Content */}
        {section.content.length > 0 && (
          <div className="space-y-2">
            {section.content.map((item, index) => (
              <div 
                key={index}
                className={`
                  flex items-start space-x-2 text-sm transition-opacity duration-200
                  ${section.isComplete ? 'text-gray-700' : 'text-gray-600'}
                `}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: isCurrentPhase ? 'fadeInUp 0.3s ease-out forwards' : 'none'
                }}
              >
                <span className="text-gray-400 mt-1 flex-shrink-0">•</span>
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
            
            {/* Loading indicator for current phase */}
            {isCurrentPhase && !section.isComplete && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-3">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>Adding more details...</span>
              </div>
            )}
          </div>
        )}

        {/* Empty state for sections without content yet */}
        {section.content.length === 0 && !isCurrentPhase && (
          <div className="text-xs text-gray-400 italic">
            Waiting for content...
          </div>
        )}
      </div>
    </div>
  );
};

// Add CSS animation keyframes
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}

export default StreamingSection;