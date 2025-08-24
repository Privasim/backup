'use client';

import React, { useState, useEffect } from 'react';
import { ContentLength, CONTENT_LENGTH_CONFIG } from '../types';

interface ContentLengthOption {
  value: ContentLength;
  label: string;
  description: string;
  estimatedReadTime: string;
  sentenceRange: string;
  maxSections: number;
}

interface ContentLengthSelectorProps {
  value: ContentLength;
  onChange: (length: ContentLength) => void;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

const CONTENT_LENGTH_OPTIONS: ContentLengthOption[] = [
  {
    value: 'brief',
    label: 'Brief',
    description: 'Essential information only, perfect for quick overviews',
    estimatedReadTime: '2-3 min',
    sentenceRange: '3-5 sentences',
    maxSections: CONTENT_LENGTH_CONFIG.brief.maxSections
  },
  {
    value: 'standard',
    label: 'Standard',
    description: 'Balanced detail with actionable insights',
    estimatedReadTime: '5-7 min',
    sentenceRange: '6-9 sentences',
    maxSections: CONTENT_LENGTH_CONFIG.standard.maxSections
  },
  {
    value: 'detailed',
    label: 'Detailed',
    description: 'Comprehensive analysis with thorough explanations',
    estimatedReadTime: '10-15 min',
    sentenceRange: '10-12 sentences',
    maxSections: CONTENT_LENGTH_CONFIG.detailed.maxSections
  }
];

const STORAGE_KEY = 'gotomarket-content-length-preference';

export function ContentLengthSelector({ 
  value, 
  onChange, 
  disabled = false, 
  className = '',
  compact = false
}: ContentLengthSelectorProps) {
  const [selectedLength, setSelectedLength] = useState<ContentLength>(value);

  // Load preference from localStorage on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem(STORAGE_KEY) as ContentLength;
    if (savedPreference && ['brief', 'standard', 'detailed'].includes(savedPreference)) {
      setSelectedLength(savedPreference);
      onChange(savedPreference);
    }
  }, [onChange]);

  // Save preference to localStorage when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedLength);
  }, [selectedLength]);

  const handleSelectionChange = (length: ContentLength) => {
    setSelectedLength(length);
    onChange(length);
  };

  return (
    <div className={`content-length-selector ${compact ? 'compact' : ''} ${className}`}>
      <div className="selector-header">
        <h3 className="selector-title">Content Length</h3>
        <p className="selector-subtitle">
          Choose how detailed you want your go-to-market strategy
        </p>
      </div>

      <div className={`length-options ${compact ? 'compact-options' : ''}`}>
        {CONTENT_LENGTH_OPTIONS.map((option) => (
          <div
            key={option.value}
            className={`length-option ${
              selectedLength === option.value ? 'selected' : ''
            } ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && handleSelectionChange(option.value)}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleSelectionChange(option.value);
              }
            }}
            aria-pressed={selectedLength === option.value}
            aria-disabled={disabled}
          >
            <div className="option-header">
              <div className="option-radio">
                <input
                  type="radio"
                  name="content-length"
                  value={option.value}
                  checked={selectedLength === option.value}
                  onChange={() => handleSelectionChange(option.value)}
                  disabled={disabled}
                  aria-label={`Select ${option.label} content length`}
                />
                <span className="radio-custom"></span>
              </div>
              <div className="option-title-section">
                <h4 className="option-title">{option.label}</h4>
                <span className="option-read-time">{option.estimatedReadTime}</span>
              </div>
            </div>
            
            <p className="option-description">{option.description}</p>
            
            <div className="option-details">
              <div className="detail-item">
                <span className="detail-label">Per section:</span>
                <span className="detail-value">{option.sentenceRange}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Max sections:</span>
                <span className="detail-value">{option.maxSections}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="selector-footer">
        <p className="footer-note">
          💡 Your preference will be saved for future generations
        </p>
      </div>

      <style jsx>{`
        .content-length-selector {
          background: white;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .selector-header {
          margin-bottom: 20px;
        }

        .selector-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .selector-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .length-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .length-option {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #fafafa;
        }

        .length-option:hover:not(.disabled) {
          border-color: #3b82f6;
          background: #f8faff;
        }

        .length-option.selected {
          border-color: #3b82f6;
          background: #eff6ff;
          box-shadow: 0 0 0 1px #3b82f6;
        }

        .length-option.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .option-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
        }

        .option-radio {
          position: relative;
          margin-top: 2px;
        }

        .option-radio input[type="radio"] {
          opacity: 0;
          position: absolute;
          width: 20px;
          height: 20px;
          margin: 0;
        }

        .radio-custom {
          display: block;
          width: 20px;
          height: 20px;
          border: 2px solid #d1d5db;
          border-radius: 50%;
          background: white;
          position: relative;
          transition: all 0.2s ease;
        }

        .option-radio input[type="radio"]:checked + .radio-custom {
          border-color: #3b82f6;
          background: #3b82f6;
        }

        .option-radio input[type="radio"]:checked + .radio-custom::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
        }

        .option-title-section {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .option-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .option-read-time {
          font-size: 12px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 500;
        }

        .option-description {
          font-size: 14px;
          color: #4b5563;
          margin: 0 0 12px 32px;
          line-height: 1.4;
        }

        .option-details {
          display: flex;
          gap: 16px;
          margin-left: 32px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .detail-label {
          font-size: 11px;
          color: #9ca3af;
          text-transform: uppercase;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 13px;
          color: #374151;
          font-weight: 500;
        }

        .selector-footer {
          border-top: 1px solid #f3f4f6;
          padding-top: 12px;
        }

        .footer-note {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
          text-align: center;
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .content-length-selector {
            padding: 16px;
          }

          .option-title-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .option-details {
            flex-direction: column;
            gap: 8px;
          }
        }

        /* Compact mode styles */
        .content-length-selector.compact {
          padding: 16px;
        }

        .content-length-selector.compact .selector-header {
          margin-bottom: 12px;
        }

        .content-length-selector.compact .selector-title {
          font-size: 16px;
        }

        .content-length-selector.compact .selector-subtitle {
          font-size: 13px;
        }

        .compact-options {
          flex-direction: row;
          gap: 8px;
        }

        .compact-options .length-option {
          flex: 1;
          padding: 12px;
        }

        .compact-options .option-description {
          display: none;
        }

        .compact-options .option-details {
          margin-left: 0;
          margin-top: 8px;
          justify-content: center;
        }

        .compact-options .detail-item {
          align-items: center;
          text-align: center;
        }

        /* Focus styles for accessibility */
        .length-option:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .option-radio input[type="radio"]:focus + .radio-custom {
          box-shadow: 0 0 0 2px #3b82f6;
        }
      `}</style>
    </div>
  );
}

// Hook for managing content length preference
export function useContentLengthPreference(defaultLength: ContentLength = 'standard') {
  const [contentLength, setContentLength] = useState<ContentLength>(defaultLength);

  useEffect(() => {
    const savedPreference = localStorage.getItem(STORAGE_KEY) as ContentLength;
    if (savedPreference && ['brief', 'standard', 'detailed'].includes(savedPreference)) {
      setContentLength(savedPreference);
    }
  }, []);

  const updateContentLength = (length: ContentLength) => {
    setContentLength(length);
    localStorage.setItem(STORAGE_KEY, length);
  };

  return {
    contentLength,
    setContentLength: updateContentLength,
    isLoaded: true
  };
}

export default ContentLengthSelector;