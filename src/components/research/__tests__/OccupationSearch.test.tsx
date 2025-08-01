import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import OccupationSearch from '../OccupationSearch';
import { useOccupationSearch } from '../../../hooks/useResearchData';

// Mock the hook
jest.mock('../../../hooks/useResearchData');

const mockUseOccupationSearch = useOccupationSearch as jest.MockedFunction<typeof useOccupationSearch>;

describe('OccupationSearch', () => {
  const mockResults = [
    {
      occupation: {
        code: '15-1252',
        name: 'Software Developers',
        riskScore: 0.96,
        keyTasks: ['Programming', 'Design'],
        tableReferences: ['table_1'],
        confidence: 0.95,
      },
      matchScore: 95,
      matchReasons: ['Exact name match'],
    },
    {
      occupation: {
        code: '15-2051',
        name: 'Data Scientists',
        riskScore: 0.94,
        keyTasks: ['Data analysis', 'Modeling'],
        tableReferences: ['table_1'],
        confidence: 0.95,
      },
      matchScore: 80,
      matchReasons: ['Partial name match'],
    },
  ];

  const mockSearch = jest.fn();
  const mockClearResults = jest.fn();

  beforeEach(() => {
    mockUseOccupationSearch.mockReturnValue({
      results: [],
      search: mockSearch,
      clearResults: mockClearResults,
      isLoading: false,
      error: null,
      isInitialized: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input with placeholder', () => {
    render(<OccupationSearch placeholder="Search occupations..." />);
    
    expect(screen.getByPlaceholderText('Search occupations...')).toBeInTheDocument();
  });

  it('should call search function when typing', async () => {
    const user = userEvent.setup();
    render(<OccupationSearch />);
    
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'software');
    
    // Wait for debounce
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith('software', { limit: 10 });
    }, { timeout: 500 });
  });

  it('should display search results', () => {
    mockUseOccupationSearch.mockReturnValue({
      results: mockResults,
      search: mockSearch,
      clearResults: mockClearResults,
      isLoading: false,
      error: null,
      isInitialized: true,
    });

    render(<OccupationSearch />);
    
    // Simulate typing to show results
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'software' } });
    
    expect(screen.getByText('Software Developers')).toBeInTheDocument();
    expect(screen.getByText('SOC: 15-1252')).toBeInTheDocument();
    expect(screen.getByText('Data Scientists')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseOccupationSearch.mockReturnValue({
      results: [],
      search: mockSearch,
      clearResults: mockClearResults,
      isLoading: true,
      error: null,
      isInitialized: true,
    });

    render(<OccupationSearch />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'software' } });
    
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('should show no results message', () => {
    mockUseOccupationSearch.mockReturnValue({
      results: [],
      search: mockSearch,
      clearResults: mockClearResults,
      isLoading: false,
      error: null,
      isInitialized: true,
    });

    render(<OccupationSearch />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'nonexistent' } });
    
    expect(screen.getByText('No occupations found for "nonexistent"')).toBeInTheDocument();
  });

  it('should call onSelect when occupation is clicked', async () => {
    const mockOnSelect = jest.fn();
    
    mockUseOccupationSearch.mockReturnValue({
      results: mockResults,
      search: mockSearch,
      clearResults: mockClearResults,
      isLoading: false,
      error: null,
      isInitialized: true,
    });

    const user = userEvent.setup();
    render(<OccupationSearch onSelect={mockOnSelect} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'software' } });
    
    const softwareDevButton = screen.getByText('Software Developers');
    await user.click(softwareDevButton);
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockResults[0]);
  });

  it('should display risk scores when enabled', () => {
    mockUseOccupationSearch.mockReturnValue({
      results: mockResults,
      search: mockSearch,
      clearResults: mockClearResults,
      isLoading: false,
      error: null,
      isInitialized: true,
    });

    render(<OccupationSearch showRiskScores={true} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'software' } });
    
    expect(screen.getByText('Very High')).toBeInTheDocument();
    expect(screen.getByText('96.0%')).toBeInTheDocument();
  });

  it('should hide risk scores when disabled', () => {
    mockUseOccupationSearch.mockReturnValue({
      results: mockResults,
      search: mockSearch,
      clearResults: mockClearResults,
      isLoading: false,
      error: null,
      isInitialized: true,
    });

    render(<OccupationSearch showRiskScores={false} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'software' } });
    
    expect(screen.queryByText('Very High')).not.toBeInTheDocument();
    expect(screen.queryByText('96.0%')).not.toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    mockUseOccupationSearch.mockReturnValue({
      results: mockResults,
      search: mockSearch,
      clearResults: mockClearResults,
      isLoading: false,
      error: null,
      isInitialized: true,
    });

    const user = userEvent.setup();
    render(<OccupationSearch />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'software');
    
    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Software Developers')).toBeInTheDocument();
    });

    // Test arrow down navigation
    await user.keyboard('{ArrowDown}');
    
    // First item should be selected (highlighted)
    const firstItem = screen.getByText('Software Developers').closest('button');
    expect(firstItem).toHaveClass('bg-blue-50');

    // Test arrow down again
    await user.keyboard('{ArrowDown}');
    
    // Second item should be selected
    const secondItem = screen.getByText('Data Scientists').closest('button');
    expect(secondItem).toHaveClass('bg-blue-50');
  });

  it('should handle Enter key selection', async () => {
    const mockOnSelect = jest.fn();
    
    mockUseOccupationSearch.mockReturnValue({
      results: mockResults,
      search: mockSearch,
      clearResults: mockClearResults,
      isLoading: false,
      error: null,
      isInitialized: true,
    });

    const user = userEvent.setup();
    render(<OccupationSearch onSelect={mockOnSelect} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'software');
    
    await waitFor(() => {
      expect(screen.getByText('Software Developers')).toBeInTheDocument();
    });

    // Navigate to first item and press Enter
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockResults[0]);
  });

  it('should handle Escape key', async () => {
    mockUseOccupationSearch.mockReturnValue({
      results: mockResults,
      search: mockSearch,
      clearResults: mockClearResults,
      isLoading: false,
      error: null,
      isInitialized: true,
    });

    const user = userEvent.setup();
    render(<OccupationSearch />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'software');
    
    await waitFor(() => {
      expect(screen.getByText('Software Developers')).toBeInTheDocument();
    });

    // Press Escape to close dropdown
    await user.keyboard('{Escape}');
    
    // Results should be hidden
    expect(screen.queryByText('Software Developers')).not.toBeInTheDocument();
  });

  it('should clear input when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<OccupationSearch />);
    
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, 'software');
    
    expect(input.value).toBe('software');
    
    const clearButton = screen.getByRole('button');
    await user.click(clearButton);
    
    expect(input.value).toBe('');
    expect(mockClearResults).toHaveBeenCalled();
  });

  it('should respect maxResults prop', async () => {
    const user = userEvent.setup();
    render(<OccupationSearch maxResults={5} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'software');
    
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith('software', { limit: 5 });
    });
  });

  it('should display match reasons', () => {
    mockUseOccupationSearch.mockReturnValue({
      results: mockResults,
      search: mockSearch,
      clearResults: mockClearResults,
      isLoading: false,
      error: null,
      isInitialized: true,
    });

    render(<OccupationSearch />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'software' } });
    
    expect(screen.getByText('Match: Exact name match')).toBeInTheDocument();
    expect(screen.getByText('Match: Partial name match')).toBeInTheDocument();
  });

  it('should close dropdown when clicking outside', async () => {
    mockUseOccupationSearch.mockReturnValue({
      results: mockResults,
      search: mockSearch,
      clearResults: mockClearResults,
      isLoading: false,
      error: null,
      isInitialized: true,
    });

    const user = userEvent.setup();
    render(
      <div>
        <OccupationSearch />
        <div data-testid="outside">Outside element</div>
      </div>
    );
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'software');
    
    await waitFor(() => {
      expect(screen.getByText('Software Developers')).toBeInTheDocument();
    });

    // Click outside
    const outsideElement = screen.getByTestId('outside');
    await user.click(outsideElement);
    
    // Results should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Software Developers')).not.toBeInTheDocument();
    });
  });
});