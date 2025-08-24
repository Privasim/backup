'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GoToMarketStrategies } from '../types';
import { ExportControls } from './ExportControls';
import { 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon, 
  EyeIcon, 
  DocumentTextIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

interface MarkdownStrategyDisplayProps {
  strategies: GoToMarketStrategies;
  rawMarkdown?: string;
  onUpdateMarkdown?: (markdown: string) => void;
  className?: string;
}

interface EditableSection {
  id: string;
  title: string;
  content: string;
  isEditing: boolean;
}

export const MarkdownStrategyDisplay: React.FC<MarkdownStrategyDisplayProps> = React.memo(({
  strategies,
  rawMarkdown = '',
  onUpdateMarkdown,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'rendered' | 'markdown' | 'split'>('rendered');
  const [sections, setSections] = useState<EditableSection[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Parse markdown into editable sections
  useEffect(() => {
    if (rawMarkdown) {
      const parsedSections = parseMarkdownIntoSections(rawMarkdown);
      setSections(parsedSections);
    }
  }, [rawMarkdown]);

  const parseMarkdownIntoSections = (markdown: string): EditableSection[] => {
    const lines = markdown.split('\n');
    const sections: EditableSection[] = [];
    let currentSection: EditableSection | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
      
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          currentSection.content = currentContent.join('\n').trim();
          sections.push(currentSection);
        }
        
        // Start new section
        const level = headerMatch[1].length;
        const title = headerMatch[2].trim();
        
        currentSection = {
          id: `section-${sections.length}`,
          title,
          content: '',
          isEditing: false
        };
        currentContent = [line]; // Include the header in content
      } else if (currentSection) {
        currentContent.push(line);
      }
    }
    
    // Add final section
    if (currentSection) {
      currentSection.content = currentContent.join('\n').trim();
      sections.push(currentSection);
    }
    
    return sections;
  };

  const handleSectionEdit = (sectionId: string) => {
    setEditingSection(sectionId);
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isEditing: true }
        : { ...section, isEditing: false }
    ));
  };

  const handleSectionSave = (sectionId: string, newContent: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, content: newContent, isEditing: false }
        : section
    ));
    setEditingSection(null);
    
    // Update the full markdown
    const updatedMarkdown = sections.map(section => 
      section.id === sectionId ? newContent : section.content
    ).join('\n\n');
    
    onUpdateMarkdown?.(updatedMarkdown);
  };

  const handleSectionCancel = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isEditing: false }
        : section
    ));
    setEditingSection(null);
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering - in a real app, you'd use a proper markdown parser
    return content
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-3">{line.slice(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold text-gray-900 mt-8 mb-4">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-6">{line.slice(2)}</h1>;
        }
        
        // Lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={index} className="ml-4 text-gray-700">{line.slice(2)}</li>;
        }
        if (line.match(/^\d+\. /)) {
          return <li key={index} className="ml-4 text-gray-700">{line.replace(/^\d+\. /, '')}</li>;
        }
        
        // Bold text
        const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Empty lines
        if (line.trim() === '') {
          return <br key={index} />;
        }
        
        // Regular paragraphs
        return (
          <p 
            key={index} 
            className="text-gray-700 mb-2 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: boldText }}
          />
        );
      });
  };

  const renderSection = (section: EditableSection) => {
    if (section.isEditing) {
      return (
        <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Editing: {section.title}</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSectionSave(section.id, textareaRef.current?.value || section.content)}
                className="flex items-center px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                <CheckIcon className="w-3 h-3 mr-1" />
                Save
              </button>
              <button
                onClick={() => handleSectionCancel(section.id)}
                className="flex items-center px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                <XMarkIcon className="w-3 h-3 mr-1" />
                Cancel
              </button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            defaultValue={section.content}
            className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Edit markdown content..."
          />
        </div>
      );
    }

    return (
      <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-4 group">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">{section.title}</h3>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleSectionEdit(section.id)}
              className="flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={editingSection !== null}
            >
              <PencilIcon className="w-3 h-3 mr-1" />
              Edit
            </button>
            <button
              onClick={() => copyToClipboard(section.content)}
              className="flex items-center px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              <ClipboardDocumentIcon className="w-3 h-3 mr-1" />
              Copy
            </button>
          </div>
        </div>
        <div className="prose prose-sm max-w-none">
          {renderMarkdown(section.content)}
        </div>
      </div>
    );
  };

  const renderViewModeContent = () => {
    switch (viewMode) {
      case 'rendered':
        return (
          <div className="space-y-4">
            {sections.length > 0 ? (
              sections.map(renderSection)
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="prose prose-sm max-w-none">
                  {renderMarkdown(rawMarkdown)}
                </div>
              </div>
            )}
          </div>
        );

      case 'markdown':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Raw Markdown</h3>
              <button
                onClick={() => copyToClipboard(rawMarkdown)}
                className="flex items-center px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                <ClipboardDocumentIcon className="w-3 h-3 mr-1" />
                Copy All
              </button>
            </div>
            <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm font-mono whitespace-pre-wrap">
              {rawMarkdown}
            </pre>
          </div>
        );

      case 'split':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Markdown Source</h3>
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-xs font-mono whitespace-pre-wrap h-96">
                {rawMarkdown}
              </pre>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Rendered Output</h3>
              <div className="prose prose-sm max-w-none h-96 overflow-auto">
                {renderMarkdown(rawMarkdown)}
              </div>
            </div>
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
            Generated on {new Date(strategies.generatedAt).toLocaleDateString()} • Markdown Format
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <ExportControls strategies={strategies} />
        </div>
      </div>

      {/* View Mode Controls */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">View Mode:</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setViewMode('rendered')}
              className={`flex items-center px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'rendered'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <EyeIcon className="w-3 h-3 mr-1" />
              Rendered
            </button>
            <button
              onClick={() => setViewMode('markdown')}
              className={`flex items-center px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'markdown'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <DocumentTextIcon className="w-3 h-3 mr-1" />
              Markdown
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'split'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Split View
            </button>
          </div>
        </div>

        {onUpdateMarkdown && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">
              {editingSection ? 'Editing mode active' : 'Click Edit to modify sections'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {renderViewModeContent()}
      </div>

      {/* Section-based completion tracking */}
      {sections.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Section Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-xs text-gray-700 truncate">{section.title}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {section.content.split(' ').length} words
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default MarkdownStrategyDisplay;