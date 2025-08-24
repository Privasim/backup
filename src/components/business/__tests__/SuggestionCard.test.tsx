import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SuggestionCard } from '../SuggestionCard';
import { BusinessSuggestion } from '@/components/chatbox/types';

// Mock the TabContext
jest.mock('@/app/businessidea/tabs/TabContext', () => ({
  useTab: () => ({
    setActiveTab: jest.fn(),
  }),
}));

const mockSuggestion: BusinessSuggestion = {
  id: 'test-1',
  title: 'Test Business',
  description: 'A test business description',
  category: 'Technology',
  viabilityScore: 85,
  keyFeatures: ['Feature 1', 'Feature 2', 'Feature 3'],
  targetMarket: 'Small businesses',
  estimatedStartupCost: '$10,000 - $25,000',
  metadata: {
    timeToMarket: '3-6 months',
    skillsRequired: ['Programming', 'Marketing'],
    marketSize: 'Large'
  }
};

describe('SuggestionCard', () => {
  it('should render correctly with all props', () => {
    render(<SuggestionCard suggestion={mockSuggestion} />);
    
    expect(screen.getByText('Test Business')).toBeInTheDocument();
    expect(screen.getByText('A test business description')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
    expect(screen.getByText('Feature 3')).toBeInTheDocument();
    expect(screen.getByText('Small businesses')).toBeInTheDocument();
    expect(screen.getByText('$10,000 - $25,000')).toBeInTheDocument();
    expect(screen.getByText('3-6 months')).toBeInTheDocument();
  });

  it('should call onCreatePlan with correct parameters when button is clicked', () => {
    const mockOnCreatePlan = jest.fn();
    render(
      <SuggestionCard 
        suggestion={mockSuggestion} 
        onCreatePlan={mockOnCreatePlan}
      />
    );
    
    const button = screen.getByText('Create Implementation Plan');
    fireEvent.click(button);
    
    expect(mockOnCreatePlan).toHaveBeenCalledWith(mockSuggestion, undefined);
  });

  it('should have correct accessibility attributes', () => {
    render(<SuggestionCard suggestion={mockSuggestion} />);
    
    const planButton = screen.getByLabelText('Create Implementation Plan');
    const visualizeButton = screen.getByLabelText('Visualize App');
    
    expect(planButton).toBeInTheDocument();
    expect(visualizeButton).toBeInTheDocument();
  });
});
