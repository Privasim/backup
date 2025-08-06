import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SystemPromptSection } from '../SystemPromptSection';
import { AnalysisConfig } from '../types';

const mockConfig: AnalysisConfig = {
  type: 'profile',
  model: 'test-model',
  apiKey: 'test-key',
  customPrompt: ''
};

const mockOnConfigUpdate = jest.fn();
const mockOnToggleExpanded = jest.fn();

describe('SystemPromptSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders collapsed state correctly', () => {
    render(
      <SystemPromptSection
        config={mockConfig}
        onConfigUpdate={mockOnConfigUpdate}
        isExpanded={false}
        onToggleExpanded={mockOnToggleExpanded}
      />
    );

    expect(screen.getByText('System Prompt')).toBeInTheDocument();
    expect(screen.queryByText('Custom System Prompt')).not.toBeInTheDocument();
  });

  it('shows active indicator when prompt is set', () => {
    const configWithPrompt = { ...mockConfig, customPrompt: 'You are a test prompt' };
    
    render(
      <SystemPromptSection
        config={configWithPrompt}
        onConfigUpdate={mockOnConfigUpdate}
        isExpanded={false}
        onToggleExpanded={mockOnToggleExpanded}
      />
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders expanded state with all controls', () => {
    render(
      <SystemPromptSection
        config={mockConfig}
        onConfigUpdate={mockOnConfigUpdate}
        isExpanded={true}
        onToggleExpanded={mockOnToggleExpanded}
      />
    );

    expect(screen.getByText('Quick Templates')).toBeInTheDocument();
    expect(screen.getByText('Custom System Prompt')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Define how the AI should behave/)).toBeInTheDocument();
  });

  it('handles prompt text changes', async () => {
    render(
      <SystemPromptSection
        config={mockConfig}
        onConfigUpdate={mockOnConfigUpdate}
        isExpanded={true}
        onToggleExpanded={mockOnToggleExpanded}
      />
    );

    const textarea = screen.getByPlaceholderText(/Define how the AI should behave/);
    fireEvent.change(textarea, { target: { value: 'Test prompt' } });

    await waitFor(() => {
      expect(mockOnConfigUpdate).toHaveBeenCalledWith({ customPrompt: 'Test prompt' });
    });
  });

  it('shows template selector when browse is clicked', async () => {
    render(
      <SystemPromptSection
        config={mockConfig}
        onConfigUpdate={mockOnConfigUpdate}
        isExpanded={true}
        onToggleExpanded={mockOnToggleExpanded}
      />
    );

    const browseButton = screen.getByText('Browse');
    fireEvent.click(browseButton);

    await waitFor(() => {
      expect(screen.getByText('Communication Style')).toBeInTheDocument();
      expect(screen.getByText('Analysis Depth')).toBeInTheDocument();
      expect(screen.getByText('Focus Areas')).toBeInTheDocument();
    });
  });

  it('applies template when selected', async () => {
    render(
      <SystemPromptSection
        config={mockConfig}
        onConfigUpdate={mockOnConfigUpdate}
        isExpanded={true}
        onToggleExpanded={mockOnToggleExpanded}
      />
    );

    // Open template selector
    fireEvent.click(screen.getByText('Browse'));

    await waitFor(() => {
      const templateButton = screen.getByText('Professional & Formal');
      fireEvent.click(templateButton);
    });

    await waitFor(() => {
      expect(mockOnConfigUpdate).toHaveBeenCalledWith({
        customPrompt: expect.stringContaining('senior career consultant')
      });
    });
  });

  it('clears prompt when clear button is clicked', async () => {
    const configWithPrompt = { ...mockConfig, customPrompt: 'Test prompt' };
    
    render(
      <SystemPromptSection
        config={configWithPrompt}
        onConfigUpdate={mockOnConfigUpdate}
        isExpanded={true}
        onToggleExpanded={mockOnToggleExpanded}
      />
    );

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockOnConfigUpdate).toHaveBeenCalledWith({ customPrompt: '' });
    });
  });

  it('shows validation errors for invalid prompts', () => {
    const configWithShortPrompt = { ...mockConfig, customPrompt: 'Hi' };
    
    render(
      <SystemPromptSection
        config={configWithShortPrompt}
        onConfigUpdate={mockOnConfigUpdate}
        isExpanded={true}
        onToggleExpanded={mockOnToggleExpanded}
      />
    );

    expect(screen.getByText(/must be at least/)).toBeInTheDocument();
  });

  it('shows character count', () => {
    const configWithPrompt = { ...mockConfig, customPrompt: 'Test prompt with some content' };
    
    render(
      <SystemPromptSection
        config={configWithPrompt}
        onConfigUpdate={mockOnConfigUpdate}
        isExpanded={true}
        onToggleExpanded={mockOnToggleExpanded}
      />
    );

    expect(screen.getByText(/\/2000/)).toBeInTheDocument();
  });
});