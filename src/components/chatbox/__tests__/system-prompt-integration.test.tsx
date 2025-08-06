import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatboxProvider } from '../ChatboxProvider';
import { ChatboxControls } from '../ChatboxControls';

// Mock the analysis service
jest.mock('@/lib/chatbox/AnalysisService', () => ({
  analysisService: {
    analyze: jest.fn(),
    findProviderForModel: jest.fn(() => ({
      id: 'test-provider',
      analyze: jest.fn()
    }))
  }
}));

// Mock settings utils
jest.mock('../utils/settings-utils', () => ({
  useChatboxSettings: () => ({
    getApiKey: jest.fn(() => 'test-key'),
    saveApiKey: jest.fn(),
    getLastConfig: jest.fn(() => ({})),
    saveLastConfig: jest.fn()
  }),
  ChatboxSettingsManager: {
    getSystemPromptConfig: jest.fn(() => ({
      enabled: false,
      prompt: '',
      isCustom: false,
      lastModified: new Date().toISOString()
    })),
    saveSystemPromptConfig: jest.fn()
  }
}));

// Mock validation utils
jest.mock('../utils/validation-utils', () => ({
  validateAnalysisConfig: jest.fn(() => ({ isValid: true, errors: {} }))
}));

// Mock profile data
jest.mock('@/data/mockProfiles', () => ({
  getMockProfile: jest.fn(() => ({
    profile: { profileType: 'test' },
    experience: [],
    skillset: { categories: [] },
    metadata: { lastModified: new Date().toISOString() }
  }))
}));

describe('System Prompt Integration', () => {
  const renderWithProvider = (children: React.ReactNode) => {
    return render(
      <ChatboxProvider>
        {children}
      </ChatboxProvider>
    );
  };

  it('integrates system prompt section into controls', () => {
    renderWithProvider(<ChatboxControls />);
    
    expect(screen.getByText('System Prompt')).toBeInTheDocument();
  });

  it('shows custom prompt indicator when prompt is active', async () => {
    renderWithProvider(<ChatboxControls />);
    
    // Expand system prompt section
    fireEvent.click(screen.getByText('System Prompt'));
    
    // Add a custom prompt
    const textarea = screen.getByPlaceholderText(/Define how the AI should behave/);
    fireEvent.change(textarea, { target: { value: 'You are a test analyst.' } });
    
    await waitFor(() => {
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });
  });

  it('maintains prompt state across expand/collapse', async () => {
    renderWithProvider(<ChatboxControls />);
    
    // Expand and set prompt
    fireEvent.click(screen.getByText('System Prompt'));
    const textarea = screen.getByPlaceholderText(/Define how the AI should behave/);
    fireEvent.change(textarea, { target: { value: 'You are a test analyst.' } });
    
    // Collapse
    fireEvent.click(screen.getByText('System Prompt'));
    
    // Expand again
    fireEvent.click(screen.getByText('System Prompt'));
    
    await waitFor(() => {
      const textareaAgain = screen.getByPlaceholderText(/Define how the AI should behave/);
      expect(textareaAgain).toHaveValue('You are a test analyst.');
    });
  });

  it('shows prompt preview when collapsed with active prompt', async () => {
    renderWithProvider(<ChatboxControls />);
    
    // Expand and set prompt
    fireEvent.click(screen.getByText('System Prompt'));
    const textarea = screen.getByPlaceholderText(/Define how the AI should behave/);
    fireEvent.change(textarea, { target: { value: 'You are a professional career analyst providing detailed insights.' } });
    
    // Collapse
    fireEvent.click(screen.getByText('System Prompt'));
    
    await waitFor(() => {
      expect(screen.getByText(/You are a professional career analyst/)).toBeInTheDocument();
    });
  });
});