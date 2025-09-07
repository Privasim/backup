import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface MarkdownRendererProps {
  content: string;
  className?: string;
  "aria-label"?: string;
}

export function MarkdownRenderer({ content, className, ...aria }: MarkdownRendererProps) {
  return (
    <div
      className={[
        // Use prose for readable markdown, keep width unconstrained
        'prose dark:prose-invert max-w-none text-sm',
        className || '',
      ].join(' ')}
      {...aria}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
