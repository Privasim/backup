'use client';

import React, { useState } from 'react';
import { ImplementationPlanChat } from './ImplementationPlanChat';
import { ChatErrorBoundary } from './ChatErrorBoundary';
import { BusinessSuggestion } from '@/components/chatbox/types';

// Mock business suggestion for testing
const mockSuggestion: BusinessSuggestion = {
  id: 'test-suggestion-1',
  title: 'AI-Powered Consulting Service',
  description: 'Provide AI consulting services to small and medium businesses to help them integrate artificial intelligence into their operations.',
  category: 'Professional Services',
  viabilityScore: 85,
  keyFeatures: [
    'AI strategy development',
    'Implementation guidance',
    'Training and support',
    'ROI measurement'
  ],
  targetMarket: 'Small to medium businesses (10-500 employees)',
  estimatedStartupCost: '$15,000 - $50,000',
  metadata: {
    timeToMarket: '3-6 months',
    skillsRequired: ['AI expertise', 'Business consulting', 'Project management'],
    marketSize: 'Large and growing'
  }
};

export const TestChatImplementation: React.FC = () => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<BusinessSuggestion | undefined>();
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartGeneration = () => {
    setSelectedSuggestion(mockSuggestion);
    setError(null);
  };

  const handlePlanGenerated = (plan: any) => {
    console.log('Plan generated:', plan);
    setGeneratedPlan(plan);
  };

  const handleError = (errorMessage: string) => {
    console.error('Generation error:', errorMessage);
    setError(errorMessage);
  };

  const handleReset = () => {
    setSelectedSuggestion(undefined);
    setGeneratedPlan(null);
    setError(null);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            Implementation Plan Chat Test
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleStartGeneration}
              disabled={!!selectedSuggestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Generation
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-red-700 text-sm">
            Error: {error}
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <div className="flex-1">
        <ChatErrorBoundary
          onError={(error, errorInfo) => {
            console.error('Chat error boundary caught:', error, errorInfo);
            setError(error.message);
          }}
        >
          <ImplementationPlanChat
            selectedSuggestion={selectedSuggestion}
            onPlanGenerated={handlePlanGenerated}
            onError={handleError}
          />
        </ChatErrorBoundary>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-900 text-white p-2 text-xs">
          <div>Selected: {selectedSuggestion ? 'Yes' : 'No'}</div>
          <div>Plan Generated: {generatedPlan ? 'Yes' : 'No'}</div>
          <div>Error: {error || 'None'}</div>
        </div>
      )}
    </div>
  );
};

export default TestChatImplementation;