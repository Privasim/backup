import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConfigPanel from '../ConfigPanel';

describe('ConfigPanel', () => {
  const defaultProps = {
    apiKey: '',
    model: 'google/gemini-2.5-flash-image-preview:free',
    availableModels: [
      'google/gemini-2.5-flash-image-preview:free',
      'anthropic/claude-3-opus:vision'
    ],
    isValidating: false,
    validationError: null,
    onApiKeyChange: jest.fn(),
    onValidateKey: jest.fn().mockResolvedValue(true),
    onPersistToggle: jest.fn(),
    onRemoveKey: jest.fn(),
    onModelChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with empty API key', () => {
    render(<ConfigPanel {...defaultProps} />);
    
    expect(screen.getByLabelText(/OpenRouter API Key/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Validate Key/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Remove Key/i })).toBeDisabled();
  });

  it('enables validate button when API key is provided', () => {
    render(<ConfigPanel {...defaultProps} apiKey="test-api-key" />);
    
    expect(screen.getByRole('button', { name: /Validate Key/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Remove Key/i })).toBeEnabled();
  });

  it('calls onApiKeyChange when input changes', () => {
    render(<ConfigPanel {...defaultProps} />);
    
    const input = screen.getByLabelText(/OpenRouter API Key/i);
    fireEvent.change(input, { target: { value: 'new-api-key' } });
    
    expect(defaultProps.onApiKeyChange).toHaveBeenCalledWith('new-api-key');
  });

  it('toggles API key visibility when eye icon is clicked', () => {
    render(<ConfigPanel {...defaultProps} apiKey="test-api-key" />);
    
    const input = screen.getByLabelText(/OpenRouter API Key/i);
    expect(input).toHaveAttribute('type', 'password');
    
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button
    fireEvent.click(toggleButton);
    
    expect(input).toHaveAttribute('type', 'text');
  });

  it('calls onValidateKey when validate button is clicked', async () => {
    render(<ConfigPanel {...defaultProps} apiKey="test-api-key" />);
    
    const validateButton = screen.getByRole('button', { name: /Validate Key/i });
    fireEvent.click(validateButton);
    
    expect(defaultProps.onValidateKey).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(screen.getByText(/API key is valid/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when validation fails', async () => {
    const onValidateKey = jest.fn().mockResolvedValue(false);
    render(
      <ConfigPanel 
        {...defaultProps} 
        apiKey="invalid-key" 
        onValidateKey={onValidateKey}
        validationError="Invalid API key format"
      />
    );
    
    const validateButton = screen.getByRole('button', { name: /Validate Key/i });
    fireEvent.click(validateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid API key format/i)).toBeInTheDocument();
    });
  });

  it('calls onPersistToggle when persist checkbox is toggled', () => {
    render(<ConfigPanel {...defaultProps} apiKey="test-api-key" />);
    
    const checkbox = screen.getByLabelText(/Remember API key/i);
    fireEvent.click(checkbox);
    
    expect(defaultProps.onPersistToggle).toHaveBeenCalledWith(true);
  });

  it('calls onRemoveKey when remove button is clicked', () => {
    render(<ConfigPanel {...defaultProps} apiKey="test-api-key" />);
    
    const removeButton = screen.getByRole('button', { name: /Remove Key/i });
    fireEvent.click(removeButton);
    
    expect(defaultProps.onRemoveKey).toHaveBeenCalled();
  });

  it('calls onModelChange when model is changed', () => {
    render(<ConfigPanel {...defaultProps} apiKey="test-api-key" />);
    
    const select = screen.getByLabelText(/Image Model/i);
    fireEvent.change(select, { target: { value: 'anthropic/claude-3-opus:vision' } });
    
    expect(defaultProps.onModelChange).toHaveBeenCalledWith('anthropic/claude-3-opus:vision');
  });

  it('disables validate button during validation', () => {
    render(<ConfigPanel {...defaultProps} apiKey="test-api-key" isValidating={true} />);
    
    expect(screen.getByRole('button', { name: /Validating/i })).toBeDisabled();
  });
});
