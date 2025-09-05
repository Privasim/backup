import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AutomationExposureCard } from './automation-exposure-card';
import { DataDrivenInsightsModel } from '../insights/types';

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

// Mock the ExposureGauge component
jest.mock('./charts/exposure/exposure-gauge', () => ({
  ExposureGauge: ({ value, ariaLabel }: { value: number; ariaLabel?: string }) => (
    <div data-testid="mock-exposure-gauge" aria-label={ariaLabel}>
      Gauge: {value}%
    </div>
  ),
}));

describe('AutomationExposureCard', () => {
  const mockInsights: Partial<DataDrivenInsightsModel> = {
    automationExposure: [
      { task: 'Task 1', exposure: 80 },
      { task: 'Task 2', exposure: 60 },
      { task: 'Task 3', exposure: 40 },
      { task: 'Task 4', exposure: 20 },
      { task: 'Task 5', exposure: 10 },
    ],
    narratives: {
      automationNarrative: 'This is a test automation narrative.'
    },
    sources: [
      { title: 'Source 1', url: 'https://example.com/1' },
      { title: 'Source 2', url: 'https://example.com/2' },
    ]
  };

  it('renders with data', () => {
    render(
      <AutomationExposureCard 
        insights={mockInsights as DataDrivenInsightsModel} 
        title="Test Exposure Card" 
        topN={3}
      />
    );
    
    // Check title
    expect(screen.getByText('Test Exposure Card')).toBeInTheDocument();
    
    // Check KPI tiles
    expect(screen.getByText('Average Exposure')).toBeInTheDocument();
    expect(screen.getByText('High-risk Tasks')).toBeInTheDocument();
    expect(screen.getByText('Tasks Assessed')).toBeInTheDocument();
    expect(screen.getByText('Above Threshold')).toBeInTheDocument();
    
    // Check gauge component
    expect(screen.getByTestId('mock-exposure-gauge')).toBeInTheDocument();
    
    // Check bar chart section
    expect(screen.getByText('Highest Exposure Tasks')).toBeInTheDocument();
  });

  it('handles empty data', () => {
    render(
      <AutomationExposureCard 
        insights={{} as DataDrivenInsightsModel} 
        title="Empty Card" 
      />
    );
    
    expect(screen.getByText('No automation exposure data available')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(
      <AutomationExposureCard 
        loading={true}
        title="Loading Card" 
      />
    );
    
    expect(screen.getByText('Loading automation exposure data...')).toBeInTheDocument();
  });

  it('handles error state', () => {
    render(
      <AutomationExposureCard 
        error="Test error message"
        title="Error Card" 
      />
    );
    
    expect(screen.getByText('Error loading automation exposure data')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('toggles expanded state', () => {
    render(
      <AutomationExposureCard 
        insights={mockInsights as DataDrivenInsightsModel} 
        title="Expandable Card" 
      />
    );
    
    // Initially expanded
    expect(screen.getByText('This is a test automation narrative.')).toBeInTheDocument();
    
    // Click to collapse
    fireEvent.click(screen.getByText('Collapse'));
    
    // Now collapsed
    expect(screen.queryByText('This is a test automation narrative.')).not.toBeInTheDocument();
    
    // Click to expand again
    fireEvent.click(screen.getByText('Expand'));
    
    // Now expanded again
    expect(screen.getByText('This is a test automation narrative.')).toBeInTheDocument();
  });

  it('copies content to clipboard', async () => {
    render(
      <AutomationExposureCard 
        insights={mockInsights as DataDrivenInsightsModel} 
        title="Copy Test Card" 
      />
    );
    
    // Click copy button
    fireEvent.click(screen.getByText('Copy'));
    
    // Check that clipboard API was called
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    
    // Check that button text changes to "Copied"
    expect(screen.getByText('Copied')).toBeInTheDocument();
  });

  it('filters by minimum exposure', () => {
    render(
      <AutomationExposureCard 
        insights={mockInsights as DataDrivenInsightsModel} 
        title="Filtered Card" 
        minExposure={50}
      />
    );
    
    // Should show filtering message
    expect(screen.getByText(/Filtered by minimum exposure ≥ 50%/)).toBeInTheDocument();
  });
});
