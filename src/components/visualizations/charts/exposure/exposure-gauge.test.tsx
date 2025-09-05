import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExposureGauge } from './exposure-gauge';

describe('ExposureGauge', () => {
  it('renders with default props', () => {
    render(<ExposureGauge value={50} />);
    
    // Check that the gauge is rendered with correct ARIA attributes
    const gauge = screen.getByRole('img', { name: /automation exposure/i });
    expect(gauge).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    render(<ExposureGauge value={75} size={200} />);
    
    // Check SVG dimensions
    const svg = screen.getByRole('img', { name: /automation exposure/i });
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '100'); // Half of width for semi-circle
  });

  it('renders with custom thresholds', () => {
    render(<ExposureGauge value={60} lowThreshold={30} highThreshold={60} />);
    
    // Check that the badge shows "High" since 60 >= highThreshold
    const badge = screen.getByText('High');
    expect(badge).toBeInTheDocument();
  });

  it('clamps values outside the 0-100 range', () => {
    render(<ExposureGauge value={120} />);
    
    // Value should be clamped to 100%
    const valueText = screen.getByText('100%');
    expect(valueText).toBeInTheDocument();
  });

  it('renders with custom aria label', () => {
    const customLabel = 'Custom automation exposure gauge';
    render(<ExposureGauge value={25} ariaLabel={customLabel} />);
    
    // Check custom aria label
    const gauge = screen.getByRole('img', { name: customLabel });
    expect(gauge).toBeInTheDocument();
  });
});
