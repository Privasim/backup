'use client';

import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoToMarketTextService } from '../services/goToMarketTextService';

interface StrategyDisplayProps {
  content: string;
  isLoading: boolean;
}

export const StrategyDisplay: React.FC<StrategyDisplayProps> = ({ content, isLoading }) => {
  const [activeSection, setActiveSection] = useState<string>('all');
  
  // Extract sections from content
  const sections = useMemo(() => {
    if (!content) return [];
    
    const service = new GoToMarketTextService(''); // We only need the parsing functionality
    return service.extractSections(content);
  }, [content]);
  
  // Get unique section types for navigation
  const sectionTypes = useMemo(() => {
    const types = sections.map(section => section.title);
    return ['all', ...types];
  }, [sections]);
  
  // Filter content based on active section
  const filteredContent = useMemo(() => {
    if (activeSection === 'all' || !content) return content;
    
    const section = sections.find(s => s.title === activeSection);
    return section ? `# ${section.title}\n\n${section.content}` : content;
  }, [activeSection, content, sections]);
  
  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
  };
  
  // Download as markdown
  const downloadMarkdown = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = 'go-to-market-strategy.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>
      </div>
    );
  }
  
  if (!content) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-500">Your generated go-to-market strategy will appear here.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Section Navigation */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Sections:</span>
          {sectionTypes.map(type => (
            <button
              key={type}
              onClick={() => setActiveSection(type)}
              className={`px-3 py-1 text-sm rounded-full ${
                activeSection === type
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      {/* Actions */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex justify-end gap-2">
        <button
          onClick={copyToClipboard}
          className="px-3 py-1 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
        <button
          onClick={downloadMarkdown}
          className="px-3 py-1 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6 max-w-none">
        {filteredContent ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose max-w-none"
            components={{
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-5" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4" {...props} />,
              p: ({node, ...props}) => <p className="text-gray-700 mb-4" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1" {...props} />,
              li: ({node, ...props}) => <li className="ml-4" {...props} />,
              a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
              em: ({node, ...props}) => <em className="italic" {...props} />
            }}
          >
            {filteredContent}
          </ReactMarkdown>
        ) : (
          <p className="text-gray-500">No content to display.</p>
        )}
      </div>
    </div>
  );
};
