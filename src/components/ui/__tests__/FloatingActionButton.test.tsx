import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingActionButton } from '../FloatingActionButton';

describe('FloatingActionButton', () => {
  const mockOnClick = jest.fn();
  const testIcon = <span data-testid="test-icon">Icon</span>;
  const testLabel = 'Test Button';

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders correctly with default props', () => {
    render(
      <FloatingActionButton 
        onClick={mockOnClick} 
        icon={testIcon} 
        ariaLabel={testLabel} 
      />
    );
    
    const button = screen.getByRole('button', { name: testLabel });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(
      <FloatingActionButton 
        onClick={mockOnClick} 
        icon={testIcon} 
        ariaLabel={testLabel} 
      />
    );
    
    const button = screen.getByRole('button', { name: testLabel });
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events correctly', () => {
    render(
      <FloatingActionButton 
        onClick={mockOnClick} 
        icon={testIcon} 
        ariaLabel={testLabel} 
      />
    );
    
    const button = screen.getByRole('button', { name: testLabel });
    
    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    
    // Test Space key
    fireEvent.keyDown(button, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  it('applies correct position classes', () => {
    const { rerender } = render(
      <FloatingActionButton 
        onClick={mockOnClick} 
        icon={testIcon} 
        ariaLabel={testLabel}
        position="top-left"
      />
    );
    
    let button = screen.getByRole('button', { name: testLabel });
    expect(button.className).toContain('top-4 left-4');
    
    rerender(
      <FloatingActionButton 
        onClick={mockOnClick} 
        icon={testIcon} 
        ariaLabel={testLabel}
        position="bottom-right"
      />
    );
    
    button = screen.getByRole('button', { name: testLabel });
    expect(button.className).toContain('bottom-4 right-4');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(
      <FloatingActionButton 
        onClick={mockOnClick} 
        icon={testIcon} 
        ariaLabel={testLabel}
        size="sm"
      />
    );
    
    let button = screen.getByRole('button', { name: testLabel });
    expect(button.className).toContain('w-10 h-10');
    
    rerender(
      <FloatingActionButton 
        onClick={mockOnClick} 
        icon={testIcon} 
        ariaLabel={testLabel}
        size="lg"
      />
    );
    
    button = screen.getByRole('button', { name: testLabel });
    expect(button.className).toContain('w-14 h-14');
  });

  it('applies custom className', () => {
    render(
      <FloatingActionButton 
        onClick={mockOnClick} 
        icon={testIcon} 
        ariaLabel={testLabel}
        className="custom-class"
      />
    );
    
    const button = screen.getByRole('button', { name: testLabel });
    expect(button.className).toContain('custom-class');
  });

  it('autofocuses when autoFocus is true', () => {
    render(
      <FloatingActionButton 
        onClick={mockOnClick} 
        icon={testIcon} 
        ariaLabel={testLabel}
        autoFocus={true}
      />
    );
    
    const button = screen.getByRole('button', { name: testLabel });
    expect(button).toHaveFocus();
  });
});
