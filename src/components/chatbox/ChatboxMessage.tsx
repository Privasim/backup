'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChatboxMessageData as MessageType } from './types';
import { MessageRenderer } from './MessageRenderer';
import { 
  UserIcon, 
  ComputerDesktopIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface ChatboxMessageProps {
  message: MessageType;
  isStreaming?: boolean;
  showTimestamp?: boolean;
  onCopy?: (content: string) => void;
}

export const ChatboxMessage: React.FC<ChatboxMessageProps> = ({
  message,
  isStreaming = false,
  showTimestamp = false,
  onCopy
}) => {
  const [copied, setCopied] = useState(false);
  const [displayContent, setDisplayContent] = useState('');

  // Handle streaming content updates
  useEffect(() => {
    if (isStreaming) {
      // For streaming messages, content builds up over time
      setDisplayContent(message.content);
    } else {
      // For complete messages, show full content immediately
      setDisplayContent(message.content);
    }
  }, [message.content, isStreaming]);

  const handleCopy = async () => {
    if (!onCopy) return;
    
    try {
      await navigator.clipboard.writeText(message.content);
      onCopy(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const getMessageIcon = () => {
    switch (message.type) {
      case 'user':
        return <UserIcon className="w-4 h-4" />;
      case 'assistant':
        return <ComputerDesktopIcon className="w-4 h-4" />;
      case 'system':
        return <InformationCircleIcon className="w-4 h-4" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <InformationCircleIcon className="w-4 h-4" />;
    }
  };

  const getMessageStyles = () => {
    const baseStyles = "max-w-[85%] rounded-xl px-3 py-2 relative group";
    
    switch (message.type) {
      case 'user':
        return `${baseStyles} bg-blue-600 text-white ml-auto`;
      case 'assistant':
        // Premium minimalist: white card with subtle ring and shadow
        return `${baseStyles} bg-white text-gray-900 mr-auto ring-1 ring-gray-200 shadow-sm`;
      case 'system':
        return `${baseStyles} bg-blue-50 text-blue-800 border border-blue-200 mx-auto`;
      case 'error':
        return `${baseStyles} bg-red-50 text-red-800 border border-red-200 mr-auto`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-900 mr-auto`;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const shouldShowCopyButton = message.type === 'assistant' && message.content.length > 50;

  // Parse content into collapsible sections using robust heading heuristics
  type Section = { title: string; body: string };
  const sections: Section[] = useMemo(() => {
    const content = message.content || '';
    const lines = content.split('\n');
    const out: Section[] = [];
    let currentTitle: string | null = null;
    let bodyLines: string[] = [];

    const KNOWN_TITLES = [
      'Career Snapshot',
      'Key Strengths',
      'Areas to Improve',
      'Areas for Improvement',
      'Recommendations',
      'Action Plan',
      'Next Steps',
      'Opportunities',
      'Risks',
      'Summary',
      'Profile Overview'
    ];

    const isKnownTitle = (t: string) => KNOWN_TITLES.some(k => k.toLowerCase() === t.trim().toLowerCase());
    const isNumberedTitle = (t: string) => /^\d+\.\s+.+$/.test(t.trim());
    const isMarkdownHeading = (t: string) => /^#{1,3}\s+.+$/.test(t.trim());
    const isTitleCase = (t: string) => {
      const words = t.trim().split(/\s+/);
      if (words.length === 0 || words.join('').length < 3) return false;
      // Title case heuristic: Most words start with uppercase
      const upperStarts = words.filter(w => /^[A-Z][\w-]*$/.test(w)).length;
      return upperStarts / words.length >= 0.6;
    };

    const pushCurrent = () => {
      if (currentTitle !== null) {
        const body = bodyLines.join('\n').replace(/^\n+|\n+$/g, '');
        out.push({ title: currentTitle, body });
      }
      bodyLines = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) { bodyLines.push(line); continue; }

      let newTitle: string | null = null;
      if (isMarkdownHeading(line)) {
        newTitle = line.replace(/^#{1,3}\s+/, '');
      } else if (isNumberedTitle(line)) {
        newTitle = line.replace(/^\d+\.\s+/, '');
      } else if (isKnownTitle(line)) {
        newTitle = line.trim();
      } else if (isTitleCase(line)) {
        // If next line begins a list, treat as a section title
        const next = lines[i + 1] || '';
        if (/^(?:- |\* |• |\d+\.\s)/.test(next.trim()) || next.trim() === '') {
          newTitle = line.trim();
        }
      }

      if (newTitle) {
        pushCurrent();
        currentTitle = newTitle;
        continue;
      }

      bodyLines.push(line);
    }

    if (currentTitle !== null) pushCurrent();

    if (out.length === 0) {
      return [{ title: 'Analysis', body: content }];
    }
    return out;
  }, [message.content]);

  // Expanded state per section (default: first expanded)
  const [expanded, setExpanded] = useState<boolean[]>([]);
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    setExpanded(sections.map((_, i) => (isMobile ? false : i === 0)));
  }, [sections.length]);

  const expandAll = () => setExpanded(Array(sections.length).fill(true));
  const collapseAll = () => setExpanded(Array(sections.length).fill(false));

  // Count list items per section for badges
  const countSectionItems = (body: string) => {
    return body.split('\n').filter(l => /^(?:- |\* |• |\d+\.\s)/.test(l.trim())).length;
  };
  const itemCounts = useMemo(() => sections.map(s => countSectionItems(s.body)), [sections]);

  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={getMessageStyles()}>
        {/* Message Header */}
        <div className="flex items-center justify-between mb-2">
          <div className={`flex items-center gap-2 ${
            message.type === 'user' ? 'text-blue-100' : 'text-gray-600'
          }`}>
            {getMessageIcon()}
            <span className="text-xs font-medium capitalize">
              {message.type === 'assistant' ? 'AI Analysis' : message.type}
            </span>
          </div>
          {showTimestamp && (
            <span className="text-[11px] text-gray-400">
              {formatTimestamp(message.timestamp)}
            </span>
          )}
        </div>

        {/* Message Content */}
        <div className="space-y-1.5">
          {isStreaming || message.type !== 'assistant' ? (
            <div className="text-[13px] whitespace-pre-wrap leading-snug">
              {displayContent}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-current opacity-75 animate-pulse ml-1" />
              )}
            </div>
          ) : (
            <>
              {sections.length > 1 && (
                <div className="flex items-center justify-end gap-3 mb-1">
                  <button
                    type="button"
                    onClick={expandAll}
                    className="text-[11px] text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300 rounded px-1"
                  >
                    Expand all
                  </button>
                  <button
                    type="button"
                    onClick={collapseAll}
                    className="text-[11px] text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300 rounded px-1"
                  >
                    Collapse all
                  </button>
                </div>
              )}
              {sections.length > 1 && (
                <div className="mb-1 -mx-1 flex flex-wrap gap-1.5">
                  {sections.map((s, idx) => (
                    <button
                      key={`chip-${idx}`}
                      type="button"
                      onClick={() => setExpanded(prev => prev.map((v, i) => i === idx ? !v : v))}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] ${expanded[idx] ? 'border-gray-300 bg-gray-50 text-gray-700' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="truncate max-w-[140px]">{s.title}</span>
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gray-100 text-gray-600 text-[10px]">{itemCounts[idx] || 0}</span>
                    </button>
                  ))}
                </div>
              )}
              {/* If a single generic section, render directly without header */}
              {sections.length === 1 && sections[0].title === 'Analysis' ? (
                <div className="text-[13px] leading-snug">
                  <MessageRenderer
                    message={{ ...message, content: sections[0].body }}
                    isStreaming={false}
                    showActions={false}
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  {sections.map((section, idx) => (
                    <div key={idx} className="">
                      <button
                        type="button"
                        onClick={() => setExpanded(prev => prev.map((v, i) => i === idx ? !v : v))}
                        aria-expanded={expanded[idx] || false}
                        className="w-full flex items-center justify-between text-left px-2 py-1.5 rounded-md hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className="text-[12px] font-medium text-gray-700 tracking-wide">{section.title}</span>
                          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded bg-gray-100 text-gray-600 text-[10px]">{itemCounts[idx] || 0}</span>
                        </span>
                        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${expanded[idx] ? 'rotate-180' : ''}`} />
                      </button>
                      {expanded[idx] && (
                        <div className="mt-1 pl-3 border-l border-gray-200">
                          <div className="text-[13px] leading-snug">
                            <MessageRenderer
                              message={{ ...message, content: section.body }}
                              isStreaming={false}
                              showActions={false}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Analysis Type Badge */}
          {message.analysisType && (
            <div className="flex items-center mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                message.type === 'user' 
                  ? 'bg-blue-500 text-blue-100' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {message.analysisType} analysis
              </span>
            </div>
          )}

          {/* Metadata Display */}
          {message.metadata && Object.keys(message.metadata).length > 0 && (
            <details className="mt-2">
              <summary className={`text-xs cursor-pointer ${
                message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
              } hover:opacity-75`}>
                Analysis Details
              </summary>
              <div className={`mt-1 text-xs ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-600'
              }`}>
                {message.metadata.usage && (
                  <div className="space-y-1">
                    <div>Tokens: {message.metadata.usage.total_tokens}</div>
                    <div>Model: {message.metadata.usage.model || 'Unknown'}</div>
                  </div>
                )}
                {message.metadata.profileStats && (
                  <div className="mt-2">
                    Profile Completion: {message.metadata.profileStats.completionPercentage}%
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Copy Button */}
        {shouldShowCopyButton && (
          <button
            onClick={handleCopy}
            className={`absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
              message.type === 'user'
                ? 'text-blue-200 hover:text-white hover:bg-blue-500'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
            }`}
            title="Copy message"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4" />
            ) : (
              <ClipboardDocumentIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatboxMessage;