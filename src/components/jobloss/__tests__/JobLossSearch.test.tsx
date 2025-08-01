import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JobLossSearch from '../JobLossSearch';

describe('JobLossSearch', () => {
  const defaultProps = {
    onSearch: jest.fn(),
    onFilterChange: jest.fn(),
    filters: {
      query: '',
      source: '',
      fromDate: '',
      toDate: ''
    },
    isLoading: false
  };

  it('renders search form with all fields', () => {
    render(<JobLossSearch {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Search for job loss news...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter by source...')).toBeInTheDocument();
    expect(screen.getByLabelText(/from/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted', () => {
    const handleSearch = jest.fn(e => e.preventDefault());
    render(
      <JobLossSearch
        {...defaultProps}
        onSearch={handleSearch}
      />
    );
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    
    expect(handleSearch).toHaveBeenCalled();
  });

  it('updates search query when input changes', () => {
    const handleFilterChange = jest.fn();
    render(
      <JobLossSearch
        {...defaultProps}
        onFilterChange={handleFilterChange}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search for job loss news...');
    fireEvent.change(searchInput, { target: { value: 'AI job losses' } });
    
    expect(handleFilterChange).toHaveBeenCalledWith('query', 'AI job losses');
  });

  it('updates source filter when source input changes', () => {
    const handleFilterChange = jest.fn();
    render(
      <JobLossSearch
        {...defaultProps}
        onFilterChange={handleFilterChange}
      />
    );
    
    const sourceInput = screen.getByPlaceholderText('Filter by source...');
    fireEvent.change(sourceInput, { target: { value: 'BBC' } });
    
    expect(handleFilterChange).toHaveBeenCalledWith('source', 'BBC');
  });

  it('shows loading state', () => {
    render(<JobLossSearch {...defaultProps} isLoading={true} />);
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('calls onFilterChange when date filters change', () => {
    const handleFilterChange = jest.fn();
    render(
      <JobLossSearch
        {...defaultProps}
        onFilterChange={handleFilterChange}
      />
    );
    
    const fromDateInput = screen.getByLabelText(/from/i);
    fireEvent.change(fromDateInput, { target: { value: '2023-01-01' } });
    expect(handleFilterChange).toHaveBeenCalledWith('fromDate', '2023-01-01');
    
    const toDateInput = screen.getByLabelText(/to/i);
    fireEvent.change(toDateInput, { target: { value: '2023-01-31' } });
    expect(handleFilterChange).toHaveBeenCalledWith('toDate', '2023-01-31');
  });
});
