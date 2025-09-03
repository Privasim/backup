import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptPanel from '../PromptPanel';

describe('PromptPanel', () => {
  const defaultProps = {
    prompt: '',
    isGenerating: false,
    onPromptChange: jest.fn(),
    onGenerate: jest.fn(),
    disabled: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<PromptPanel {...defaultProps} />);
    
    expect(screen.getByLabelText('Image prompt')).toBeInTheDocument();
    expect(screen.getByText('Generate')).toBeInTheDocument();
    expect(screen.getByText('0/1000')).toBeInTheDocument();
  });

  it('shows loading state when generating', () => {
    render(<PromptPanel {...defaultProps} isGenerating={true} />);
    
    expect(screen.getByText('Generating...')).toBeInTheDocument();
    expect(screen.queryByText('Generate')).not.toBeInTheDocument();
  });

  it('disables the generate button when prompt is empty', () => {
    render(<PromptPanel {...defaultProps} />);
    
    const generateButton = screen.getByText('Generate').closest('button');
    expect(generateButton).toBeDisabled();
  });

  it('enables the generate button when prompt has content', () => {
    render(<PromptPanel {...defaultProps} prompt="Test prompt" />);
    
    const generateButton = screen.getByText('Generate').closest('button');
    expect(generateButton).not.toBeDisabled();
  });

  it('disables the generate button when disabled prop is true', () => {
    render(<PromptPanel {...defaultProps} prompt="Test prompt" disabled={true} />);
    
    const generateButton = screen.getByText('Generate').closest('button');
    expect(generateButton).toBeDisabled();
  });

  it('shows API key warning when disabled', () => {
    render(<PromptPanel {...defaultProps} disabled={true} />);
    
    expect(screen.getByText(/Please add and validate your API key/)).toBeInTheDocument();
  });

  it('calls onPromptChange when typing in the textarea', async () => {
    render(<PromptPanel {...defaultProps} />);
    
    const textarea = screen.getByLabelText('Image prompt');
    await userEvent.type(textarea, 'Hello');
    
    expect(defaultProps.onPromptChange).toHaveBeenCalledWith('Hello');
  });

  it('calls onGenerate when clicking the generate button', () => {
    render(<PromptPanel {...defaultProps} prompt="Test prompt" />);
    
    const generateButton = screen.getByText('Generate').closest('button');
    fireEvent.click(generateButton!);
    
    expect(defaultProps.onGenerate).toHaveBeenCalled();
  });

  it('calls onGenerate when pressing Ctrl+Enter', () => {
    render(<PromptPanel {...defaultProps} prompt="Test prompt" />);
    
    const textarea = screen.getByLabelText('Image prompt');
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    
    expect(defaultProps.onGenerate).toHaveBeenCalled();
  });

  it('limits input to maxLength characters', async () => {
    render(<PromptPanel {...defaultProps} />);
    
    const textarea = screen.getByLabelText('Image prompt');
    const longString = 'a'.repeat(1001);
    
    await userEvent.type(textarea, longString);
    
    // Should only call with the first 1000 characters
    expect(defaultProps.onPromptChange).toHaveBeenCalledWith('a'.repeat(1000));
  });
});
