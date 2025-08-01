import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary } from 'react-error-boundary';
import RiskComparisonChart from '../RiskComparisonChart';
import OccupationSearch from '../OccupationSearch';
import { useOccupationSearch } from '../../../hooks/useResearchData';

// Mock the hook to throw errors
jest.mock('../../../hooks/useResearchData');
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart">Chart</div>,
}));
jest.mock('chart.js', () => ({
  Chart: { register: jest.fn() },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

const mockUseOccupationSearch = useOccupationSearch as jest.MockedFunction<typeof useOccupationSearch>;

// Component that throws an error
const ErrorThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div role="alert" data-testid="error-fallback">
    <h2>Something went wrong:</h2>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

describe('Error Boundary Integration', () => {
  beforeEach(() => {
    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should catch and display errors in research components', () => {
    render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong:')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should not catch errors when components work normally', () => {
    render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ErrorThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument();
  });

  it('should handle RiskComparisonChart errors gracefully', () => {
    // Mock Chart.js to throw an error
    jest.doMock('react-chartjs-2', () => ({
      Bar: () => {
        throw new Error('Chart rendering failed');
      },
    }));

    const mockData = {
      userRisk: 0.75,
      benchmarkRisk: 0.85,
      occupation: 'Software Developer',
      percentile: 65,
    };

    render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <RiskComparisonChart data={mockData} />
      </ErrorBoundary>
    );

    // Should show error fallback instead of crashing
    expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
  });

  it('should handle OccupationSearch hook errors', () => {
    // Mock the hook to throw an error
    mockUseOccupationSearch.mockImplementation(() => {
      throw new Error('Hook initialization failed');
    });

    render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <OccupationSearch />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    expect(screen.getByText('Hook initialization failed')).toBeInTheDocument();
  });

  it('should provide error recovery mechanism', () => {
    let shouldThrow = true;

    const RecoverableComponent = () => {
      if (shouldThrow) {
        throw new Error('Recoverable error');
      }
      return <div data-testid="recovered">Component recovered</div>;
    };

    const CustomErrorFallback = ({ resetErrorBoundary }: any) => (
      <div data-testid="error-fallback">
        <button
          onClick={() => {
            shouldThrow = false;
            resetErrorBoundary();
          }}
          data-testid="recover-button"
        >
          Recover
        </button>
      </div>
    );

    const { rerender } = render(
      <ErrorBoundary FallbackComponent={CustomErrorFallback}>
        <RecoverableComponent />
      </ErrorBoundary>
    );

    // Should show error initially
    expect(screen.getByTestId('error-fallback')).toBeInTheDocument();

    // Click recover button
    const recoverButton = screen.getByTestId('recover-button');
    recoverButton.click();

    // Re-render to trigger recovery
    rerender(
      <ErrorBoundary FallbackComponent={CustomErrorFallback}>
        <RecoverableComponent />
      </ErrorBoundary>
    );

    // Should show recovered component
    expect(screen.getByTestId('recovered')).toBeInTheDocument();
  });

  it('should handle multiple nested error boundaries', () => {
    const OuterErrorFallback = () => (
      <div data-testid="outer-error">Outer error boundary</div>
    );

    const InnerErrorFallback = () => (
      <div data-testid="inner-error">Inner error boundary</div>
    );

    render(
      <ErrorBoundary FallbackComponent={OuterErrorFallback}>
        <div>
          <ErrorBoundary FallbackComponent={InnerErrorFallback}>
            <ErrorThrowingComponent shouldThrow={true} />
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    );

    // Inner error boundary should catch the error
    expect(screen.getByTestId('inner-error')).toBeInTheDocument();
    expect(screen.queryByTestId('outer-error')).not.toBeInTheDocument();
  });

  it('should handle async errors in research components', async () => {
    const AsyncErrorComponent = () => {
      React.useEffect(() => {
        // Simulate async error
        setTimeout(() => {
          throw new Error('Async error');
        }, 0);
      }, []);

      return <div>Async component</div>;
    };

    // Note: Error boundaries don't catch async errors by default
    // This test demonstrates the limitation and need for proper error handling in async operations
    render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AsyncErrorComponent />
      </ErrorBoundary>
    );

    // Component should render normally since error boundary doesn't catch async errors
    expect(screen.getByText('Async component')).toBeInTheDocument();
    expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument();
  });

  it('should provide error context information', () => {
    const ErrorWithContext = () => {
      const error = new Error('Context error');
      error.stack = 'Error stack trace...';
      throw error;
    };

    const DetailedErrorFallback = ({ error }: any) => (
      <div data-testid="detailed-error">
        <h3>Error Details:</h3>
        <p data-testid="error-message">{error.message}</p>
        <details>
          <summary>Stack Trace</summary>
          <pre data-testid="error-stack">{error.stack}</pre>
        </details>
      </div>
    );

    render(
      <ErrorBoundary FallbackComponent={DetailedErrorFallback}>
        <ErrorWithContext />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('detailed-error')).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toHaveTextContent('Context error');
    expect(screen.getByTestId('error-stack')).toHaveTextContent('Error stack trace...');
  });
});