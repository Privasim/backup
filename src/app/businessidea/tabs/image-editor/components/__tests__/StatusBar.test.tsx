import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StatusBar from '../StatusBar';

describe('StatusBar', () => {
  const defaultProps = {
    status: 'idle' as const,
    error: null,
    usage: null,
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when status is idle and no error or usage', () => {
    const { container } = render(<StatusBar {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders loading state with cancel button', () => {
    render(<StatusBar {...defaultProps} status="loading" />);
    
    expect(screen.getByText(/Processing/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('renders error message when error is provided', () => {
    const errorMessage = 'API key validation failed';
    render(<StatusBar {...defaultProps} error={errorMessage} />);
    
    expect(screen.getByText(/Error/i)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders success message when status is success', () => {
    render(<StatusBar {...defaultProps} status="success" />);
    
    expect(screen.getByText(/Operation completed successfully/i)).toBeInTheDocument();
  });

  it('renders usage information when usage is provided', () => {
    const usage = {
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150
    };
    
    render(<StatusBar {...defaultProps} usage={usage} />);
    
    expect(screen.getByText(/Usage/i)).toBeInTheDocument();
    expect(screen.getByText(/Prompt: 100/i)).toBeInTheDocument();
    expect(screen.getByText(/Completion: 50/i)).toBeInTheDocument();
    expect(screen.getByText(/Total: 150/i)).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<StatusBar {...defaultProps} status="loading" />);
    
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('renders both error and usage when both are provided', () => {
    const errorMessage = 'API key validation failed';
    const usage = {
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150
    };
    
    render(<StatusBar {...defaultProps} error={errorMessage} usage={usage} />);
    
    expect(screen.getByText(/Error/i)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(/Usage/i)).toBeInTheDocument();
  });
});
