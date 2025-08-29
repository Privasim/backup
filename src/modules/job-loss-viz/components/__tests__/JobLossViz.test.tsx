import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JobLossViz from '../JobLossViz';
import { useJobLossData } from '../../hooks/useJobLossData';

// Mock the hook
jest.mock('../../hooks/useJobLossData');
const mockUseJobLossData = useJobLossData as jest.MockedFunction<typeof useJobLossData>;

describe('JobLossViz', () => {
  const mockData = {
    ytdSeries: [
      { ts: '2025-01-01', value: 10000 },
      { ts: '2025-02-01', value: 15000 },
      { ts: '2025-03-01', value: 20000 },
    ],
    roles: [
      { role: 'Software Engineer', count: 5000, sources: [] },
      { role: 'Data Analyst', count: 3000, sources: [] },
      { role: 'Product Manager', count: 2000, sources: [] },
    ],
    latestSources: [
      { url: 'https://example.com/1', title: 'Source 1', publisher: 'Publisher 1' },
      { url: 'https://example.com/2', title: 'Source 2', publisher: 'Publisher 2' },
    ],
    lastUpdated: '2025-03-15',
    error: undefined,
  };

  beforeEach(() => {
    mockUseJobLossData.mockReturnValue(mockData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main visualization with correct title and year', () => {
    render(<JobLossViz year={2025} />);
    
    expect(screen.getByText(/Global AI‑Related Job Losses \(YTD\) — 2025/i)).toBeInTheDocument();
  });

  it('displays the last updated date when available', () => {
    render(<JobLossViz />);
    
    expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
    expect(screen.getByText(/Mar 15, 2025/i)).toBeInTheDocument();
  });

  it('shows error message when there is an error', () => {
    mockUseJobLossData.mockReturnValue({
      ...mockData,
      error: 'Failed to load data',
    });
    
    render(<JobLossViz />);
    
    expect(screen.getByText(/Failed to load data/i)).toBeInTheDocument();
  });

  it('renders the roles list in a separate card', () => {
    render(<JobLossViz />);
    
    expect(screen.getByText('Most Impacted Roles')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('5,000')).toBeInTheDocument();
  });

  it('opens the source modal when floating action button is clicked', async () => {
    render(<JobLossViz />);
    
    // Find and click the floating action button
    const fabButton = screen.getByRole('button', { name: /view data sources/i });
    fireEvent.click(fabButton);
    
    // Check if modal is displayed
    await waitFor(() => {
      expect(screen.getByText('Data Sources')).toBeInTheDocument();
      expect(screen.getByText('Source 1')).toBeInTheDocument();
      expect(screen.getByText('Source 2')).toBeInTheDocument();
    });
  });

  it('closes the source modal when close button is clicked', async () => {
    render(<JobLossViz />);
    
    // Open the modal
    const fabButton = screen.getByRole('button', { name: /view data sources/i });
    fireEvent.click(fabButton);
    
    // Find and click the close button
    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      fireEvent.click(closeButton);
    });
    
    // Check if modal is closed
    await waitFor(() => {
      expect(screen.queryByText('Data Sources')).not.toBeInTheDocument();
    });
  });

  it('handles empty data gracefully', () => {
    mockUseJobLossData.mockReturnValue({
      ytdSeries: [],
      roles: [],
      latestSources: [],
      lastUpdated: undefined,
      error: undefined,
    });
    
    render(<JobLossViz />);
    
    expect(screen.getByText(/Awaiting data/i)).toBeInTheDocument();
    expect(screen.queryByText('Most Impacted Roles')).not.toBeInTheDocument();
  });
});
