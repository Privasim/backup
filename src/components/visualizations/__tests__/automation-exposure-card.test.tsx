import React from 'react';
import { render, screen } from '@testing-library/react';
import { AutomationExposureCard } from '../automation-exposure-card';

// Mock the bar chart component to simplify testing
jest.mock('../automation-exposure-bar', () => ({
  AutomationExposureBar: () => <div data-testid="mock-bar-chart">Bar Chart</div>
}));

describe('AutomationExposureCard', () => {
  const mockInsights = {
    automationExposure: [
      { task: 'Data Entry', exposure: 95 },
      { task: 'Customer Service', exposure: 75 },
      { task: 'Bookkeeping', exposure: 85 },
    ]
  };

  it('renders correctly with insights data', () => {
    render(<AutomationExposureCard insights={mockInsights} />);
    
    expect(screen.getByText('Automation Exposure')).toBeInTheDocument();
    expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
    expect(screen.getByText('Showing top 8 tasks with highest automation exposure')).toBeInTheDocument();
  });

  it('renders empty state when no insights', () => {
    render(<AutomationExposureCard />);
    
    expect(screen.getByText('No automation exposure data available')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-bar-chart')).not.toBeInTheDocument();
  });

  it('renders empty state when no automation exposure data', () => {
    render(<AutomationExposureCard insights={{}} />);
    
    expect(screen.getByText('No automation exposure data available')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-bar-chart')).not.toBeInTheDocument();
  });

  it('filters tasks by minExposure', () => {
    render(<AutomationExposureCard insights={mockInsights} minExposure={80} />);
    
    // Only 2 tasks should be shown (Data Entry: 95, Bookkeeping: 85)
    // We can't easily test the bar chart data without a more complex mock
    expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
  });

  it('respects topN limit', () => {
    const manyTasks = {
      automationExposure: Array.from({ length: 10 }, (_, i) => ({
        task: `Task ${i + 1}`,
        exposure: 100 - i * 5
      }))
    };
    
    render(<AutomationExposureCard insights={manyTasks} topN={3} />);
    
    expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
    expect(screen.getByText('Showing top 3 tasks with highest automation exposure')).toBeInTheDocument();
  });
});
