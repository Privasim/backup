import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpecsSettingsPanel } from '../SpecsSettingsPanel';

describe('SpecsSettingsPanel', () => {
  const mockSettings = {
    length: 10 as const,
    systemPrompt: 'Test prompt',
  };

  const mockOnChangeLength = jest.fn();
  const mockOnChangeSystemPrompt = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default header', () => {
    render(
      <SpecsSettingsPanel
        settings={mockSettings}
        onChangeLength={mockOnChangeLength}
        onChangeSystemPrompt={mockOnChangeSystemPrompt}
      />
    );

    // Check that the header is rendered by default
    expect(screen.getByText('Specification Settings')).toBeInTheDocument();
    
    // Check that the length options are rendered
    expect(screen.getByText('5 lines')).toBeInTheDocument();
    expect(screen.getByText('10 lines')).toBeInTheDocument();
    expect(screen.getByText('15 lines')).toBeInTheDocument();
    
    // Check that the system prompt textarea is rendered
    const textarea = screen.getByPlaceholderText('Enter custom instructions for the specification generator...');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Test prompt');
  });

  it('does not render header when showHeader is false', () => {
    render(
      <SpecsSettingsPanel
        settings={mockSettings}
        onChangeLength={mockOnChangeLength}
        onChangeSystemPrompt={mockOnChangeSystemPrompt}
        showHeader={false}
      />
    );

    // Header should not be in the document when showHeader is false
    expect(screen.queryByText('Specification Settings')).not.toBeInTheDocument();
  });

  it('calls onChangeLength when a length button is clicked', () => {
    render(
      <SpecsSettingsPanel
        settings={mockSettings}
        onChangeLength={mockOnChangeLength}
        onChangeSystemPrompt={mockOnChangeSystemPrompt}
      />
    );

    const lengthButton = screen.getByText('5 lines');
    fireEvent.click(lengthButton);
    
    expect(mockOnChangeLength).toHaveBeenCalledWith(5);
  });

  it('calls onChangeSystemPrompt when textarea value changes', () => {
    jest.useFakeTimers();
    
    render(
      <SpecsSettingsPanel
        settings={mockSettings}
        onChangeLength={mockOnChangeLength}
        onChangeSystemPrompt={mockOnChangeSystemPrompt}
      />
    );

    const textarea = screen.getByPlaceholderText('Enter custom instructions for the specification generator...');
    fireEvent.change(textarea, { target: { value: 'Updated prompt' } });
    
    // Fast-forward the debounce timer
    jest.advanceTimersByTime(300);
    
    expect(mockOnChangeSystemPrompt).toHaveBeenCalledWith('Updated prompt');
    
    jest.useRealTimers();
  });

  it('shows character count for system prompt', () => {
    render(
      <SpecsSettingsPanel
        settings={mockSettings}
        onChangeLength={mockOnChangeLength}
        onChangeSystemPrompt={mockOnChangeSystemPrompt}
      />
    );

    // Check that character count is displayed
    expect(screen.getByText('12/1000')).toBeInTheDocument(); // 'Test prompt' is 12 characters
  });

  it('renders helper text for system prompt', () => {
    render(
      <SpecsSettingsPanel
        settings={mockSettings}
        onChangeLength={mockOnChangeLength}
        onChangeSystemPrompt={mockOnChangeSystemPrompt}
      />
    );

    // Check that helper text is displayed
    expect(screen.getByText('Customize how the specification is generated. This will be used as part of the system prompt.')).toBeInTheDocument();
  });
});
