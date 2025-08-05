'use client';

import React, { useState } from 'react';
import { ChatboxMessageData as MessageType } from './types';
import { ContentProcessor } from './utils/content-processor';
import { ClipboardUtils } from './utils/clipboard-utils';

interface MessageRendererProps {
  message: MessageType;
  isStreaming?: boolean;
  showActions?: boolean;
  onCopy?: (success: boolean) => void;
  onExport?: (format: string) => void;
}

/**
 * Extensible message renderer that can handle different content types
 * Future plugins can register custom renderers for specific content types
 */
export const MessageRenderer: React.FC<MessageRendererProps> = ({
  message,
  isStreaming = false,
  showActions = true,
  onCopy,
  onExport
}) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');
  // Check if content contains structured data
  const isStructuredContent = (content: string): boolean => {
    try {
      const parsed = JSON.parse(content);
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
    }
  };

  // Render markdown-like formatting
  const renderFormattedText = (content: string): React.ReactNode => {
    // Split content into lines for processing
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentSection: string[] = [];
    let inCodeBlock = false;
    let codeBlockLanguage = '';

    const flushCurrentSection = () => {
      if (currentSection.length > 0) {
        const text = currentSection.join('\n');
        elements.push(
          <div key={elements.length} className="mb-3">
            {renderInlineFormatting(text)}
          </div>
        );
        currentSection = [];
      }
    };

    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <pre key={elements.length} className="bg-gray-800 text-gray-100 p-3 rounded-lg overflow-x-auto mb-3">
              <code className={`language-${codeBlockLanguage}`}>
                {currentSection.join('\n')}
              </code>
            </pre>
          );
          currentSection = [];
          inCodeBlock = false;
          codeBlockLanguage = '';
        } else {
          // Start code block
          flushCurrentSection();
          inCodeBlock = true;
          codeBlockLanguage = line.slice(3).trim() || 'text';
        }
        return;
      }

      if (inCodeBlock) {
        currentSection.push(line);
        return;
      }

      // Handle headers
      if (line.startsWith('# ')) {
        flushCurrentSection();
        elements.push(
          <h1 key={elements.length} className="text-xl font-bold mb-3 text-gray-900">
            {line.slice(2)}
          </h1>
        );
        return;
      }

      if (line.startsWith('## ')) {
        flushCurrentSection();
        elements.push(
          <h2 key={elements.length} className="text-lg font-semibold mb-2 text-gray-900">
            {line.slice(3)}
          </h2>
        );
        return;
      }

      if (line.startsWith('### ')) {
        flushCurrentSection();
        elements.push(
          <h3 key={elements.length} className="text-base font-medium mb-2 text-gray-900">
            {line.slice(4)}
          </h3>
        );
        return;
      }

      // Handle lists
      if (line.match(/^\d+\.\s/)) {
        // Numbered list item
        if (currentSection.length === 0 || !currentSection[currentSection.length - 1].match(/^\d+\.\s/)) {
          flushCurrentSection();
        }
        currentSection.push(line);
        return;
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        // Bullet list item
        if (currentSection.length === 0 || (!currentSection[currentSection.length - 1].startsWith('- ') && !currentSection[currentSection.length - 1].startsWith('* '))) {
          flushCurrentSection();
        }
        currentSection.push(line);
        return;
      }

      // Handle empty lines
      if (line.trim() === '') {
        if (currentSection.length > 0) {
          flushCurrentSection();
        }
        return;
      }

      // Regular text
      currentSection.push(line);
    });

    // Flush remaining content
    flushCurrentSection();

    return elements;
  };

  // Render inline formatting (bold, italic, code)
  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Handle lists
    if (text.includes('\n') && (text.includes('- ') || text.includes('* ') || text.match(/^\d+\.\s/m))) {
      const lines = text.split('\n');
      const listItems: React.ReactNode[] = [];
      let isNumberedList = false;

      lines.forEach((line, index) => {
        if (line.match(/^\d+\.\s/)) {
          isNumberedList = true;
          listItems.push(
            <li key={index} className="mb-1">
              {formatInlineText(line.replace(/^\d+\.\s/, ''))}
            </li>
          );
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          listItems.push(
            <li key={index} className="mb-1">
              {formatInlineText(line.slice(2))}
            </li>
          );
        } else if (line.trim()) {
          listItems.push(
            <div key={index} className="mb-1">
              {formatInlineText(line)}
            </div>
          );
        }
      });

      if (isNumberedList) {
        return <ol className="list-decimal list-inside space-y-1 ml-4">{listItems}</ol>;
      } else if (listItems.some((_, i) => lines[i]?.startsWith('- ') || lines[i]?.startsWith('* '))) {
        return <ul className="list-disc list-inside space-y-1 ml-4">{listItems}</ul>;
      }
    }

    return formatInlineText(text);
  };

  // Format inline text with bold, italic, code
  const formatInlineText = (text: string): React.ReactNode => {
    // Simple regex-based formatting
    let formatted = text;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Handle inline code first
    const codeRegex = /`([^`]+)`/g;
    let match;

    while ((match = codeRegex.exec(text)) !== null) {
      // Add text before code
      if (match.index > lastIndex) {
        elements.push(text.slice(lastIndex, match.index));
      }
      
      // Add code element
      elements.push(
        <code key={match.index} className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">
          {match[1]}
        </code>
      );
      
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    if (elements.length > 1) {
      return <>{elements}</>;
    }

    // Handle bold and italic (simplified)
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .split(/(<strong>.*?<\/strong>|<em>.*?<\/em>)/)
      .map((part, index) => {
        if (part.startsWith('<strong>')) {
          return <strong key={index}>{part.replace(/<\/?strong>/g, '')}</strong>;
        }
        if (part.startsWith('<em>')) {
          return <em key={index}>{part.replace(/<\/?em>/g, '')}</em>;
        }
        return part;
      });
  };

  // Render structured content (JSON)
  const renderStructuredContent = (content: string): React.ReactNode => {
    try {
      const data = JSON.parse(content);
      
      // Handle different structured data types
      if (data.type === 'analysis_result') {
        return (
          <div className="space-y-3">
            <div className="font-medium text-gray-900">{data.title}</div>
            {data.sections?.map((section: any, index: number) => (
              <div key={index} className="border-l-2 border-blue-200 pl-3">
                <div className="font-medium text-sm text-gray-800">{section.title}</div>
                <div className="text-sm text-gray-600 mt-1">{section.content}</div>
              </div>
            ))}
          </div>
        );
      }

      // Fallback: render as formatted JSON
      return (
        <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
    } catch {
      // If parsing fails, render as regular text
      return renderFormattedText(content);
    }
  };

  // Main render logic
  const renderContent = (): React.ReactNode => {
    if (!message.content) {
      return <div className="text-gray-400 italic">No content</div>;
    }

    // Check for structured content
    if (isStructuredContent(message.content)) {
      return renderStructuredContent(message.content);
    }

    // Render as formatted text
    return renderFormattedText(message.content);
  };

  // Handle copy action
  const handleCopy = async () => {
    setCopyStatus('copying');
    
    const sanitizedContent = ContentProcessor.sanitizeContent(message.content);
    const success = await ClipboardUtils.copyAnalysisResult(sanitizedContent, {
      model: message.metadata?.model,
      timestamp: message.timestamp,
      analysisType: message.analysisType
    });
    
    setCopyStatus(success ? 'success' : 'error');
    
    // Reset status after 2 seconds
    setTimeout(() => setCopyStatus('idle'), 2000);
    
    if (onCopy) {
      onCopy(success);
    }
  };

  // Handle export action
  const handleExport = (format: string) => {
    if (onExport) {
      onExport(format);
    }
  };

  // Get copy button text based on status
  const getCopyButtonText = () => {
    switch (copyStatus) {
      case 'copying': return 'Copying...';
      case 'success': return 'Copied!';
      case 'error': return 'Failed';
      default: return 'Copy';
    }
  };

  // Get copy button style based on status
  const getCopyButtonStyle = () => {
    switch (copyStatus) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 hover:text-gray-800 hover:bg-gray-50';
    }
  };

  return (
    <div className="message-content">
      {renderContent()}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-current opacity-75 animate-pulse ml-1" />
      )}
      
      {/* Message Actions */}
      {showActions && !isStreaming && message.content && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={copyStatus === 'copying'}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${getCopyButtonStyle()}`}
            title="Copy message content"
          >
            {copyStatus === 'copying' ? (
              <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : copyStatus === 'success' ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : copyStatus === 'error' ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
            <span>{getCopyButtonText()}</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
              title="Export message"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export</span>
            </button>
            
            {/* Export Options */}
            <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1 min-w-[120px]">
                <button
                  onClick={() => handleExport('text')}
                  className="w-full text-left px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Plain Text
                </button>
                <button
                  onClick={() => handleExport('markdown')}
                  className="w-full text-left px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Markdown
                </button>
                <button
                  onClick={() => handleExport('html')}
                  className="w-full text-left px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  HTML
                </button>
              </div>
            </div>
          </div>

          {/* Message Info */}
          <div className="flex-1" />
          <div className="text-xs text-gray-400">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageRenderer;