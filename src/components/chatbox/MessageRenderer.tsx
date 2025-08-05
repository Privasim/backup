'use client';

import React from 'react';
import { ChatboxMessage as MessageType } from './types';

interface MessageRendererProps {
  message: MessageType;
  isStreaming?: boolean;
}

/**
 * Extensible message renderer that can handle different content types
 * Future plugins can register custom renderers for specific content types
 */
export const MessageRenderer: React.FC<MessageRendererProps> = ({
  message,
  isStreaming = false
}) => {
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

  return (
    <div className="message-content">
      {renderContent()}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-current opacity-75 animate-pulse ml-1" />
      )}
    </div>
  );
};

export default MessageRenderer;