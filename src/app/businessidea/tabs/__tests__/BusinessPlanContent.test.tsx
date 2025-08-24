import React from 'react';
import { render, screen } from '@testing-library/react';
import { BusinessPlanContent } from '../BusinessPlanContent';

// Mock the useChatbox hook
jest.mock('@/components/chatbox/ChatboxProvider', () => ({
  useChatbox: () => ({
    businessSuggestions: {
      suggestions: [
        {
          id: 'test-1',
          title: 'Test Business',
          description: 'A test business description',
          category: 'Technology',
          viabilityScore: 85,
          keyFeatures: ['Feature 1', 'Feature 2'],
          targetMarket: 'Small businesses',
          estimatedStartupCost: '$10,000 - $25,000',
          metadata: {
            timeToMarket: '3-6 months',
          }
        }
      ],
      suggestionStatus: 'completed',
      suggestionError: null,
    },
    createPlanConversation: jest.fn(),
    openChatbox: jest.fn(),
  }),
}));

// Mock the useImplementationPlan hook
jest.mock('@/features/implementation-plan/useImplementationPlan', () => ({
  useImplementationPlanContext: () => ({
    lengthPreset: 'standard',
    setLengthPreset: jest.fn(),
  }),
}));

// Mock the TabContext
jest.mock('@/app/businessidea/tabs/TabContext', () => ({
  useTab: () => ({
    activeTab: 'business',
    setActiveTab: jest.fn(),
  }),
}));

// Mock the SuggestionCard component
jest.mock('@/components/business/SuggestionCard', () => ({
  SuggestionCard: ({ suggestion, onCreatePlan }: any) => (
    <div data-testid="suggestion-card">
      <h3>{suggestion.title}</h3>
      <button 
        onClick={() => onCreatePlan?.(suggestion, 'standard')}
        data-testid="create-plan-button"
      >
        Create Plan
      </button>
    </div>
  ),
}));

describe('BusinessPlanContent', () => {
  it('should render suggestions correctly', () => {
    render(<BusinessPlanContent />);
    
    expect(screen.getByText('Test Business')).toBeInTheDocument();
    expect(screen.getByTestId('suggestion-card')).toBeInTheDocument();
  });

  it('should pass lengthPreset to SuggestionCard', () => {
    const mockCreatePlanConversation = jest.fn();
    
    // Re-mock useChatbox with the mock function
    jest.mock('@/components/chatbox/ChatboxProvider', () => ({
      useChatbox: () => ({
        businessSuggestions: {
          suggestions: [
            {
              id: 'test-1',
              title: 'Test Business',
              description: 'A test business description',
              category: 'Technology',
              viabilityScore: 85,
              keyFeatures: ['Feature 1', 'Feature 2'],
              targetMarket: 'Small businesses',
              estimatedStartupCost: '$10,000 - $25,000',
              metadata: {
                timeToMarket: '3-6 months',
              }
            }
          ],
          suggestionStatus: 'completed',
          suggestionError: null,
        },
        createPlanConversation: mockCreatePlanConversation,
        openChatbox: jest.fn(),
      }),
    }));
    
    render(<BusinessPlanContent />);
    
    const button = screen.getByTestId('create-plan-button');
    fireEvent.click(button);
    
    // Verify that createPlanConversation was called with the suggestion and lengthPreset
    expect(mockCreatePlanConversation).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-1',
        title: 'Test Business',
      }),
      'standard'
    );
  });
});
