import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JobLossResults from '../JobLossResults';
import { NewsItem } from '../../../types/jobloss';

describe('JobLossResults', () => {
  const mockItems: NewsItem[] = [
    {
      id: '1',
      title: 'Test News 1',
      snippet: 'This is a test news snippet',
      url: 'https://example.com/1',
      source: 'Test Source',
      publishedAt: '2023-01-01T00:00:00Z',
      jobLossCount: 100,
      sentiment: 'negative',
      impactLevel: 'high'
    },
    {
      id: '2',
      title: 'Test News 2',
      snippet: 'Another test news snippet',
      url: 'https://example.com/2',
      source: 'Test Source 2',
      publishedAt: '2023-01-02T00:00:00Z',
      jobLossCount: 50,
      sentiment: 'neutral',
      impactLevel: 'medium'
    }
  ];

  const defaultProps = {
    items: mockItems,
    selectedItems: [],
    onToggleSelect: jest.fn(),
    onSelectAll: jest.fn(),
    onAnalyze: jest.fn(),
    isAnalyzing: false,
    analysisError: null,
    hasAnalysisResults: false,
    isLoading: false,
    error: null
  };

  it('renders loading state', () => {
    render(<JobLossResults {...defaultProps} isLoading={true} items={[]} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Loading job loss news...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const errorMessage = 'Failed to load news';
    render(
      <JobLossResults
        {...defaultProps}
        items={[]}
        error={errorMessage}
      />
    );
    expect(screen.getByText('Error Loading News')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<JobLossResults {...defaultProps} items={[]} />);
    expect(screen.getByText('No job loss news found')).toBeInTheDocument();
    expect(
      screen.getByText('Try adjusting your search filters or check back later for updates.')
    ).toBeInTheDocument();
  });

  it('renders news items', () => {
    render(<JobLossResults {...defaultProps} />);
    expect(screen.getByText('Test News 1')).toBeInTheDocument();
    expect(screen.getByText('This is a test news snippet')).toBeInTheDocument();
    expect(screen.getByText('Test News 2')).toBeInTheDocument();
    expect(screen.getByText('Another test news snippet')).toBeInTheDocument();
  });

  it('handles item selection', () => {
    const handleToggleSelect = jest.fn();
    render(
      <JobLossResults
        {...defaultProps}
        onToggleSelect={handleToggleSelect}
      />
    );
    
    const checkboxes = screen.getAllByRole('checkbox', { name: /select article/i });
    fireEvent.click(checkboxes[0]);
    expect(handleToggleSelect).toHaveBeenCalledWith('1');
  });

  it('shows analyze button with selected count', () => {
    render(
      <JobLossResults
        {...defaultProps}
        selectedItems={['1', '2']}
      />
    );
    
    const button = screen.getByRole('button', { name: /analyze selected/i });
    expect(button).toHaveTextContent('Analyze Selected (2)');
  });

  it('shows analyzing state', () => {
    render(
      <JobLossResults
        {...defaultProps}
        selectedItems={['1']}
        isAnalyzing={true}
      />
    );
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Analyzing 1 article...')).toBeInTheDocument();
  });

  it('shows analysis error with retry button', () => {
    const handleAnalyze = jest.fn();
    render(
      <JobLossResults
        {...defaultProps}
        analysisError="Analysis failed"
        onAnalyze={handleAnalyze}
      />
    );
    
    expect(screen.getByText('Analysis Error')).toBeInTheDocument();
    expect(screen.getByText('Analysis failed')).toBeInTheDocument();
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    expect(handleAnalyze).toHaveBeenCalled();
  });
});
