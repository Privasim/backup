import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpecsSettingsDialog } from '../SpecsSettingsDialog';
import { SpecsGeneratorProvider } from '../../SpecsGeneratorProvider';

// Mock the useSpecsGenerator hook
jest.mock('../../useSpecsGenerator', () => ({
  useSpecsGenerator: () => ({
    settings: {
      length: 10 as const,
      systemPrompt: 'Test prompt',
    },
    actions: {
      updateSettings: jest.fn(),
      setLength: jest.fn(),
      setSystemPrompt: jest.fn(),
      generate: jest.fn(),
      cancel: jest.fn(),
      reset: jest.fn(),
    },
    state: {
      status: 'idle',
      preview: '',
      result: null,
      error: null,
    },
  }),
}));

describe('SpecsSettingsDialog', () => {
  const onCloseMock = jest.fn();

  beforeEach(() => {
    onCloseMock.mockClear();
  });

  it('renders correctly when open', () => {
    render(
      <SpecsGeneratorProvider>
        <SpecsSettingsDialog isOpen={true} onClose={onCloseMock} />
      </SpecsGeneratorProvider>
    );

    // Check that the dialog title is rendered
    expect(screen.getByText('Specification Settings')).toBeInTheDocument();
    
    // Check that the settings panel is rendered
    expect(screen.getByText('Specification Length')).toBeInTheDocument();
    expect(screen.getByText('System Prompt')).toBeInTheDocument();
    
    // Check that the buttons are rendered
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <SpecsGeneratorProvider>
        <SpecsSettingsDialog isOpen={false} onClose={onCloseMock} />
      </SpecsGeneratorProvider>
    );

    // Dialog should not be in the document when closed
    expect(screen.queryByText('Specification Settings')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <SpecsGeneratorProvider>
        <SpecsSettingsDialog isOpen={true} onClose={onCloseMock} />
      </SpecsGeneratorProvider>
    );

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <SpecsGeneratorProvider>
        <SpecsSettingsDialog isOpen={true} onClose={onCloseMock} />
      </SpecsGeneratorProvider>
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
