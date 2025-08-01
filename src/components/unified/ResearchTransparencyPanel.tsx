'use client';

import React, { useState } from 'react';

interface ResearchTransparencyPanelProps {
  className?: string;
}

export const ResearchTransparencyPanel: React.FC<ResearchTransparencyPanelProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Mermaid diagram code
  const mermaidDiagram = `graph TD
    A[Research Paper] -->|Extract Data| B[Raw Data]
    B -->|Process| C[Knowledge Base]
    C -->|Query| D[Research Service]
    D -->|Enhance| E[Assessment Results]
    E -->|Display| F[Results Panel]`;
  
  // Source metadata
  const sourceMetadata = {
    title: "The Impact of Generative AI on Employment",
    arxivId: "2507.07935",
    url: "https://arxiv.org/pdf/2507.07935",
    authors: ["Edward W. Felten", "Manav Raj", "Robert Seamans"],
    extractionDate: "2025-01-08T16:25:00.000Z"
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div 
        className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-medium text-gray-900">Research Data Transparency</h3>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Source Paper</h4>
            <p className="text-sm text-gray-700">
              <a 
                href={sourceMetadata.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {sourceMetadata.title}
              </a>
            </p>
            <p className="text-xs text-gray-500">
              Authors: {sourceMetadata.authors.join(', ')}
            </p>
            <p className="text-xs text-gray-500">
              Extracted: {new Date(sourceMetadata.extractionDate).toLocaleDateString()}
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Research Data Flow</h4>
            <div className="bg-gray-50 p-3 rounded-md overflow-x-auto border border-gray-200">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                {mermaidDiagram}
              </pre>
            </div>
            <p className="text-xs text-gray-500">
              Note: This diagram shows how research data flows through the system.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchTransparencyPanel;
