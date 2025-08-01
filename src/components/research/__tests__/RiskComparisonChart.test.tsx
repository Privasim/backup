import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RiskComparisonChart, { RiskComparisonData } from '../RiskComparisonChart';

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: any) => (
    <div data-testid="bar-chart">
      <div data-testid="chart-title">{options.plugins.title.text}</div>
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
    </div>
  ),
}));

jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

describe('RiskComparisonChart', () => {
  const mockData: RiskComparisonData = {
    userRisk: 0.75,
    benchmarkRisk: 0.85,
    occupation: 'Software Developer',
    percentile: 65,
  };

  it('should render chart with correct title', () => {
    render(<RiskComparisonChart data={mockData} />);
    
    expect(screen.getByTestId('chart-title')).toHaveTextContent(
      'AI Exposure Risk: Software Developer'
    );
  });

  it('should display risk levels correctly', () => {
    render(<RiskComparisonChart data={mockData} />);
    
    expect(screen.getByText('High (75.0%)')).toBeInTheDocument();
    expect(screen.getByText('Very High (85.0%)')).toBeInTheDocument();
  });

  it('should show percentile when enabled', () => {
    render(<RiskComparisonChart data={mockData} showPercentile={true} />);
    
    expect(screen.getByText('65th percentile')).toBeInTheDocument();
  });

  it('should hide percentile when disabled', () => {
    render(<RiskComparisonChart data={mockData} showPercentile={false} />);
    
    expect(screen.queryByText('65th percentile')).not.toBeInTheDocument();
  });

  it('should display comparison text correctly', () => {
    render(<RiskComparisonChart data={mockData} />);
    
    expect(screen.getByText('Your risk is 10.0% lower than the benchmark')).toBeInTheDocument();
  });

  it('should handle similar risk levels', () => {
    const similarData: RiskComparisonData = {
      userRisk: 0.83,
      benchmarkRisk: 0.85,
      occupation: 'Software Developer',
      percentile: 65,
    };

    render(<RiskComparisonChart data={similarData} />);
    
    expect(screen.getByText('Your risk is similar to the benchmark')).toBeInTheDocument();
  });

  it('should handle higher user risk', () => {
    const higherRiskData: RiskComparisonData = {
      userRisk: 0.95,
      benchmarkRisk: 0.85,
      occupation: 'Software Developer',
      percentile: 85,
    };

    render(<RiskComparisonChart data={higherRiskData} />);
    
    expect(screen.getByText('Your risk is 10.0% higher than the benchmark')).toBeInTheDocument();
  });

  it('should apply correct risk colors', () => {
    const { container } = render(<RiskComparisonChart data={mockData} />);
    
    // Check that risk level badges have appropriate styling
    const userRiskBadge = screen.getByText('High (75.0%)');
    const benchmarkRiskBadge = screen.getByText('Very High (85.0%)');
    
    expect(userRiskBadge).toHaveClass('font-semibold');
    expect(benchmarkRiskBadge).toHaveClass('font-semibold');
  });

  it('should handle animation prop', async () => {
    const { rerender } = render(<RiskComparisonChart data={mockData} animated={true} />);
    
    // Component should start with opacity-0 and transition to opacity-100
    await waitFor(() => {
      const chartContainer = screen.getByTestId('bar-chart').parentElement;
      expect(chartContainer).toHaveClass('opacity-100');
    });

    // Test without animation
    rerender(<RiskComparisonChart data={mockData} animated={false} />);
    
    const chartContainer = screen.getByTestId('bar-chart').parentElement;
    expect(chartContainer).toHaveClass('opacity-100');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <RiskComparisonChart data={mockData} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle different risk levels correctly', () => {
    const testCases = [
      { risk: 0.2, expectedLevel: 'Low' },
      { risk: 0.5, expectedLevel: 'Medium' },
      { risk: 0.7, expectedLevel: 'High' },
      { risk: 0.9, expectedLevel: 'Very High' },
    ];

    testCases.forEach(({ risk, expectedLevel }) => {
      const testData: RiskComparisonData = {
        userRisk: risk,
        benchmarkRisk: 0.5,
        occupation: 'Test Occupation',
        percentile: 50,
      };

      const { unmount } = render(<RiskComparisonChart data={testData} />);
      
      expect(screen.getByText(`${expectedLevel} (${(risk * 100).toFixed(1)}%)`)).toBeInTheDocument();
      
      unmount();
    });
  });

  it('should pass correct data to chart component', () => {
    render(<RiskComparisonChart data={mockData} />);
    
    const chartData = screen.getByTestId('chart-data');
    const parsedData = JSON.parse(chartData.textContent || '{}');
    
    expect(parsedData.labels).toEqual(['Your Risk', 'Benchmark Risk']);
    expect(parsedData.datasets[0].data).toEqual([75, 85]); // Converted to percentages
    expect(parsedData.datasets[0].label).toBe('AI Exposure Risk');
  });
});