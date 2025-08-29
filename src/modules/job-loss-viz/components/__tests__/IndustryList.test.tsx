// File: src/modules/job-loss-viz/components/__tests__/IndustryList.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { IndustryList } from '../IndustryList';
import type { IndustryAggregate } from '../../types';

describe('IndustryList', () => {
  const mockIndustries: IndustryAggregate[] = [
    {
      industry: 'Technology',
      count: 5000,
      roles: ['Software Development', 'IT Support'],
      sources: [{ url: 'https://example.com/tech' }]
    },
    {
      industry: 'BPO',
      count: 3000,
      roles: ['Customer Service & Support'],
      sources: [{ url: 'https://example.com/bpo' }]
    },
    {
      industry: 'Financial Services',
      count: 2000,
      roles: ['Financial Analysts (Junior)'],
      sources: [{ url: 'https://example.com/finance' }]
    },
    {
      industry: 'Media & Content',
      count: 1500,
      roles: ['Content Creation / Copywriting'],
      sources: [{ url: 'https://example.com/media' }]
    },
    {
      industry: 'Retail',
      count: 1000,
      roles: ['Retail Sales Associates'],
      sources: [{ url: 'https://example.com/retail' }]
    },
    {
      industry: 'Other',
      count: 500,
      roles: ['Miscellaneous'],
      sources: [{ url: 'https://example.com/other' }]
    }
  ];

  it('renders industry breakdown title', () => {
    render(<IndustryList industries={mockIndustries} />);
    expect(screen.getByText('Industry Breakdown')).toBeInTheDocument();
  });

  it('displays industries with correct percentages', () => {
    render(<IndustryList industries={mockIndustries} />);
    
    // Total count is 13000
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('5,000 (38%)')).toBeInTheDocument();
    
    expect(screen.getByText('BPO')).toBeInTheDocument();
    expect(screen.getByText('3,000 (23%)')).toBeInTheDocument();
  });

  it('limits the number of displayed industries based on maxItems', () => {
    render(<IndustryList industries={mockIndustries} maxItems={3} />);
    
    // Should show the top 3 industries
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('BPO')).toBeInTheDocument();
    expect(screen.getByText('Financial Services')).toBeInTheDocument();
    
    // Should not show the 4th industry
    expect(screen.queryByText('Media & Content')).not.toBeInTheDocument();
    
    // Should show a message about showing limited items
    expect(screen.getByText('Showing top 3 of 6 industries')).toBeInTheDocument();
  });

  it('shows a message when no industries are available', () => {
    render(<IndustryList industries={[]} />);
    expect(screen.getByText('No industry data available')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<IndustryList industries={mockIndustries} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders progress bars with correct ARIA attributes', () => {
    render(<IndustryList industries={mockIndustries} />);
    
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBe(5); // Default maxItems is 5
    
    // Check first progress bar (Technology - 38%)
    expect(progressBars[0]).toHaveAttribute('aria-valuenow', '38');
    expect(progressBars[0]).toHaveAttribute('aria-valuemin', '0');
    expect(progressBars[0]).toHaveAttribute('aria-valuemax', '100');
  });
});
